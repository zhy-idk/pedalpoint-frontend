import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import QuantityInput from "../components/QuantityInput";
import ItemCard from "../components/ItemCard";
import ReviewCard from "../components/ReviewCard";
import CartLogo from "../assets/add_shopping_cart_24dp.svg";

function Product() {
  const [currentImage, setCurrentImage] = useState(1);
  const [currentSize, setCurrentSize] = useState("XS");
  const [currentColor, setCurrentColor] = useState("Blue");
  const totalImages = 5;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const carousel = e.target as HTMLDivElement;
    const scrollLeft = carousel.scrollLeft;
    const itemWidth = carousel.offsetWidth;
    const newIndex = Math.round(scrollLeft / itemWidth) + 1;
    setCurrentImage(newIndex);
  };
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
    <div className="m-3">
      {/* Breadcrumbs Section */}
      <div className="breadcrumbs text-xs overflow-auto">
        <ul>
          <li><Link to="#" className="link">Home</Link></li>
          <li><Link to="#" className="link">Documents</Link></li>
          <li><Link to="#">This bike has an incredibly long name because I need to see what it looks like if an item has an unusually long name</Link></li>
        </ul>
      </div>
      
      {/* Product Image Carousel Section */}
      <div className="relative">
        <div className="carousel rounded-box border-gray-300 border-1" onScroll={handleScroll}>
          <div className="carousel-item w-full">
            <img
              src="https://voltbikes.co.uk/images/e-bikes/pulse-light-grey-xt-electric-bike.jpg"
              className="w-full object-contain"
              alt="Tailwind CSS Carousel component" />
          </div>
          <div className="carousel-item w-full">
            <img
              src="https://contents.mediadecathlon.com/p1574676/k$3be5882a1bce6c60c24269eb54c6af5f/riverside-100-hybrid-bike-matte-black-riverside-8550625.jpg?f=1920x0&format=auto"
              className="w-full"
              alt="Tailwind CSS Carousel component" />
          </div>
          <div className="carousel-item w-full">
            <img
              src="https://i5.walmartimages.com/seo/26-inch-Mountain-Bike-for-Men-Adult-Mens-Bike-with-21-Speed-Disc-Brakes_aea780b0-8cbb-4119-b8f1-05cf192f88e6.bfd903a4d9d5fd346c1db8c0280f18f5.jpeg"
              className="w-full"
              alt="Tailwind CSS Carousel component" />
          </div>
          <div className="carousel-item w-full">
            <img
              src="https://contents.mediadecathlon.com/p2020517/k$513fdeec0a658e3709b3e3f9b66b733b/riverside-100-20-kids-hybrid-bike-btwin-8733628.jpg?f=1920x0&format=auto"
              className="w-full"
              alt="Tailwind CSS Carousel component" />
          </div>
          <div className="carousel-item w-full">
            <img
              src="https://i5.walmartimages.com/seo/24-Hyper-Bicycles-Havoc-Mountain-Bike-Youth-Adult-Recommended-Ages-10-14-Years-Old-Black_39747aed-d61d-400a-a9b0-62ef5182f001.3fe80af3ddee72662d877afb6a2b8504.jpeg"
              className="w-full"
              alt="Tailwind CSS Carousel component" />
          </div>
        </div>
        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2 bg-base-200/65 rounded-lg border-1 border-gray-300 text-sm z-0">
          {currentImage}/{totalImages}
        </div>
      </div>

      {/* Product Title and Price Section */}
      <div>
        <h1 className="text-2xl font-bold">This bike has an incredibly long name because I need to see what it looks like if an item has an unusually long name</h1>
        <div className="text-lg my-4"><span>₱100.00</span></div>
      </div>
      {/* Category tags section */}
      <div className="flex gap-2 my-2">
        <div className="badge badge-soft badge-md">Category</div>
        <div className="badge badge-soft badge-md">New</div>
        <div className="badge badge-soft badge-md">Lorem</div>
      </div>

      <div className="border-t-1 border-b-1 border-gray-600 py-2 my-4" >
        <div className="mb-2">
        {/* Size Selection */}
        Sizes:
        <div className="dropdown dropdown-hover">
          <div tabIndex={0} role="button" className="btn m-1">{currentSize}</div>
          <ul tabIndex={0} className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
            <li><a onClick={() => setCurrentSize("XS")}>XS</a></li>
            <li><a onClick={() => setCurrentSize("S")}>S</a></li>
            <li><a onClick={() => setCurrentSize("M")}>M</a></li>
            <li><a onClick={() => setCurrentSize("L")}>L</a></li>
            <li><a onClick={() => setCurrentSize("XL")}>XL</a></li>
          </ul>
        </div>
        {/* Color Selection */}
        Colors:
        <div className="dropdown dropdown-hover"> 
          <div tabIndex={0} role="button" className="btn m-1">{currentColor}</div>
          <ul tabIndex={0} className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
            <li><a onClick={() => setCurrentColor("Blue")}>Blue</a></li>
            <li><a onClick={() => setCurrentColor("Red")}>Red</a></li>
            <li><a onClick={() => setCurrentColor("Green")}>Green</a></li>
            <li><a onClick={() => setCurrentColor("Black")}>Black</a></li>
            <li><a onClick={() => setCurrentColor("White")}>White</a></li>
          </ul>
        </div>

        {/* Quantity Input Section */}
        <div>
          <label className="">Quantity: </label>
          <QuantityInput />
        </div>
        </div> 

        {/* Action Buttons Section */}
        <div className="max-w-screen">
          <button className="btn btn-primary w-full my-1"><img src={CartLogo} alt="Cart Logo" />Add to Cart</button>
          <button className="btn btn-secondary w-full my-1">Buy Now</button>
        </div>
      </div>

      {/* Product Description Section */}
      <div className="prose prose-sm">
        <h2>Description</h2>
        <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Impedit eaque, officia dolorum mollitia similique ipsum deleniti quasi at ullam veritatis doloremque cum esse nisi nulla inventore rem saepe! Dicta, ea?
        Numquam esse saepe velit tempore, neque sapiente dicta, minima maxime in distinctio quis quidem molestias, sequi possimus. Amet consequuntur beatae tempore voluptates voluptate pariatur mollitia animi autem libero! Obcaecati, aperiam?
        Ratione cum sit maxime, sunt molestiae unde doloremque excepturi tempore ea dolorem eius est, adipisci reiciendis enim, culpa ipsum corrupti. Quibusdam cupiditate possimus hic sed! Suscipit quidem qui ab recusandae!
        Tempore eos rerum possimus atque repudiandae! Dolores eveniet, magni delectus consequatur exercitationem magnam tempora maxime! Aspernatur reprehenderit vero culpa in accusantium obcaecati inventore dicta veniam suscipit porro, sed repudiandae maxime?
        Error officia ipsa natus at autem sint inventore nisi molestias, quidem illum blanditiis facere facilis suscipit ad est aperiam id cupiditate asperiores mollitia ipsum, quisquam ut. Commodi ea placeat officia!</p>
      </div>

      {/* User Reviews Section */}
      <div className="flex flex-wrap border-y-1 border-gray-600 my-4 py-2">
        <div className="font-medium">5</div>
        <div className="rating rating-xs items-center ml-1 mr-2">
          <div className="mask mask-star bg-orange-400" aria-current="true"></div>
        </div>
        <div className="font-medium">User Reviews (10)</div>
        <ReviewCard />
        <ReviewCard />
        <ReviewCard />
      </div>

      {/* Item Suggestion Section */}
      <div className="my-2">
        <h3 className="font-medium">Items you might also like</h3>
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
      </div>
    </div>
  );
}
export default Product;