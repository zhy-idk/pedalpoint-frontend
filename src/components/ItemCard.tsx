import { Link } from 'react-router-dom';
import { apiBaseUrl } from '../api/index';
import type { Product } from '../types/product';
import PesoAmount from './PesoAmount';
import PlaceholderIMG from "../assets/placeholder_img.jpg";

interface ItemCardProps {
  product: Product;
}

function ItemCard({ product } : ItemCardProps) {
  return (
    <div className="card bg-base-100 card-border w-full shadow-md"> 
      <Link to={`/product/${product.slug}`}>
        <figure className="aspect-square overflow-hidden rounded-lg shadow-sm">
          <img
            src={product.image ? `${apiBaseUrl}${product.image}` : PlaceholderIMG}
            alt="Shoes" 
            className="h-full object-cover "/>
        </figure>
        <div className="card-body m-0 p-3">
          <h1 className="font-normal card-title text-[10px] line-clamp-2 xs:text-xs md:text-sm">{product.name}</h1>
          <div className="card-actions flex flex-wrap">
            <div className="badge badge-soft badge-outline badge-xs px-1 py-0.5 text-[9px] xs:text-[10px] md:badge-sm">Category</div>
            <div className="badge badge-soft badge-outline badge-xs px-1 py-0.5 text-[9px] xs:text-[10px] md:badge-sm">New</div>
            <div className="badge badge-soft badge-outline badge-xs px-1 py-0.5 text-[9px] xs:text-[10px] md:badge-sm">Lorem</div>
          </div>
          <PesoAmount className='font-medium text-[10px] xs:text-xs md:text-sm' amount={product.price}/>
        </div>
      </Link>
    </div>
  );
}

export default ItemCard;