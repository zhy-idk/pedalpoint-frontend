import { useState, useEffect, useMemo } from "react";
import ProductCard from "../../components/staff/ProductCard";
import ScannedItem from "../../components/staff/ScannedItem";
import { usePOS } from "../../providers/POSProvider";
import { useProducts } from "../../hooks/useProducts";
import { usePOSSales, type POSSaleData } from "../../hooks/usePOSSales";
import { useCSRF } from "../../hooks/useCSRF";
import PlaceholderIMG from "../../assets/placeholder_img.jpg";

function StaffPOS() {
  const { state, actions } = usePOS();
  const { data: productListings, isLoading, error } = useProducts();
  const { processSale, isLoading: isProcessingSale, error: saleError } = usePOSSales();
  const { csrfToken, fetchCSRFToken, isReady: csrfReady, error: csrfError } = useCSRF();
  const [searchQuery, setSearchQuery] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrPaymentData, setQrPaymentData] = useState<any>(null);
  const [qrPaymentError, setQrPaymentError] = useState<string | null>(null);
  const [qrSaleId, setQrSaleId] = useState<number | null>(null);
  const [qrSaleTotal, setQrSaleTotal] = useState<number | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  // Transform products for POS display - show individual products only
  const posProducts = useMemo(() => {
    if (!productListings) return [];

    return productListings.flatMap((listing: any) => {
      // Only show individual products, not listings
      if (listing.products && listing.products.length > 0) {
        return listing.products.map((product: any) => ({
          id: product.id,
          name: product.name,
          variant_attribute: product.variant_attribute || '',
          price: parseFloat(product.price),
          sku: product.sku,
          available: product.available,
          stock: product.stock ?? 0,
        }));
      }
      return [];
    });
  }, [productListings]);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return posProducts;
    
    const query = searchQuery.toLowerCase();
    return posProducts.filter((product) =>
      product.name.toLowerCase().includes(query) ||
      product.variant_attribute.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query)
    );
  }, [posProducts, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePayWithCash = () => {
    if (state.cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    
    setShowCashModal(true);
  };

  const handleConfirmCashPayment = async () => {
    const cash = parseFloat(cashReceived);
    
    if (isNaN(cash) || cash < state.total) {
      alert("Insufficient cash amount!");
      return;
    }
    
    await processPayment('cash');
    
    // Reset cash modal
    setCashReceived("");
    setShowCashModal(false);
  };

  const handlePayWithQRPH = () => {
    if (state.cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    setShowQRModal(true);
  };

  const handleStartQrphCheckout = async () => {
    if (state.cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    const origin = window.location.origin;
    const successUrl = `${origin}/staff/pos?payment=qrph-success`;
    const cancelUrl = `${origin}/staff/pos?payment=qrph-cancelled`;

    const result = await processPayment("qrph", {
      keepPaymentModalOpen: false,
      suppressSuccessAlert: true,
      suppressFailureAlert: true,
      extraData: {
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
    });

    if (result?.checkout_url) {
      const checkoutWindow = window.open(result.checkout_url, "_blank");
      if (!checkoutWindow) {
        alert(
          "Popup blocked. Please allow popups for this site to open the PayMongo checkout.",
        );
      } else {
        checkoutWindow.focus();
      }
      alert(
        "QR Ph checkout generated. Ask the customer to complete payment in the PayMongo window.",
      );
      setShowPaymentModal(false);
    } else if (result) {
      alert("Unable to retrieve the PayMongo checkout URL. Please try again.");
    } else if (saleError) {
      alert(`Failed to start QR Ph checkout: ${saleError}`);
    } else {
      alert("Failed to start QR Ph checkout. Please try again.");
    }
  };

  const processPayment = async (
    paymentMethod: string,
    options?: {
      keepPaymentModalOpen?: boolean;
      suppressSuccessAlert?: boolean;
      suppressFailureAlert?: boolean;
      extraData?: Record<string, unknown>;
    },
  ) => {
    if (state.cart.length === 0) {
      alert("Cart is empty!");
      return null;
    }

    // Prepare sale data
    const saleData: POSSaleData = {
      items: state.cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      })),
      payment_method: paymentMethod,
      customer_name: customerName || 'Walk-in Customer',
      customer_contact: customerContact || ''
    };

    if (options?.extraData) {
      Object.assign(saleData, options.extraData);
    }

    console.log('Cart items:', state.cart);
    console.log('Sale data being sent:', saleData);

    // Process the sale
    const result = await processSale(saleData);
    
    if (result) {
      if (!options?.suppressSuccessAlert) {
        alert(
          `Sale completed successfully!\nSale #${result.sale_id}\nTotal: ₱${result.total_amount.toFixed(
            2,
          )}`,
        );
      }
      actions.clearCart();
      setCustomerName("");
      setCustomerContact("");
      if (!options?.keepPaymentModalOpen) {
        setShowPaymentModal(false);
      }
    } else if (!options?.suppressFailureAlert) {
      alert(`Sale failed: ${saleError || "Unknown error"}`);
    }
    return result;
  };

  const handleGenerateQRPayment = async () => {
    if (state.cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    setIsGeneratingQR(true);
    setQrPaymentError(null);
    setQrPaymentData(null);

    const result = await processPayment("qrph", {
      keepPaymentModalOpen: true,
      suppressSuccessAlert: true,
      suppressFailureAlert: true,
    });

    if (result && (result as any).qrph) {
      setQrPaymentData((result as any).qrph);
      setQrSaleId(result.sale_id ?? null);
      setQrSaleTotal(result.total_amount ?? null);
    } else if (result) {
      setQrPaymentError("QR Ph details were not returned. Please try again.");
    } else {
      setQrPaymentError(saleError || "Failed to generate QR Ph payment. Please try again.");
    }

    setIsGeneratingQR(false);
  };

  const handleCloseQRModal = () => {
    if (isProcessingSale || isGeneratingQR) return;
    setShowPaymentModal(false);
    setQrPaymentData(null);
    setQrPaymentError(null);
    setQrSaleId(null);
    setQrSaleTotal(null);
  };

  const handleSetAsPaid = async () => {
    if (state.cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    
    const result = await processPayment("qrph", {
      keepPaymentModalOpen: false,
      suppressSuccessAlert: false,
      suppressFailureAlert: false,
    });
    
    if (result) {
      setShowQRModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-error">Error loading products: {error.message}</div>
      </div>
    );
  }

  if (!csrfReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-warning">Loading CSRF token...</div>
      </div>
    );
  }

  if (csrfError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-error">CSRF Error: {csrfError}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-row">
      {/*Left Side - Products*/}
      <div className="bg-base-200 mr-3 flex h-screen flex-1 flex-col rounded-md">
        <div className="px-3 pt-3">
          <label className="input input-xl w-full">
            <svg
              className="h-[1em] opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="search"
              placeholder="Search product"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 overflow-y-auto p-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/*Right Side - Cart*/}
      <div className="bg-base-200 flex h-screen w-120 flex-col rounded-md p-3">
        <h2 className="text-4xl font-medium">Items</h2>
        <div className="flex h-full flex-col gap-2 overflow-y-auto rounded-md p-1">
          {state.cart.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No items in cart
            </div>
          ) : (
            state.cart.map((item) => (
              <ScannedItem key={item.id} item={item} />
            ))
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row">
            <h3 className="flex-1 text-2xl font-medium">Total:</h3>
            <span className="text-2xl font-medium">₱{state.total.toFixed(2)}</span>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handlePayWithCash}
            disabled={state.cart.length === 0 || isProcessingSale}
          >
            {isProcessingSale ? (
              <div className="loading loading-spinner loading-sm"></div>
            ) : (
              'Pay with cash'
            )}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handlePayWithQRPH}
            disabled={state.cart.length === 0 || isProcessingSale}
          >
            Pay with QR Ph
          </button>
        </div>
      </div>

      {/* Cash Payment Modal */}
      {showCashModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Cash Payment</h3>
            
            <div className="mb-4">
              <div className="bg-base-200 p-4 rounded-lg mb-4">
                <p className="text-sm text-base-content/70 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-primary">₱{state.total.toFixed(2)}</p>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Cash Received</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input input-bordered input-lg text-right"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                />
              </div>

              {cashReceived && !isNaN(parseFloat(cashReceived)) && (
                <div className="bg-success/10 p-4 rounded-lg">
                  <p className="text-sm text-base-content/70 mb-1">Change</p>
                  <p className="text-3xl font-bold text-success">
                    ₱{Math.max(0, parseFloat(cashReceived) - state.total).toFixed(2)}
                  </p>
                </div>
              )}

              {cashReceived && !isNaN(parseFloat(cashReceived)) && parseFloat(cashReceived) < state.total && (
                <div className="alert alert-warning mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Insufficient amount! Need ₱{(state.total - parseFloat(cashReceived)).toFixed(2)} more.</span>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={handleConfirmCashPayment}
                disabled={isProcessingSale || !cashReceived || isNaN(parseFloat(cashReceived)) || parseFloat(cashReceived) < state.total}
              >
                {isProcessingSale ? (
                  <div className="loading loading-spinner loading-sm"></div>
                ) : (
                  'Confirm Payment'
                )}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowCashModal(false);
                  setCashReceived("");
                }}
                disabled={isProcessingSale}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-2">QR Ph Payment</h3>
            <p className="text-sm text-base-content/70 mb-4">
              Enter optional customer details, then start a PayMongo QR Ph checkout. A new
              tab will open where the customer can complete the payment.
            </p>
            
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Customer Name (Optional)</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Contact Number (Optional)</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
                placeholder="Enter contact number"
              />
            </div>

            <div className="mb-4">
              <p className="text-lg font-medium">Total: ₱{state.total.toFixed(2)}</p>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={handleStartQrphCheckout}
                disabled={isProcessingSale}
              >
                {isProcessingSale ? (
                  <div className="loading loading-spinner loading-sm"></div>
                ) : (
                  'Start QR Ph Checkout'
                )}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessingSale}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">Scan QR Code to Pay</h3>
            
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <img 
                  src="data:image/png;base64,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" 
                  alt="QR Code" 
                  className="w-64 h-64"
                />
              </div>
              <p className="text-sm text-base-content/70 mt-4 text-center">
                Total Amount: <span className="font-bold text-lg">₱{state.total.toFixed(2)}</span>
              </p>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={handleSetAsPaid}
                disabled={isProcessingSale || state.cart.length === 0}
              >
                {isProcessingSale ? (
                  <div className="loading loading-spinner loading-sm"></div>
                ) : (
                  'Set as Paid'
                )}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setShowQRModal(false)}
                disabled={isProcessingSale}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffPOS;