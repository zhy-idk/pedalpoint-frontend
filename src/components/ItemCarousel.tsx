import { useRef } from "react";
import ItemCard from "./ItemCard";
import type { Product } from "../types/product";

interface ItemCarouselProps {
  products: Product[];
  title?: string;
}

function ItemCarousel({ products, title = "Items you might also like" }: ItemCarouselProps) {
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

  // Show message if no products instead of returning null
  if (!products || products.length === 0) {
    return (
      <>
        <h3 className="font-medium md:text-lg">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No recommendations available at this time.</p>
        </div>
      </>
    );
  }

  return(
    <>
      <h3 className="font-medium md:text-lg">{title}</h3>
      <div className="relative overflow-auto flex">
        <div
          ref={carouselRef}
          className="carousel gap-1 py-2 mx-0 rounded-sm lg:mx-9"
        >
          {products.map((product) => (
            <div key={product.id} className="carousel-item snap-start" style={{ width: 'clamp(6.25rem, 20vw, 13rem)' }}>
              <ItemCard product={product} />
            </div>
          ))}
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