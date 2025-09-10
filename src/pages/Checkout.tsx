import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../providers/CartProvider";
import { useAuth } from "../hooks/useAuth";
import { getCSRFToken } from "../utils/csrf";
import {
  MapPin,
  Phone,
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

interface CheckoutFormData {
  shipping_address: string;
  contact_number: string;
  notes: string;
}

function Checkout() {
  const { state: cart, actions } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CheckoutFormData>({
    shipping_address: "",
    contact_number: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!cart || cart.items.length === 0) {
      navigate("/cart");
      return;
    }
  }, [isAuthenticated, cart, navigate]);

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
      const response = await fetch(`${getApiBaseUrl()}/api/cart/checkout/`, {
        method: "POST",
        credentials: "include",
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const orderData = await response.json();
      setOrderId(orderData.id);
      setOrderSuccess(true);

      // Refresh cart to clear it
      actions.fetchCart();
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
                <span>{cart?.totalItems || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-semibold">
                  ${cart?.totalPrice.toFixed(2) || "0.00"}
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
                    Payment Information
                  </h2>

                  <div className="alert alert-info">
                    <Truck className="h-4 w-4" />
                    <span>
                      Payment will be collected upon delivery (Cash on Delivery)
                    </span>
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
                    Processing Order...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Place Order
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

                {/* Cart Items */}
                <div className="mb-4 space-y-3">
                  {cart?.items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.product.sku}`}
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
                          ${(item.product.price * item.quantity).toFixed(2)}
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
                    <span>${cart?.totalPrice.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span className="text-success">Free</span>
                  </div>
                  <div className="divider"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">
                      ${cart?.totalPrice.toFixed(2) || "0.00"}
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
