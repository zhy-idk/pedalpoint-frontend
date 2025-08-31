import ItemCard from "../components/ItemCard";
import Hero from "../components/Hero";
import Breadcrumbs from "../components/Breadcrumbs";
import { useProducts } from "../hooks/useProducts";
import ItemCardSkeleton from "../components/ItemCardSkeleton";
import type { ProductListing, Product } from "../types/product";
import PlaceholderIMG from "../assets/placeholder_img.jpg";

function Home() {
  const { data: productListings, isLoading, error } = useProducts();

  // Transform ProductListing to Product format for ItemCard compatibility
  const transformedProducts: Product[] =
    productListings?.map((listing: ProductListing) => {
      // Debug: Log the actual structure
      console.log("API Listing:", listing);
      console.log("Products array:", listing.products);

      // Use the main image from the listing, fallback to placeholder if blank
      let defaultImage = PlaceholderIMG;
      if (listing.image && listing.image.trim() !== "") {
        // Check if this looks like a valid API image path
        if (listing.image.startsWith("/media/") || listing.image.includes(".")) {
          defaultImage = listing.image;
        }
      }

      const transformedProduct = {
        id: listing.id,
        name: listing.name,
        price: parseFloat(listing.price),
        description: listing.description,
        image: defaultImage,
        slug: listing.slug,
        available: listing.available,
        brand: listing.brand,
        category: listing.category,
        images: listing.images,
        variants: listing.products.map((variant: any) => ({
          id: variant.id,
          name: variant.name,
          sku: variant.sku,
          price: parseFloat(variant.price),
          stock: variant.stock,
          available: variant.available,
          variant_images: variant.product_images,
        })),
        reviews: listing.reviews,
        compatibility: listing.compatibility_attributes,
      };

      console.log("Transformed product:", transformedProduct);
      return transformedProduct;
    }) || [];

  // Show loading skeletons while fetching data
  if (isLoading) {
    return (
      <>
        <Hero />
        <div className="m-1 flex flex-col rounded-lg p-1">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold">All Products</h2>
            <p className="text-base-content/70">
              Browse our complete collection
            </p>
          </div>
          <div className="xs:grid-cols-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {/* Show 6 skeleton cards while loading */}
            {Array.from({ length: 6 }).map((_, index) => (
              <ItemCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </>
    );
  }

  // Show error state if something went wrong
  if (error) {
    return (
      <>
        <Hero />
        <div className="m-1 flex flex-col rounded-lg p-1">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold">All Products</h2>
            <p className="text-base-content/70">
              Browse our complete collection
            </p>
          </div>
          <div className="alert alert-error">
            <span>Error loading products. Please try again later.</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Hero />
      <div className="m-1 flex flex-col rounded-lg p-1">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold">All Products</h2>
          <p className="text-base-content/70">
            Browse our complete collection
          </p>
        </div>
        <div className="xs:grid-cols-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {transformedProducts.map((product: Product, index: number) => (
            <ItemCard key={product.id || index} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;
