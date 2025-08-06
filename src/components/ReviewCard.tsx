import parse from 'html-react-parser';

interface ReviewCardProps {
  review: string;
  starRating: number;
  username: string;
  date: string; 
}

function ReviewCard({ review, date, starRating, username }: ReviewCardProps){
  const reviewContent = parse(review);

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <div
        key={index}
        className="mask mask-star-2 bg-orange-400"
        aria-label={`${index + 1} star`}
        aria-current={index === starRating - 1 ? "true" : undefined}
      ></div>
    ));
  };
  
  return (
      <div className="card w-full bg-base-100 card-xs shadow-sm my-2">
      <div className="card-body">
        <h2 className="card-title">
          <div className="rating rating-xs sm:rating-sm">
            {renderStars()}
          </div>
          <div className="text-xs sm:text-sm">{username}</div>
          <div className="text-xs font-normal text-gray-500">{date}</div>
        </h2>
        <p className="line-clamp-3 md:text-sm">{reviewContent}</p>
      </div>
    </div>
  );
}
export default ReviewCard;