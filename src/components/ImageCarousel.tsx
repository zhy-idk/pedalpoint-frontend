import { useState, useRef } from "react";
import type { Product } from "../types/product";
import { apiBaseUrl } from "../api/index";
import PlaceholderIMG from "../assets/placeholder_img.jpg";

function ImageCarousel({ product }: { product?: Product }) {
  const [currentImage, setCurrentImage] = useState(1);
  const carouselRef = useRef<HTMLDivElement>(null);

  console.log("Placeholder path:", PlaceholderIMG);

  if (!product) {
    return null;
  }

  type ImageType = { image: string; alt_text: string };
  const getAllImages = (): ImageType[] => {
    let allImages: ImageType[] = [];

    // Combine product images and variant images (if they exist)
    if (product.images || product.variants?.some((v) => v.variant_images)) {
      const productImages =
        product.images?.map((img) => ({
          image: `${apiBaseUrl}${img.image}`,
          alt_text: img.alt_text,
        })) || [];

      const variantImages =
        product.variants?.flatMap(
          (variant) =>
            variant.variant_images?.map((img) => ({
              image: `${apiBaseUrl}${img.image}`,
              alt_text: img.alt_text,
            })) || [],
        ) || [];

      allImages = [...productImages, ...variantImages];
    }

    if (allImages.length === 0) {
      // Fallback to placeholder if no images exist
      allImages.push({
        image: `${PlaceholderIMG}`,
        alt_text: "Placeholder Image",
      });
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
        left: slideIndex * slideWidth,
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
              className="aspect-4/3 w-full bg-white object-contain"
              alt={imageObj.alt_text || `Image ${index + 1}`}
            />

            {totalImages > 1 && (
              <div className="absolute top-1/2 right-4 left-4 hidden -translate-y-1/2 transform justify-between lg:flex">
                <button
                  onClick={prevSlide}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-lg hover:bg-white"
                >
                  ❮
                </button>
                <button
                  onClick={nextSlide}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-lg hover:bg-white"
                >
                  ❯
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image Counter */}
      <div className="bg-base-200/65 absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-lg border-1 border-gray-300 px-2 text-sm">
        {currentImage}/{totalImages}
      </div>
    </div>
  );
}

export default ImageCarousel;
