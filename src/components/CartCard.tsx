import { useState } from "react";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "../providers/CartProvider";
import type { CartItem } from "../types/cart";
import { apiBaseUrl } from "../api/index";
import PlaceholderIMG from "../assets/placeholder_img.jpg";

interface CartCardProps {
  item: CartItem;
}

function CartCard({ item }: CartCardProps) {
  const { actions } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  const handleRemoveClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = async () => {
    try {
      await actions.removeItem(item.product.id);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCancelRemove = () => {
    setShowConfirmDialog(false);
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-3 sm:p-4">
        {/* Mobile Layout (< 640px) - Stacked */}
        <div className="flex flex-col gap-3 sm:hidden">
          {/* Top Row: Image and Details */}
          <div className="flex gap-3">
            <img
              src={(() => {
                const image = item.product.product_listing.image;
                if (!image || image.trim() === '') {
                  return PlaceholderIMG;
                }
                
                if (image.startsWith('http://') || image.startsWith('https://')) {
                  return image;
                }
                
                if (image.startsWith('/src/') || image === PlaceholderIMG) {
                  return image;
                }
                
                return `${apiBaseUrl}${image}`;
              })()}
              alt={item.product.product_listing.name}
              className="w-20 h-20 flex-shrink-0 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = PlaceholderIMG;
              }}
            />

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">{item.product.product_listing.name}</h3>
              <p className="text-xs text-base-content/70 mb-1">{item.product.variant_attribute}</p>
              <p className="text-primary font-bold text-base">₱{item.product.price}</p>
            </div>
          </div>

          {/* Bottom Row: Quantity Controls and Remove */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                className="btn btn-xs btn-circle btn-outline"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
              >
                <Minus className="w-3 h-3" />
              </button>
              
              <span className="text-sm font-medium min-w-[2rem] text-center">
                {isUpdating ? (
                  <div className="loading loading-spinner loading-xs"></div>
                ) : (
                  item.quantity
                )}
              </span>
              
              <button
                className="btn btn-xs btn-circle btn-outline"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating || item.quantity >= item.product.stock}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">
                ₱{((typeof item.product.price === 'number' ? item.product.price : parseFloat(item.product.price)) * item.quantity).toFixed(2)}
              </span>
              <button
                className="btn btn-xs btn-circle btn-error btn-outline"
                onClick={handleRemoveClick}
                title="Remove item"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Tablet/Desktop Layout (>= 640px) - Horizontal */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Product Image */}
          <img
            src={(() => {
              const image = item.product.product_listing.image;
              if (!image || image.trim() === '') {
                return PlaceholderIMG;
              }
              
              if (image.startsWith('http://') || image.startsWith('https://')) {
                return image;
              }
              
              if (image.startsWith('/src/') || image === PlaceholderIMG) {
                return image;
              }
              
              return `${apiBaseUrl}${image}`;
            })()}
            alt={item.product.product_listing.name}
            className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = PlaceholderIMG;
            }}
          />

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base md:text-lg line-clamp-2 mb-1">{item.product.product_listing.name}</h3>
            <p className="text-xs sm:text-sm text-base-content/70 mb-1">SKU: {item.product.sku}</p>
            <p className="text-xs sm:text-sm text-base-content/70 mb-1">Variant: {item.product.variant_attribute}</p>
            <p className="text-primary font-bold text-base md:text-lg">₱{item.product.price}</p>
            <p className="text-xs text-base-content/60">In stock: {item.product.stock}</p>
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
              
              <span className="text-base md:text-lg font-medium min-w-[2rem] text-center">
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
            
            <p className="text-xs text-base-content/60 whitespace-nowrap">
              Total: ₱{((typeof item.product.price === 'number' ? item.product.price : parseFloat(item.product.price)) * item.quantity).toFixed(2)}
            </p>
          </div>

          {/* Remove Button */}
          <button
            className="btn btn-sm btn-circle btn-error btn-outline flex-shrink-0"
            onClick={handleRemoveClick}
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm sm:max-w-md">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Remove Item from Cart?</h3>
            <p className="py-2 text-sm sm:text-base">
              Are you sure you want to remove <span className="font-semibold">{item.product.product_listing.name}</span> 
              {item.product.variant_attribute && <span> ({item.product.variant_attribute})</span>} from your cart?
            </p>
            <div className="modal-action mt-4 sm:mt-6">
              <button 
                className="btn btn-ghost btn-sm sm:btn-md"
                onClick={handleCancelRemove}
              >
                Cancel
              </button>
              <button 
                className="btn btn-error btn-sm sm:btn-md"
                onClick={handleConfirmRemove}
              >
                Remove
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={handleCancelRemove}></div>
        </div>
      )}
    </div>
  );
}

export default CartCard;