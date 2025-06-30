import { Link } from 'react-router-dom';

function ItemCard() {
  return (
    <div className="card bg-base-100 w-full shadow-sm"> 
      <Link to="product/">
        <figure className="aspect-square overflow-hidden">
          <img
            src="https://supremebikes.ph/cdn/shop/products/TREK-MARLIN4GEN2-BLU-0W_fc88bb28-6f05-4c90-8e72-2b8e10f84fe3.jpg?v=1676431745"
            alt="Shoes" 
            className="h-full object-cover rounded-lg border-gray-300 border-1"/>
        </figure>
        <div className="card-body m-0 p-3">
          <h1 className="font-normal card-title text-[9px] line-clamp-2">This bike has an incredibly long name because I need to see what it looks like if an item has an unusually long name</h1>
          <div className="card-actions flex flex-wrap">
            <div className="badge badge-soft badge-xs px-1 py-0.5 text-[8px]">Category</div>
            <div className="badge badge-soft badge-xs px-1 py-0.5 text-[8px]">New</div>
            <div className="badge badge-soft badge-xs px-1 py-0.5 text-[8px]">Lorem</div>
          </div>
          <span className="font-medium text-[9px] ">₱100.00</span>
        </div>
      </Link>
    </div>
  );
}

export default ItemCard;