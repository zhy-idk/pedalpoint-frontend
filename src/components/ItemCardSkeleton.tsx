function ItemCardSkeleton() {
  return (
    <div className="card bg-base-100 card-border w-full shadow-md "> 
      <figure className="aspect-square overflow-hidden rounded-lg shadow-sm skeleton"></figure>
      <div className="card-body m-0 p-3">
        <div className="max-w-20 h-2 rounded bg-base-300 my-1 skeleton"></div>
        <div className="card-actions flex flex-wrap my-1">
          <div className="flex-1 max-w-12 h-3 rounded bg-base-300 skeleton"></div>
          <div className="flex-1 max-w-18 h-3 rounded bg-base-300 skeleton"></div>
          <div className="flex-1 max-w-16 h-3 rounded bg-base-300 skeleton"></div>
        </div>
        <div className="max-w-17 h-2 rounded bg-base-300 my-1 skeleton"></div>
      </div>
    </div>
  );
}

export default ItemCardSkeleton;