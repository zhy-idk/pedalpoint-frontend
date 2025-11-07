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

  type ImageType = { image: string; alt_text: string; isThumbnail?: boolean };
  
  // Helper function to get proper image URL
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath || imagePath.trim() === "") {
      return PlaceholderIMG;
    }
    // If it's already a full URL (starts with http:// or https://), use it directly
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Otherwise, prepend the API base URL
    return `${apiBaseUrl}${imagePath}`;
  };

  const getAllImages = (): ImageType[] => {
    let allImages: ImageType[] = [];

    console.log("=== ImageCarousel Debug ===");
    console.log("Product:", product);
    console.log("Product images:", product.images);
    console.log("Product products (variants):", product.products);

    // First, add the main product image/thumbnail if it exists
    if (product.image && product.image.trim() !== "") {
      const mainImage = {
        image: getImageUrl(product.image),
        alt_text: "Main Product Image",
        isThumbnail: true,
      };
      allImages.push(mainImage);
      console.log("Added main image:", mainImage);
    }

    // Then, add product images if they exist
    if (product.images && product.images.length > 0) {
      const productImages = product.images.map((img) => ({
        image: getImageUrl(img.image),
        alt_text: img.alt_text || "Product Image",
        isThumbnail: false,
      }));
      allImages = [...allImages, ...productImages];
      console.log("Added main product images:", productImages);
    }

    // Finally, add variant images from the products array
    if (product.products && product.products.length > 0) {
      const variantImages = product.products.flatMap(
        (variant) =>
          variant.product_images?.map((img) => ({
            image: getImageUrl(img.image),
            alt_text:
              img.alt_text || `${variant.name} - ${variant.variant_attribute}`,
            isThumbnail: false,
          })) || [],
      );
      allImages = [...allImages, ...variantImages];
      console.log("Added variant images:", variantImages);
    }

    // Remove duplicates based on image URL
    const uniqueImages = allImages.filter(
      (img, index, self) =>
        index === self.findIndex((i) => i.image === img.image),
    );

    if (uniqueImages.length === 0) {
      // Fallback to placeholder if no images exist
      console.log("No images found, using placeholder");
      uniqueImages.push({
        image: PlaceholderIMG,
        alt_text: "Placeholder Image",
        isThumbnail: false,
      });
    }

    console.log("Final allImages array:", uniqueImages);
    console.log("=== End Debug ===");

    return uniqueImages;
  };

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

  const allImages = getAllImages();
  
  // Filter out thumbnail images - only show gallery images in the carousel
  const images = allImages.filter(img => !img.isThumbnail);
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
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                (e.target as HTMLImageElement).src = PlaceholderIMG;
              }}
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
      {totalImages > 1 && (
        <div className="bg-base-200/65 absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-lg border-1 border-gray-300 px-2 text-sm">
          {currentImage}/{totalImages}
        </div>
      )}
    </div>
  );
}

export default ImageCarousel;
