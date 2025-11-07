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
        <div className="card-body p-4 sm:p-6">
          <div className="py-4 sm:py-8 text-center">
            <div className="loading loading-spinner loading-md sm:loading-lg mb-4"></div>
            <p className="text-xs sm:text-sm text-base-content/70">Calculating totals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 h-fit w-full shadow-xl">
      <div className="card-body p-4 sm:p-6">
        <h2 className="card-title mb-3 sm:mb-4 text-lg sm:text-xl">Order Summary</h2>

        {/* Cart Totals */}
        <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
          <div className="flex justify-between text-sm sm:text-base">
            <span className="text-base-content/80">Subtotal ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}):</span>
            <span className="font-medium">₱{cart.totalPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm sm:text-base">
            <span className="text-base-content/80">Shipping:</span>
            <span className="text-success font-medium">Free</span>
          </div>

          <div className="divider my-2 sm:my-3"></div>

          <div className="flex justify-between text-base sm:text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">₱{cart.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 sm:space-y-3">
          <button
            className="btn btn-primary btn-block btn-sm sm:btn-md"
            onClick={handleCheckout}
            disabled={cart.totalItems === 0}
          >
            Proceed to Checkout
          </button>

          <button
            className="btn btn-outline btn-block btn-sm sm:btn-md"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </button>
        </div>

        {/* Additional Info - Mobile */}
        <div className="mt-4 pt-4 border-t border-base-300 sm:hidden">
          <p className="text-xs text-base-content/60 text-center">
            Free shipping on all orders
          </p>
        </div>
      </div>
    </div>
  );
}

export default TotalCard;
