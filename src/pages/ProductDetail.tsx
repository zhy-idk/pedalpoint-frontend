import Breadcrumbs from "../components/Breadcrumbs";
import ImageCarousel from "../components/ImageCarousel";
import QuantityInput from "../components/QuantityInput";
import ReviewCard from "../components/ReviewCard";
import StarFilter from "../components/StarFilter";
import CartLogo from "../assets/add_shopping_cart_24dp.svg";
import ChatButton from "../components/Chat";
import parse from "html-react-parser";
import PesoAmount from "../components/PesoAmount";

// Import the context system we created
import { ProductProvider } from "../providers/ProductProvider";
import {
  useCurrentProduct,
  useProductLoading,
  useProductError,
  useProductVariants,
  useSelectedVariant,
  useCurrentPrice,
  useCurrentStock,
  useProductActions,
  useFilteredReviews
} from "../hooks/useProductDetail";
import { useRecommendations } from "../hooks/useRecommendations";
import ItemCarousel from "../components/ItemCarousel";

// The main content component that uses our hooks
function ProductDetailContent() {
  const product = useCurrentProduct();           // Get the current product
  const loading = useProductLoading();           // Get loading state
  const error = useProductError();               // Get error state
  const variants = useProductVariants();         // Get all variants
  const selectedVariant = useSelectedVariant();  // Get currently selected variant
  const currentPrice = useCurrentPrice();       // Get current price (variant or product)
  const currentStock = useCurrentStock();       // Get current stock
  const filteredReviews = useFilteredReviews(); // Get filtered reviews
  
  // Get the functions we can call
  const { setVariant, addToCart, buyNow } = useProductActions();

  // Get recommendations based on product category
  const { recommendations, isLoading: recommendationsLoading, error: recommendationsError } = useRecommendations(product?.category?.slug || "");

  const desc = parse(product?.description || "");

  // Show loading spinner while fetching
  if (loading) {
    return (
      <div className="bg-base-100 p-3 mx-3 rounded-sm xs:mx-[clamp(0.75rem,6vw,7.5rem)] lg:mx-30 shadow-xl">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
          <span className="ml-2">Loading product...</span>
        </div>
      </div>
    );
  }

  // Show error if something went wrong
  if (error) {
    return (
      <div className="bg-base-100 p-3 mx-3 rounded-sm xs:mx-[clamp(0.75rem,6vw,7.5rem)] lg:mx-30 shadow-xl">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Show message if no product found
  if (!product) {
    return (
      <div className="bg-base-100 p-3 mx-3 rounded-sm xs:mx-[clamp(0.75rem,6vw,7.5rem)] lg:mx-30 shadow-xl">
        <div className="text-center py-8">Product not found</div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-3 mx-3 rounded-sm xs:mx-[clamp(0.75rem,6vw,7.5rem)] lg:mx-30 shadow-xl">
      {/* Breadcrumbs Section */}
      <Breadcrumbs category={product.category} productName={product.name} />

      {/* Product Image Carousel Section */}
      <div className="flex flex-col border-b-1 border-gray-600 mb-2 xl:pb-4 xl:flex-row">
        <div className="flex flex-col items-center xl:basis-2/5">
          <div className="md:max-w-150 ">
            <ImageCarousel product={product} />
          </div>
        </div>

        <div className="xl:ml-10 xl:basis-3/5">
          {/* Product Title and Price Section */}
          <div>
            <h1 className="text-xl font-bold md:text-2xl xl:text-3xl">
              {product.name}
            </h1>
            {/* Price now comes from our hook - it automatically picks variant price or product price */}
            <PesoAmount
              className="text-lg my-4 md:text-xl"
              amount={currentPrice}
            />
          </div>
          
          {/* Category tags section */}
          <div className="flex gap-2 my-2">
            <div className="badge badge-soft badge-outline badge-sm sm:badge-md">
              {product.category.name}
            </div>
            <div className="badge badge-soft badge-outline badge-sm sm:badge-md">
              {product.brand.name}
            </div>
          </div>

          <div className="py-2">
            <div className="mb-2">
              <div className="mb-3">
                {/* Stock now comes from our hook */}
                <span>
                  Stock: {currentStock}
                  {selectedVariant && (
                    <span className="text-sm text-base-content/70 ml-2">({selectedVariant.variant_attribute})</span>
                  )}
                </span>
              </div>

              <div className="flex flex-row items-center">
                {/* Variant Selection - only show if there are multiple variants */}
                {product.products.length > 1 && (
                  <>
                    <label>Variants:</label>
                    <details className="dropdown">
                      <summary className="btn btn-neutral mx-2">
                        {selectedVariant?.variant_attribute || "Select Variant"}
                      </summary>
                      <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                        {product.products.map((variant) => (
                          <li key={variant.id}>
                            <a onClick={() => setVariant(variant)}>
                              {variant.variant_attribute} - ₱{variant.price}
                              {variant.stock === 0 && " (Out of Stock)"}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </>
                )}
                
                {/* Show selected variant info when there's only one variant */}
                {product.products.length === 1 && (
                  <div className="flex items-center">
                    <label className="mr-2">Variant:</label>
                    <span className="badge badge-neutral">{product.products[0].variant_attribute}</span>
                  </div>
                )}
              </div>

              {/* Quantity Input Section - only enabled when variant is selected */}
              <div className="mt-3 mb-5">
                <label>Quantity: </label>
                <QuantityInput maxStock={selectedVariant ? currentStock : 0} />
                {!selectedVariant && product.products.length > 1 && (
                  <p className="text-sm text-warning mt-1">Please select a variant to continue</p>
                )}
              </div>
            </div>

            {/* Action Buttons Section - now connected to real functions */}
            <div className="max-w-screen">
              <button 
                className="btn btn-primary w-full my-1"
                onClick={addToCart}
                disabled={!selectedVariant || currentStock === 0}
              >
                <img src={CartLogo} alt="Cart Logo" />
                {!selectedVariant ? "Select Variant First" : currentStock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
              <button 
                className="btn btn-secondary w-full my-1"
                onClick={buyNow}
                disabled={!selectedVariant || currentStock === 0}
              >
                {!selectedVariant ? "Select Variant First" : currentStock === 0 ? "Out of Stock" : "Buy Now"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description Section */}
      <div>
        <h2 className="font-medium mb-2 md:text-lg">Description</h2>
        <div className="text-xs sm:text-sm prose">{desc}</div>
      </div>

      {/* User Reviews Section */}
      <div className="flex flex-col border-y-1 border-gray-600 my-4 py-2">
        <div className="border-b-1 border-gray-600 w-full items-center pb-2">
          <div className="flex flex-col sm:flex-row">
            <div className="flex items-center py-1">
              <div className="font-medium">4.6</div>
              <div className="rating rating-xs items-center ml-1 mr-2">
                <div
                  className="mask mask-star-2 bg-orange-400"
                  aria-current="true"
                ></div>
              </div>
              <div className="font-medium">
                User Reviews ({product.reviews?.length || 0})
              </div>
            </div>

            {/* Star Filter Section */}
            <div className="sm:ml-2">
              <StarFilter />
            </div>
          </div>
        </div>

        {/* Review Section - now uses filtered reviews */}
        {filteredReviews && filteredReviews.length > 0 ? (
          filteredReviews.map((review, index) => (
            <ReviewCard
              key={index}
              review={review.review}
              starRating={review.star}
              date={review.date}
              username={review.user.username}
            />
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">No reviews yet</div>
        )}

        {/* Review Pagination */}
        <div className="join justify-center">
          <input
            className="join-item btn btn-xs btn-square md:btn-sm"
            type="radio"
            name="options"
            aria-label="1"
            defaultChecked
          />
          <input
            className="join-item btn btn-xs btn-square md:btn-sm"
            type="radio"
            name="options"
            aria-label="2"
          />
          <input
            className="join-item btn btn-xs btn-square md:btn-sm"
            type="radio"
            name="options"
            aria-label="3"
          />
          <input
            className="join-item btn btn-xs btn-square md:btn-sm"
            type="radio"
            name="options"
            aria-label="4"
          />
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations && recommendations.length > 0 && (
        <div className="my-6">
          <ItemCarousel 
            products={recommendations} 
            title="You might also like"
          />
        </div>
      )}
      
      {/* Show loading state for recommendations */}
      {recommendationsLoading && (
        <div className="my-6">
          <h3 className="font-medium md:text-lg mb-4">You might also like</h3>
          <div className="flex gap-2 overflow-x-auto">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-32 h-40 bg-base-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      )}
      
      {/* Show error state for recommendations */}
      {recommendationsError && (
        <div className="my-6">
          <div className="alert alert-warning">
            <span>Unable to load recommendations at this time.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// The main component that wraps everything with the ProductProvider
function ProductDetail() {
  return (
    <ProductProvider>
      <ProductDetailContent />
    </ProductProvider>
  );
}

export default ProductDetail;