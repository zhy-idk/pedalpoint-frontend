import { useState } from "react";

import Breadcrumbs from "../components/Breadcrumbs";
import ImageCarousel from "../components/ImageCarousel";
import QuantityInput from "../components/QuantityInput";
import ReviewCard from "../components/ReviewCard";
import StarFilter from "../components/StarFilter";
import ItemCarousel from "../components/ItemCarousel";

import CartLogo from "../assets/add_shopping_cart_24dp.svg";

function Product() {
  const [currentSize, setCurrentSize] = useState("XS");
  const [currentColor, setCurrentColor] = useState("Blue");

  return (
    <div className="bg-base-100 p-3 mx-3 rounded-sm xs:mx-5 md:mx-10 lg:mx-20">
      {/* Breadcrumbs Section */}
      <Breadcrumbs />

      {/* Product Image Carousel Section */}
      <div className="flex flex-col border-b-1 border-gray-600 mb-2 xl:pb-4 xl:flex-row items-center">
        <div className="md:max-w-150 xl:basis-2/5">
          <ImageCarousel />
        </div>
        
        <div className="xl:ml-10 xl:basis-3/5">
          {/* Product Title and Price Section */}
          <div>
            <h1 className="text-xl font-bold md:text-2xl xl:text-3xl">This bike has an incredibly long name because I need to see what it looks like if an item has an unusually long name</h1>
            <div className="text-lg my-4 md:text-xl"><span>₱100.00</span></div>
          </div>
          {/* Category tags section */}
          <div className="flex gap-2 my-2">
            <div className="badge badge-soft badge-outline badge-sm sm:badge-md">Category</div>
            <div className="badge badge-soft badge-outline badge-sm sm:badge-md">New</div>
            <div className="badge badge-soft badge-outline badge-sm sm:badge-md">Lorem</div>
          </div>

          <div className="py-2">
            <div className="mb-2">
              <div className="flex flex-row items-center">
                <div className="flex flex-row items-center basis-1/4">
                  {/* Size Selection */}
                  <label>Sizes:</label>
                  <details className="dropdown">
                    <summary className="btn btn-neutral mx-2">{currentSize}</summary>
                    <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                      <li><a onClick={() => setCurrentSize("XS")}>XS</a></li>
                      <li><a onClick={() => setCurrentSize("S")}>S</a></li>
                      <li><a onClick={() => setCurrentSize("M")}>M</a></li>
                      <li><a onClick={() => setCurrentSize("L")}>L</a></li>
                      <li><a onClick={() => setCurrentSize("XL")}>XL</a></li>
                    </ul>
                  </details>
                </div>
                <div className="flex flex-row items-center basis-1/4">
                  {/* Color Selection */}
                  <label>Colors:</label>
                  <details className="dropdown"> 
                    <summary className="btn btn-neutral mx-2">{currentColor}</summary>
                    <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                      <li><a onClick={() => setCurrentColor("Blue")}>Blue</a></li>
                      <li><a onClick={() => setCurrentColor("Red")}>Red</a></li>
                      <li><a onClick={() => setCurrentColor("Green")}>Green</a></li>
                      <li><a onClick={() => setCurrentColor("Black")}>Black</a></li>
                      <li><a onClick={() => setCurrentColor("White")}>White</a></li>
                    </ul>
                  </details>
                </div>
              </div>
              

              {/* Quantity Input Section */}
              <div className="my-5">
                <label>Quantity: </label>
                  <QuantityInput />
              </div>
            </div> 

            {/* Action Buttons Section */}
            <div className="max-w-screen">
              <button className="btn btn-primary w-full my-1"><img src={CartLogo} alt="Cart Logo" />Add to Cart</button>
              <button className="btn btn-secondary w-full my-1">Buy Now</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Description Section */}
      <div>
        <h2 className="font-medium mb-2 md:text-lg">Description</h2>
        <p className="text-xs sm:text-sm">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Impedit eaque, officia dolorum mollitia similique ipsum deleniti quasi at ullam veritatis doloremque cum esse nisi nulla inventore rem saepe! Dicta, ea?
        Numquam esse saepe velit tempore, neque sapiente dicta, minima maxime in distinctio quis quidem molestias, sequi possimus. Amet consequuntur beatae tempore voluptates voluptate pariatur mollitia animi autem libero! Obcaecati, aperiam?
        Ratione cum sit maxime, sunt molestiae unde doloremque excepturi tempore ea dolorem eius est, adipisci reiciendis enim, culpa ipsum corrupti. Quibusdam cupiditate possimus hic sed! Suscipit quidem qui ab recusandae!
        Tempore eos rerum possimus atque repudiandae! Dolores eveniet, magni delectus consequatur exercitationem magnam tempora maxime! Aspernatur reprehenderit vero culpa in accusantium obcaecati inventore dicta veniam suscipit porro, sed repudiandae maxime?
        Error officia ipsa natus at autem sint inventore nisi molestias, quidem illum blanditiis facere facilis suscipit ad est aperiam id cupiditate asperiores mollitia ipsum, quisquam ut. Commodi ea placeat officia!</p>
      </div>

      {/* User Reviews Section */}
      <div className="flex flex-col border-y-1 border-gray-600 my-4 py-2">
        <div className="border-b-1 border-gray-600 w-full items-center pb-2">
          <div className="flex flex-col sm:flex-row">

            <div className="flex items-center py-1">
              <div className="font-medium">4.6</div>
              <div className="rating rating-xs items-center ml-1 mr-2">
                <div className="mask mask-star bg-orange-400" aria-current="true"></div>
              </div>
              <div className="font-medium">User Reviews (10)</div>
            </div>

            {/* Star Filter Section */}
            <div className="sm:ml-2">
              <StarFilter />
            </div>

          </div>
        </div>
        <ReviewCard />
        <ReviewCard />
        <ReviewCard />
        <ReviewCard />
        <ReviewCard />

        {/* Review Pagination */}
        <div className="join justify-center">
          <input
            className="join-item btn btn-xs btn-square md:btn-sm"
            type="radio"
            name="options"
            aria-label="1"
            checked={true} />
          <input className="join-item btn btn-xs btn-square md:btn-sm" type="radio" name="options" aria-label="2" />
          <input className="join-item btn btn-xs btn-square md:btn-sm" type="radio" name="options" aria-label="3" />
          <input className="join-item btn btn-xs btn-square md:btn-sm" type="radio" name="options" aria-label="4" />
        </div>
      </div>

      {/* Item Suggestion Section */}
      <div className="my-2">
        <ItemCarousel />
      </div>
    </div>
  );
}
export default Product;