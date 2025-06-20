import { Link } from "react-router-dom";

function Cart () {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      <p className="text-gray-600 mb-6">You have no items in your cart.</p>
      <button className="btn btn-primary">
        <Link to="/">Continue Shopping</Link>
      </button>
    </div>
  );
}
export default Cart;