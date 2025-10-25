import { Link } from 'react-router-dom';
import { apiBaseUrl } from '../api/index';
import type { Product } from '../types/product';
import PesoAmount from './PesoAmount';
import PlaceholderIMG from "../assets/placeholder_img.jpg";

interface ItemCardProps {
  product: Product;
}

function ItemCard({ product } : ItemCardProps) {
  // Check if the image exists and is not blank
  // If it's a local placeholder path, use it directly
  // If it's an API image path, prepend the base URL
  const imageSrc = (() => {
    if (!product.image || product.image.trim() === '') {
      return PlaceholderIMG;
    }
    
    // Check if it's already a full URL or local path
    if (product.image.startsWith('http') || product.image.startsWith('/src/') || product.image === PlaceholderIMG) {
      return product.image;
    }
    
    // Otherwise, it's an API image path, so prepend the base URL
    return `${apiBaseUrl}${product.image}`;
  })();

  // Handle null/undefined category or brand
  const categorySlug = product.category?.slug || 'uncategorized';
  const categoryName = product.category?.name || 'Uncategorized';
  const brandName = product.brand?.name || 'Unknown Brand';

  return (
    <div className="card bg-base-100 card-border w-full shadow-md"> 
      <Link to={`/${categorySlug}/${product.slug}`}>
        <figure className="aspect-square overflow-hidden rounded-lg shadow-sm bg-white">
          <img
            src={imageSrc}
            alt={product.name || "Product Image"} 
            className="h-full w-full object-contain"/>
        </figure>
        <div className="card-body m-0 p-3">
          <h1 className="font-normal card-title text-[10px] line-clamp-2 xs:text-xs md:text-sm">{product.name}</h1>
          <div className="card-actions flex flex-wrap">
            <div className="badge badge-soft badge-outline badge-xs px-1 py-0.5 text-[9px] xs:text-[10px] md:badge-sm">
              {categoryName}
            </div>
            <div className="badge badge-soft badge-outline badge-xs px-1 py-0.5 text-[9px] xs:text-[10px] md:badge-sm">
              {brandName}
            </div>
          </div>
          <PesoAmount className='font-medium text-[10px] xs:text-xs md:text-sm' amount={product.price}/>
        </div>
      </Link>
    </div>
  );
}

export default ItemCard;