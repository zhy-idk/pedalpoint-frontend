import { useState, useEffect, useMemo } from "react";
import ProductCard from "../../components/staff/ProductCard";
import ScannedItem from "../../components/staff/ScannedItem";
import { usePOS } from "../../providers/POSProvider";
import { useProducts } from "../../hooks/useProducts";
import { usePOSSales } from "../../hooks/usePOSSales";
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
  const [qrPaymentData, setQrPaymentData] = useState<any>(null);
  const [qrPaymentError, setQrPaymentError] = useState<string | null>(null);
  const [qrSaleId, setQrSaleId] = useState<number | null>(null);
  const [qrSaleTotal, setQrSaleTotal] = useState<number | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

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
    setQrPaymentData(null);
    setQrPaymentError(null);
    setQrSaleId(null);
    setQrSaleTotal(null);
    setShowPaymentModal(true);
  };

  const processPayment = async (
    paymentMethod: string,
    options?: {
      keepPaymentModalOpen?: boolean;
      suppressSuccessAlert?: boolean;
      suppressFailureAlert?: boolean;
    },
  ) => {
    if (state.cart.length === 0) {
      alert("Cart is empty!");
      return null;
    }

    // Prepare sale data
    const saleData = {
      items: state.cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      })),
      payment_method: paymentMethod,
      customer_name: customerName || 'Walk-in Customer',
      customer_contact: customerContact || ''
    };

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
              Enter optional customer details, then generate a PayMongo QR Ph code for the
              customer to scan using their banking app.
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
              <p className="text-lg font-medium">
                Total: ₱{(qrSaleTotal ?? state.total).toFixed(2)}
              </p>
            </div>

            {qrPaymentError && (
              <div className="alert alert-error mb-4">
                <span>{qrPaymentError}</span>
              </div>
            )}

            {qrPaymentData && (
              <div className="bg-base-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-sm mb-2">
                  Sale #{qrSaleId ?? "—"} • Total ₱{(qrSaleTotal ?? state.total).toFixed(2)}
                </p>
                {qrPaymentData?.data?.attributes?.qr_code && (
                  <div className="flex flex-col items-center mb-4">
                    <img
                      src={`data:image/png;base64,${qrPaymentData.data.attributes.qr_code}`}
                      alt="QR Ph Code"
                      className="w-60 h-60 object-contain bg-white p-4 rounded-lg"
                    />
                    <p className="text-xs text-base-content/70 mt-2 text-center">
                      Ask the customer to scan this QR using their QR Ph-compatible banking app.
                    </p>
                  </div>
                )}
                {qrPaymentData?.data?.attributes?.qr_string && (
                  <div>
                    <label className="label">
                      <span className="label-text text-xs uppercase tracking-wide">
                        QR String
                      </span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered w-full text-xs"
                      rows={3}
                      readOnly
                      value={qrPaymentData.data.attributes.qr_string}
                    />
                  </div>
                )}
                <p className="text-xs text-base-content/60 mt-3">
                  Once the payment is confirmed in PayMongo, update the sale status accordingly.
                </p>
              </div>
            )}

            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={handleGenerateQRPayment}
                disabled={isProcessingSale || isGeneratingQR}
              >
                {isGeneratingQR ? (
                  <>
                    <div className="loading loading-spinner loading-sm"></div>
                    Generating...
                  </>
                ) : (
                  'Generate QR Ph Payment'
                )}
              </button>
              <button
                className="btn btn-outline"
                onClick={handleCloseQRModal}
                disabled={isProcessingSale || isGeneratingQR}
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