import { useCart } from "../providers/CartProvider";
import CartCard from "../components/CartCard";
import TotalCard from "../components/TotalCard";
import { useNavigate, Link } from "react-router-dom";

function Cart() {
  const { state: cart, actions } = useCart();
  const navigate = useNavigate();

  if (cart.loading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
        <div className="bg-base-100 rounded-lg shadow-sm p-6 sm:p-8">
          <div className="text-center py-8">
            <div className="loading loading-spinner loading-lg mb-4"></div>
            <h1 className="text-xl sm:text-2xl font-bold mb-4">Loading Cart...</h1>
            <p className="text-sm sm:text-base text-base-content/70">Please wait while we fetch your cart items</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
        <div className="bg-base-100 rounded-lg shadow-sm p-6 sm:p-8">
          <div className="text-center py-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">Your Cart</h1>
            <p className="text-sm sm:text-base text-base-content/70 mb-6">Your cart is empty</p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary btn-sm sm:btn-md"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
      {/* Page Title - Mobile Only */}
      <h1 className="text-xl font-bold mb-4 sm:hidden">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Cart Items Section */}
        <div className="flex-1 lg:w-0">
          {/* Desktop Title */}
          <h1 className="hidden sm:block text-2xl font-bold mb-4 sm:mb-6">Shopping Cart ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'})</h1>
          
          <div className="flex flex-col gap-3 sm:gap-4">
            {cart.items.map((item) => (
              <CartCard key={`${item.product.id}-${item.product.sku}`} item={item} />
            ))}
          </div>
        </div>

        {/* Order Summary Section - Sticky on Desktop */}
        <div className="w-full lg:w-96 lg:flex-shrink-0">
          <div className="lg:sticky lg:top-4">
            <TotalCard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
