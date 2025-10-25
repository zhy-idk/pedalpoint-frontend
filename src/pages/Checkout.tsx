import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../providers/CartProvider";
import { useAuth } from "../hooks/useAuth";
import { getCSRFToken } from "../utils/csrf";
import paymongoService from "../api/paymongo";
import { fetchUserInfo, UserData } from "../api/auth";
import {
  MapPin,
  Phone,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Banknote
} from "lucide-react";

interface CheckoutFormData {
  shipping_address: string;
  contact_number: string;
  notes: string;
  payment_method: string;
}

function Checkout() {
  const { state: cart, actions } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if this is a Buy Now flow
  const buyNowData = location.state as { 
    buyNow?: boolean; 
    product?: any; 
    quantity?: number;
    productListing?: any;
  } | null;

  const [formData, setFormData] = useState<CheckoutFormData>({
    shipping_address: "",
    contact_number: "",
    notes: "",
    payment_method: "online_payment", // default to online payment
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userDataLoading, setUserDataLoading] = useState(true);

  // Compute order items and totals (works for both cart and buy now)
  const orderItems = buyNowData?.buyNow && buyNowData.product
    ? [{
        product: buyNowData.product,
        quantity: buyNowData.quantity || 1,
      }]
    : cart?.items || [];

  const totalItems = buyNowData?.buyNow && buyNowData.quantity
    ? buyNowData.quantity
    : cart?.totalItems || 0;

  const totalPrice = buyNowData?.buyNow && buyNowData.product
    ? parseFloat(buyNowData.product.price) * (buyNowData.quantity || 1)
    : cart?.totalPrice || 0;

  // Redirect if not authenticated or (cart is empty AND not buy now)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Allow if Buy Now OR if cart has items
    if (!buyNowData?.buyNow && (!cart || cart.items.length === 0)) {
      navigate("/cart");
      return;
    }
  }, [isAuthenticated, cart, navigate, buyNowData]);

  // Fetch user info and populate form
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setUserDataLoading(true);
        const data = await fetchUserInfo();
        setUserData(data);
        
        // Populate form with user info if available
        if (data.user_info && data.user_info.length > 0) {
          const userInfo = data.user_info[0];
          setFormData(prev => ({
            ...prev,
            shipping_address: userInfo.address || "",
            contact_number: userInfo.contact_number || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setUserDataLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated]);

  const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl) return envUrl;

    const currentHost = window.location.hostname;
    const protocol = window.location.protocol;
    return `${protocol}//${currentHost}:8000`;
  };

  const getHeaders = () => {
    const csrfToken = getCSRFToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }

    return headers;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.shipping_address.trim()) {
      setError("Please enter your shipping address");
      return false;
    }

    if (!formData.contact_number.trim()) {
      setError("Please enter your contact number");
      return false;
    }

    // Basic phone number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.contact_number.replace(/[\s\-\(\)]/g, ""))) {
      setError("Please enter a valid contact number");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Determine endpoint and payload based on buy now or cart checkout
      const endpoint = buyNowData?.buyNow 
        ? `${getApiBaseUrl()}/api/cart/buy-now-checkout/`
        : `${getApiBaseUrl()}/api/cart/checkout/`;
      
      const payload = buyNowData?.buyNow
        ? {
            ...formData,
            product_id: buyNowData.product.id,
            quantity: buyNowData.quantity,
          }
        : formData;
      
      // First, create the order
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const orderData = await response.json();
      setOrderId(orderData.id);

      // Check payment method
      if (formData.payment_method === "cash_on_delivery") {
        // For COD, backend already cleared the cart (if cart checkout)
        setOrderSuccess(true);
        
        // Only refetch cart if it was a cart checkout (not buy now)
        if (!buyNowData?.buyNow) {
          await actions.fetchCart(); // Refetch cart to get empty cart from backend
        }
        
        // Redirect to order detail page after a short delay
        setTimeout(() => {
          navigate(`/orders/${orderData.id}`);
        }, 2000);
      } else {
        // Create PayMongo checkout session for online payments
        try {
          console.log('=== CREATING PAYMONGO CHECKOUT SESSION ===');
          
          // Prepare line items from cart or buyNow
          const lineItems = buyNowData?.buyNow && buyNowData.product
            ? [{
                name: `${buyNowData.product.name}${buyNowData.product.variant_attribute ? ` - ${buyNowData.product.variant_attribute}` : ''}`,
                amount: Math.round(parseFloat(buyNowData.product.price) * 100), // Convert to cents
                quantity: buyNowData.quantity || 1,
                currency: "PHP"
              }]
            : cart?.items.map(item => ({
                name: `${item.product.name}${item.product.variant_attribute ? ` - ${item.product.variant_attribute}` : ''}`,
                amount: Math.round(item.product.price * 100), // Convert to cents
                quantity: item.quantity,
                currency: "PHP"
              })) || [];

          // Prepare billing information
          const billingInfo = {
            name: `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() || 'Customer',
            email: userData?.email || '',
            phone: formData.contact_number,
          };

          // Create checkout session
          const checkoutSession = await paymongoService.createPayMongoCheckoutSession({
            orderId: orderData.id,
            billing: billingInfo,
            lineItems: lineItems,
            sendEmailReceipt: true,
          });

          console.log('Checkout Session Response:', checkoutSession);
          
          // Store checkout session ID in the backend
          try {
            await fetch(`${getApiBaseUrl()}/api/orders/${orderData.id}/update-status/`, {
              method: "PATCH",
              credentials: "include",
              headers: getHeaders(),
              body: JSON.stringify({
                paymongo_checkout_session_id: checkoutSession.data.id,
              }),
            });
          } catch (storeError) {
            console.warn('Failed to store checkout session ID:', storeError);
            // Don't fail the checkout process if storing the session ID fails
          }
          
          // Redirect to PayMongo checkout page
          const checkoutUrl = checkoutSession.data.attributes.checkout_url;
          if (checkoutUrl) {
            console.log('🔄 Redirecting to PayMongo checkout...');
            window.location.href = checkoutUrl;
          } else {
            setError('No checkout URL provided');
          }
          
        } catch (paymentError) {
          console.error("❌ Payment error:", paymentError);
          setError("Failed to initialize payment. Please try again.");
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to place order";
      setError(errorMessage);
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCart = () => {
    navigate("/cart");
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  if (orderSuccess) {
    return (
      <div className="bg-base-100 xs:mx-[clamp(0.75rem,6vw,7.5rem)] mx-3 flex flex-col items-center rounded-sm p-6 lg:mx-30">
        <div className="max-w-md text-center">
          <div className="mb-6">
            <CheckCircle className="text-success mx-auto mb-4 h-16 w-16" />
            <h1 className="text-success mb-2 text-3xl font-bold">
              Order Placed Successfully!
            </h1>
            <p className="text-base-content/70">
              Your order #{orderId} has been confirmed and will be processed
              shortly.
            </p>
          </div>

          <div className="bg-base-200 mb-6 rounded-lg p-4">
            <h3 className="mb-2 font-semibold">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-semibold">
                  ₱{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleContinueShopping}
              className="btn btn-primary btn-block"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="btn btn-outline btn-block"
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart?.loading) {
    return (
      <div className="bg-base-100 xs:mx-[clamp(0.75rem,6vw,7.5rem)] mx-3 flex flex-col items-center rounded-sm p-6 lg:mx-30">
        <div className="py-8 text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <h1 className="mb-4 text-2xl font-bold">Loading Checkout...</h1>
          <p className="text-base-content/70">
            Please wait while we prepare your order
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 xs:mx-[clamp(0.75rem,6vw,7.5rem)] mx-3 flex flex-col items-center rounded-sm p-6 lg:mx-30">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBackToCart}
            className="btn btn-ghost btn-sm mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-base-content/70">Complete your order details</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Information Display */}
              {userDataLoading ? (
                <div className="card bg-base-100 shadow-lg">
                  <div className="card-body">
                    <div className="flex items-center gap-3">
                      <div className="loading loading-spinner loading-sm"></div>
                      <span className="text-sm text-base-content/70">Loading account information...</span>
                    </div>
                  </div>
                </div>
              ) : userData ? (
                <div className="card bg-base-100 shadow-lg">
                  <div className="card-body">
                    <h2 className="card-title mb-4">
                      <CheckCircle className="h-5 w-5" />
                      Account Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-base-content/70">Name:</span>
                          <span className="text-sm">{userData.first_name} {userData.last_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-base-content/70">Email:</span>
                          <span className="text-sm">{userData.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-base-content/70">Username:</span>
                          <span className="text-sm">{userData.username}</span>
                        </div>
                      </div>
                      
                      {userData.user_info && userData.user_info.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-base-content/70" />
                            <span className="font-semibold text-sm text-base-content/70">Saved Address:</span>
                          </div>
                          <p className="text-sm ml-6">{userData.user_info[0].address}</p>
                          
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-base-content/70" />
                            <span className="font-semibold text-sm text-base-content/70">Saved Contact:</span>
                          </div>
                          <p className="text-sm ml-6">{userData.user_info[0].contact_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Shipping Information */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title mb-4">
                    <MapPin className="h-5 w-5" />
                    Shipping Information
                  </h2>

                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="floating-label">
                        <span className="label-text">Shipping Address *</span>
                        <textarea
                          name="shipping_address"
                          value={formData.shipping_address}
                          onChange={handleInputChange}
                          className="textarea textarea-bordered h-24"
                          placeholder="Enter your complete shipping address..."
                          required
                        />
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="floating-label">
                        <span className="label-text">Contact Number *</span>
                        <input
                          type="tel"
                          name="contact_number"
                          value={formData.contact_number}
                          onChange={handleInputChange}
                          className="input input-bordered"
                          placeholder="Enter your contact number"
                          required
                        />
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="floating-label">
                        <span className="label-text">
                          Order Notes (Optional)
                        </span>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          className="textarea textarea-bordered h-20"
                          placeholder="Any special instructions for your order..."
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title mb-4">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </h2>

                  <div className="flex flex-col gap-2">
                    {/* Online Payment Option */}
                    <label className="cursor-pointer">
                      <div className={`border rounded-lg p-4 transition-all ${
                        formData.payment_method === "online_payment" 
                          ? "border-primary bg-primary/5" 
                          : "border-base-300 hover:border-base-400"
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="payment_method"
                              value="online_payment"
                              checked={formData.payment_method === "online_payment"}
                              onChange={handleInputChange}
                              className="radio radio-primary"
                            />
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-5 w-5 text-primary" />
                              <span className="font-medium text-lg">Secure Online Payment</span>
                            </div>
                          </div>
                          <div className="badge badge-primary">Recommended</div>
                        </div>
                        {formData.payment_method === "online_payment" && (
                          <>
                            <p className="text-sm text-base-content/70 mt-3 ml-9">
                              Pay securely with multiple payment options including:
                            </p>
                            <div className="flex flex-wrap gap-2 my-3 ml-9">
                              <span className="badge badge-outline">Credit/Debit Cards</span>
                              <span className="badge badge-outline">GCash</span>
                              <span className="badge badge-outline">PayMaya</span>
                              <span className="badge badge-outline">Online Banking</span>
                              <span className="badge badge-outline">QR Ph</span>
                            </div>
                            {/* Payment Security Notice */}
                            <div className="alert alert-info">
                              <CheckCircle className="h-4 w-4" />
                              <div>
                                <div className="font-medium">Secure Payment Processing</div>
                                <div className="text-sm">
                                  Your payment is secured by PayMongo's 256-bit SSL encryption and PCI DSS compliance
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </label>

                    {/* Cash on Delivery Option */}
                    <label className="cursor-pointer">
                      <div className={`border rounded-lg p-4 transition-all ${
                        formData.payment_method === "cash_on_delivery" 
                          ? "border-primary bg-primary/5" 
                          : "border-base-300 hover:border-base-400"
                      }`}>
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="payment_method"
                            value="cash_on_delivery"
                            checked={formData.payment_method === "cash_on_delivery"}
                            onChange={handleInputChange}
                            className="radio radio-primary"
                          />
                          <div className="flex items-center space-x-2">
                            <Banknote className="h-5 w-5 text-primary" />
                            <span className="font-medium text-lg">Cash on Delivery</span>
                          </div>
                        </div>
                        {formData.payment_method === "cash_on_delivery" && (
                          <p className="text-sm text-base-content/70 mt-3 ml-9">
                            Pay with cash when your order is delivered to your doorstep. Please prepare exact amount if possible.
                          </p>
                        )}
                      </div>
                    </label>


                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="alert alert-error">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading loading-spinner loading-sm"></div>
                    {formData.payment_method === "cash_on_delivery" 
                      ? "Placing Order..." 
                      : "Creating Order..."}
                  </>
                ) : (
                  <>
                    {formData.payment_method === "cash_on_delivery" ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Place Order
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        Proceed to Payment
                      </>
                    )}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 sticky top-6 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">Order Summary</h2>

                {/* Order Items */}
                <div className="mb-4 space-y-3">
                  {orderItems.map((item, index) => (
                    <div
                      key={buyNowData?.buyNow ? `buynow-${item.product.id}` : `${item.product.id}-${item.product.sku}`}
                      className="flex items-center gap-3"
                    >
                      <div className="avatar">
                        <div className="h-12 w-12 rounded">
                          {item.product.images &&
                          item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0].image}
                              alt={
                                item.product.images[0].alt_text ||
                                item.product.name
                              }
                            />
                          ) : buyNowData?.buyNow && buyNowData.productListing?.image ? (
                            <img
                              src={buyNowData.productListing.image}
                              alt={buyNowData.productListing.name}
                            />
                          ) : (
                            <div className="bg-base-300 flex h-full w-full items-center justify-center">
                              <span className="text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">
                          {item.product.name}
                        </h4>
                        <p className="text-base-content/70 text-xs">
                          {item.product.variant_attribute}
                        </p>
                        <p className="text-xs">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ₱{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="divider"></div>

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₱{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span className="text-success">Free</span>
                  </div>
                  <div className="divider"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">
                      ₱{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
