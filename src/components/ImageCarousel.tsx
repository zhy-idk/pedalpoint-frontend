import { useState, useRef } from "react";

function ImageCarousel() {
  const [currentImage, setCurrentImage] = useState(1);
  const totalImages = 5;
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const carousel = e.target as HTMLDivElement;
    const scrollLeft = carousel.scrollLeft;
    const itemWidth = carousel.offsetWidth;
    const newIndex = Math.round(scrollLeft / itemWidth) + 1;
    setCurrentImage(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: slideIndex * slideWidth
      });
    }
  };

  const nextSlide = () => {
    const nextIndex = currentImage === totalImages ? 0 : currentImage;
    goToSlide(nextIndex);
  };

  const prevSlide = () => {
    const prevIndex = currentImage === 1 ? totalImages - 1 : currentImage - 2;
    goToSlide(prevIndex);
  };


  return (
    <div className="relative">
      <div 
        className="carousel rounded-box border-base-300 border-1 shadow-lg" 
        onScroll={handleScroll}
        ref={carouselRef}
      >
        <div className="carousel-item relative w-full">
          <img
            src="https://voltbikes.co.uk/images/e-bikes/pulse-light-grey-xt-electric-bike.jpg"
            className="w-full object-contain"
            alt="Electric bike" />
          <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2 transform justify-between hidden lg:flex">
            <button onClick={prevSlide} className="btn btn-circle">❮</button>
            <button onClick={nextSlide} className="btn btn-circle">❯</button>
          </div>
        </div>
        <div className="carousel-item relative w-full">
          <img
            src="https://contents.mediadecathlon.com/p1574676/k$3be5882a1bce6c60c24269eb54c6af5f/riverside-100-hybrid-bike-matte-black-riverside-8550625.jpg?f=1920x0&format=auto"
            className="w-full object-contain"
            alt="Hybrid bike" />
          <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2 transform justify-between hidden lg:flex">
            <button onClick={prevSlide} className="btn btn-circle">❮</button>
            <button onClick={nextSlide} className="btn btn-circle">❯</button>
          </div>
        </div>
        <div className="carousel-item relative w-full">
          <img
            src="https://i5.walmartimages.com/seo/26-inch-Mountain-Bike-for-Men-Adult-Mens-Bike-with-21-Speed-Disc-Brakes_aea780b0-8cbb-4119-b8f1-05cf192f88e6.bfd903a4d9d5fd346c1db8c0280f18f5.jpeg"
            className="w-full object-contain"
            alt="Mountain bike" />
          <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2 transform justify-between hidden lg:flex">
            <button onClick={prevSlide} className="btn btn-circle">❮</button>
            <button onClick={nextSlide} className="btn btn-circle">❯</button>
          </div>
        </div>
        <div className="carousel-item relative w-full">
          <img
            src="https://contents.mediadecathlon.com/p2020517/k$513fdeec0a658e3709b3e3f9b66b733b/riverside-100-20-kids-hybrid-bike-btwin-8733628.jpg?f=1920x0&format=auto"
            className="w-full object-contain"
            alt="Kids bike" />
          <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2 transform justify-between hidden lg:flex">
            <button onClick={prevSlide} className="btn btn-circle">❮</button>
            <button onClick={nextSlide} className="btn btn-circle">❯</button>
          </div>
        </div>
        <div className="carousel-item relative w-full">
          <img
            src="https://i5.walmartimages.com/seo/24-Hyper-Bicycles-Havoc-Mountain-Bike-Youth-Adult-Recommended-Ages-10-14-Years-Old-Black_39747aed-d61d-400a-a9b0-62ef5182f001.3fe80af3ddee72662d877afb6a2b8504.jpeg"
            className="w-full object-contain"
            alt="Youth mountain bike" />
          <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2 transform justify-between hidden lg:flex">
            <button onClick={prevSlide} className="btn btn-circle">❮</button>
            <button onClick={nextSlide} className="btn btn-circle">❯</button>
          </div>
        </div>
      </div>
      
      {/* Image Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2 bg-base-200/65 rounded-lg border-1 border-gray-300 text-sm z-10">
        {currentImage}/{totalImages}
      </div>
    </div>
  );
}

export default ImageCarousel;