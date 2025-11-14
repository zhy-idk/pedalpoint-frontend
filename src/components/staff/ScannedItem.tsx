import AddSVG from "../../assets/add_24dp.svg?react";
import RemoveSVG from "../../assets/remove_24dp.svg?react";
import { usePOS } from '../../providers/POSProvider';

interface ScannedItemProps {
  item: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    sku?: string;
    stock: number;
  };
}

function ScannedItem({ item }: ScannedItemProps) {
  const { actions } = usePOS();

  const handleIncreaseQuantity = () => {
    if (item.quantity >= item.stock) {
      alert("Cannot exceed available stock.");
      return;
    }
    actions.updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (item.quantity > 1) {
      actions.updateQuantity(item.id, item.quantity - 1);
    } else {
      actions.removeFromCart(item.id);
    }
  };

  const totalPrice = item.price * item.quantity;

  return (
    <div className="bg-base-300 border-base-100 flex h-fit w-full flex-row rounded border-2 shadow-md">
      <div className="flex w-10 items-center justify-center">
        <span>x{item.quantity}</span>
      </div>
      <div className="border-base-100 line-clamp-3 flex-1 border-x-2 px-1">
        <span className="text-sm">
          {item.name}
        </span>
        {item.sku && (
          <div className="text-xs text-gray-500">SKU: {item.sku}</div>
        )}
        <div className="text-[0.65rem] text-gray-500">
          In cart: {item.quantity} / {item.stock}
        </div>
      </div>
      <div className="flex w-18 items-center justify-center">
        <span className="text-sm font-medium">₱{totalPrice.toFixed(2)}</span>
      </div>
      <div className="flex flex-col items-center justify-center px-1">
        <button 
          className="btn btn-neutral btn-square btn-sm rounded-none rounded-t-sm"
          onClick={handleIncreaseQuantity}
        >
          <AddSVG width={18} height={18} />
        </button>
        <button 
          className="btn btn-square btn-sm rounded-none rounded-b-sm"
          onClick={handleDecreaseQuantity}
        >
          <RemoveSVG width={18} height={18} />
        </button>
      </div>
    </div>
  );
}
export default ScannedItem;
