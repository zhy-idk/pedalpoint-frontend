import { useState, useRef } from "react";
import type { Product } from "../types/product";
import { apiBaseUrl } from '../api/index';
import PlaceholderIMG from "../assets/placeholder_img.jpg";

function ImageCarousel({ product } : {product?: Product}) {
  const [currentImage, setCurrentImage] = useState(1);
  const carouselRef = useRef<HTMLDivElement>(null);

  console.log("Placeholder path:", PlaceholderIMG)

  if (!product) {
    return null;
  }

  type ImageType = { image: string; alt_text: string };
  const getAllImages = (): ImageType[] => {
  let allImages: ImageType[] = [];
  
  // Combine product images and variant images (if they exist)
  if (product.images || product.variants?.some(v => v.variant_images)) {
    const productImages = product.images?.map(img => ({
      image: `${apiBaseUrl}${img.image}`,
      alt_text: img.alt_text
    })) || [];

    const variantImages = product.variants?.flatMap(variant => 
      variant.variant_images?.map(img => ({
        image: `${apiBaseUrl}${img.image}`,
        alt_text: img.alt_text
      })) || []
    ) || [];

    allImages = [...productImages, ...variantImages];
  } 

  if (allImages.length === 0) {
    // Fallback to placeholder if no images exist
    allImages.push({ image: `${PlaceholderIMG}`, alt_text: "Placeholder Image" });
  }
  
  return allImages;
};

console.log("All images:", getAllImages());

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

  const images = getAllImages();
  const totalImages = images.length;
  return (
    <div className="relative">
      <div 
        className="carousel rounded-box border-base-300 border-1 shadow-lg" 
        onScroll={handleScroll}
        ref={carouselRef}
      >
        {images.map((imageObj, index) => (
          
          
          <div key={index} className="carousel-item relative w-full">
            <img
              src={imageObj.image}
              className="w-full object-contain bg-white aspect-4/3"
              alt={imageObj.alt_text || `Image ${index + 1}`}
            />
            
            {totalImages > 1 && (
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 transform justify-between hidden lg:flex">
                <button 
                  onClick={prevSlide} 
                  className="bg-white/80 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                >
                  ❮
                </button>
                <button 
                  onClick={nextSlide} 
                  className="bg-white/80 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                >
                  ❯
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Image Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2 bg-base-200/65 rounded-lg border-1 border-gray-300 text-sm z-10">
        {currentImage}/{totalImages}
      </div>
    </div>
  );
}

export default ImageCarousel;