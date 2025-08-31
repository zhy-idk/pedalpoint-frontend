import { useState } from "react";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "../providers/CartProvider";
import type { CartItem } from "../types/cart";

interface CartCardProps {
  item: CartItem;
}

function CartCard({ item }: CartCardProps) {
  const { actions } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.stock) return;
    
    setIsUpdating(true);
    try {
      await actions.updateQuantity(item.product.id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      await actions.removeItem(item.product.id);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-4">
        <div className="flex items-center gap-4">
          {/* Product Image */}
          <img
            src={item.product.product_listing.image || '/src/assets/placeholder_img.jpg'}
            alt={item.product.product_listing.name}
            className="w-20 h-20 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/src/assets/placeholder_img.jpg';
            }}
          />

          {/* Product Details */}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{item.product.product_listing.name}</h3>
            <p className="text-sm text-base-content/70 mb-1">SKU: {item.product.sku}</p>
            <p className="text-sm text-base-content/70 mb-1">Variant: {item.product.name}</p>
            <p className="text-primary font-bold text-lg">${item.product.price}</p>
            <p className="text-xs text-base-content/60">Stock: {item.product.stock}</p>
          </div>

          {/* Quantity Controls */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <button
                className="btn btn-sm btn-circle btn-outline"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
              >
                <Minus className="w-3 h-3" />
              </button>
              
              <span className="text-lg font-medium min-w-[2rem] text-center">
                {isUpdating ? (
                  <div className="loading loading-spinner loading-xs"></div>
                ) : (
                  item.quantity
                )}
              </span>
              
              <button
                className="btn btn-sm btn-circle btn-outline"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating || item.quantity >= item.product.stock}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            
            <p className="text-xs text-base-content/60">
              Total: ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
            </p>
          </div>

          {/* Remove Button */}
          <button
            className="btn btn-sm btn-circle btn-error btn-outline"
            onClick={handleRemove}
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartCard;