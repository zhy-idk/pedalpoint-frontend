import { useCart } from "../providers/CartProvider";
import { useNavigate } from "react-router-dom";

function TotalCard() {
  const { state: cart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  if (cart.loading) {
    return (
      <div className="card bg-base-100 h-fit shadow-xl">
        <div className="card-body">
          <div className="py-8 text-center">
            <div className="loading loading-spinner loading-lg mb-4"></div>
            <p className="text-base-content/70">Calculating totals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 h-fit w-full shadow-xl">
      <div className="card-body">
        <h2 className="card-title mb-4 text-xl">Order Summary</h2>

        {/* Cart Totals */}
        <div className="mb-6 space-y-3">
          <div className="flex justify-between">
            <span>Items ({cart.totalItems}):</span>
            <span>${cart.totalPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping:</span>
            <span className="text-success">Free</span>
          </div>

          <div className="divider"></div>

          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">${cart.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            className="btn btn-primary btn-block"
            onClick={handleCheckout}
            disabled={cart.totalItems === 0}
          >
            Proceed to Checkout
          </button>

          <button
            className="btn btn-outline btn-block"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default TotalCard;
