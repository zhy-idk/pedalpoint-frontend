import { usePOS } from '../../providers/POSProvider';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    variant_attribute: string;
    price: number;
    sku?: string;
    available?: boolean;
    stock: number;
  };
}

function ProductCard({ product }: ProductCardProps) {
  const { state, actions } = usePOS();

  const handleAddToCart = () => {
    if (product.available === false || product.stock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    const existingItem = state.cart.find((item) => item.id === product.id);
    if (existingItem && existingItem.quantity >= existingItem.stock) {
      alert("Cannot add more than available stock.");
      return;
    }

    actions.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      sku: product.sku,
      stock: product.stock,
    });
  };

  return (
    <div 
      className={`card bg-base-300 border-base-100 aspect-square cursor-pointer flex-col border-1 shadow-md transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-105 ${
        product.available === false ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'
      }`}
      onClick={handleAddToCart}
    >
      <div className="m-2 flex h-full flex-col">
        <span className="line-clamp-4 text-sm font-medium break-words">
          {product.name}
        </span>
        {product.variant_attribute && (
          <span className="text-xs text-gray-600 mt-1">
            {product.variant_attribute}
          </span>
        )}
        <span className="text-xs text-gray-500 mt-1">
          Stock: {product.stock ?? 0}
        </span>
        <span className="mt-auto text-sm font-light">
          ₱{product.price.toFixed(2)}
        </span>
        {product.available === false && (
          <span className="text-xs text-red-500 font-medium">Out of Stock</span>
        )}
        {product.stock === 0 && product.available !== false && (
          <span className="text-xs text-red-500 font-medium">Out of Stock</span>
        )}
        {product.stock > 0 && (
          <span className="text-[0.6rem] text-base-content/60">
            {state.cart.find(item => item.id === product.id)?.quantity || 0} in cart / {product.stock} available
          </span>
        )}
      </div>
    </div>
  );
}
export default ProductCard;
