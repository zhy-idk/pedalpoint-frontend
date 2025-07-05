import { useRef } from "react";
import ItemCard from "./ItemCard";


function ItemCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: string) => {
    if (carouselRef.current) {
      const carousel = carouselRef.current;
      const firstCard = carousel.querySelector(".carousel-item");
      if (firstCard) {
        const cardWidth = (firstCard as HTMLElement).offsetWidth;
        const gap = 16; // gap-4 = 16px
        const scrollAmount = direction === "left" ? -(cardWidth + gap) : cardWidth + gap;

        carousel.scrollBy({
          left: scrollAmount
        });
      }
    }
  };

  return(
    <>
      <h3 className="font-medium md:text-lg">Items you might also like</h3>
      <div className="relative overflow-auto flex">
        <div
          ref={carouselRef}
          className="carousel gap-1 py-2 mx-0 rounded-sm lg:mx-9"
        >
          <div className="carousel-item snap-start" style={{ width: 'clamp(6.25rem, 20vw, 13rem)' }}>
            <ItemCard />
          </div>
          <div className="carousel-item snap-start" style={{ width: 'clamp(6.25rem, 20vw, 13rem)' }}>
            <ItemCard />
          </div>
          <div className="carousel-item snap-start" style={{ width: 'clamp(6.25rem, 20vw, 13rem)' }}>
            <ItemCard />
          </div>
          <div className="carousel-item snap-start" style={{ width: 'clamp(6.25rem, 20vw, 13rem)' }}>
            <ItemCard />
          </div>
          <div className="carousel-item snap-start" style={{ width: 'clamp(6.25rem, 20vw, 13rem)' }}>
            <ItemCard />
          </div>
          <div className="carousel-item snap-start" style={{ width: 'clamp(6.25rem, 20vw, 13rem)' }}>
            <ItemCard />
          </div>
          <div className="carousel-item snap-start" style={{ width: 'clamp(6.25rem, 20vw, 13rem)' }}>
            <ItemCard />
          </div>
          <div className="carousel-item snap-start" style={{ width: 'clamp(6.25rem, 20vw, 13rem)' }}>
            <ItemCard />
          </div>
          <div className="carousel-item snap-start" style={{ width: 'clamp(6.25rem, 20vw, 13rem)' }}>
            <ItemCard />
          </div>
        </div>


        {/* Left Button */}
        <button
          onClick={() => scrollCarousel("left")}
          className="hidden absolute left-0 inset-y-0 my-auto z-1 btn btn-square btn-sm border-1 hover:bg-base-200 hover:border-gray-300 hover:border-2 lg:flex"
        >
          ❮
        </button>

        {/* Right Button */}
        <button
          onClick={() => scrollCarousel("right")}
          className="hidden absolute right-0 inset-y-0 my-auto z-1 btn btn-square btn-sm border-1 hover:bg-base-200 hover:border-gray-300 hover:border-2 lg:flex"
        >
          ❯
        </button>
      </div>
    </>
  )
}
export default ItemCarousel