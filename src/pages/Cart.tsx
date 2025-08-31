import { useCart } from "../providers/CartProvider";
import CartCard from "../components/CartCard";
import TotalCard from "../components/TotalCard";
import { useNavigate, Link } from "react-router-dom";

function Cart() {
  const { state: cart, actions } = useCart();
  const navigate = useNavigate();

  if (cart.loading) {
    return (
      <div className="bg-base-100 xs:mx-[clamp(0.75rem,6vw,7.5rem)] mx-3 flex flex-col items-center rounded-sm p-3 lg:mx-30">
        <div className="text-center py-8">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <h1 className="text-2xl font-bold mb-4">Loading Cart...</h1>
          <p className="text-base-content/70">Please wait while we fetch your cart items</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-base-100 xs:mx-[clamp(0.75rem,6vw,7.5rem)] mx-3 flex flex-col items-center rounded-sm p-3 lg:mx-30">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
          <p className="text-base-content/70 mb-6">Your cart is empty</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 xs:mx-[clamp(0.75rem,6vw,7.5rem)] mx-3 flex flex-col items-center rounded-sm p-3 lg:flex-row lg:items-start xl:mx-30">
      <div className="flex flex-col gap-4 md:basis-3/5">
        {/* Cart Items */}
        {cart.items.map((item) => (
          <CartCard key={`${item.product.id}-${item.product.sku}`} item={item} />
        ))}
      </div>
      <div className="mt-5 flex w-full md:ml-5 md:basis-2/5 lg:mt-0">
        <TotalCard />
      </div>
    </div>
  );
}

export default Cart;
