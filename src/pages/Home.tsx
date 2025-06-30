import ItemCard from "../components/ItemCard";
import Hero from "../components/Hero";
import { useRef } from "react";

function Home() {
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
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <>
      <Hero />
      <div className="flex flex-col m-1 p-1 rounded-lg">
        <h1 className="text-sm font-medium">Best Selling Items</h1>
        {/* Mobile Carousel Section */}
        <div className="relative overflow-auto flex">
          
          {/* Carousel Wrapper */}
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

        {/* Desktop Grid Section */}
        <div className="grid grid-cols-2 gap-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <ItemCard />
          <ItemCard />
          <ItemCard />
          <ItemCard />
          <ItemCard />
          <ItemCard />
        </div>
      </div>
    </>
  );
}

export default Home;
