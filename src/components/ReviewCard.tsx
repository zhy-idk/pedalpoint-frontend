function ReviewCard(){
  return (
      <div className="card w-full bg-base-100 card-xs shadow-sm my-2">
      <div className="card-body">
        <h2 className="card-title">
          <div className="rating rating-xs sm:rating-sm">
            <div className="mask mask-star bg-orange-400" aria-label="1 star"></div>  
            <div className="mask mask-star bg-orange-400" aria-label="2 star"></div>
            <div className="mask mask-star bg-orange-400" aria-label="3 star"></div>
            <div className="mask mask-star bg-orange-400" aria-label="4 star"></div>
            <div className="mask mask-star bg-orange-400" aria-label="5 star" aria-current="true"></div>
          </div>
          <div className="text-xs sm:text-sm">Person 1</div>
        </h2>
        <p className="line-clamp-3 md:text-sm">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quae quod aliquid pariatur, cumque dolorum quidem asperiores magnam maiores voluptatibus reiciendis nostrum culpa excepturi repudiandae, at, voluptatem quasi modi. Quasi, saepe.</p>
      </div>
    </div>
  );
}
export default ReviewCard;