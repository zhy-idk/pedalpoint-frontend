import ItemCard from "../components/ItemCard";
import Hero from "../components/Hero";
import { useProducts } from "../hooks/useProducts";
import ItemCardSkeleton from "../components/ItemCardSkeleton";
import type { Product, ProductListing } from "../types/product";
import PlaceholderIMG from "../assets/placeholder_img.jpg";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 18;
  
  const { data, isLoading, error } = useProducts(currentPage, pageSize);
  
  // Handle both paginated and non-paginated responses
  const productListings = data?.results || data || [];
  const totalPages = data?.total_pages || 1;
  const hasNext = data?.has_next || false;
  const hasPrevious = data?.has_previous || false;
  const totalCount = data?.count || productListings.length;

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

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
        price: listing.price ? parseFloat(listing.price) : 0,
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
          price: variant.price ? parseFloat(variant.price) : 0,
          stock: variant.stock || 0,
          available: variant.available,
          variant_images: variant.product_images,
        })),
        reviews: listing.reviews,
        compatibility: listing.compatibility_attributes,
      };

      console.log("Transformed product:", transformedProduct);
      return transformedProduct;
    }).filter((product: Product) => {
      // Filter out products with missing essential data
      return product.id && product.name && product.slug;
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
            {/* Show 18 skeleton cards while loading (matching page size) */}
            {Array.from({ length: 18 }).map((_, index) => (
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
          {totalCount > 0 && (
            <p className="text-sm text-base-content/60 mt-1">
              Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} products
            </p>
          )}
        </div>
        
        <div className="xs:grid-cols-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {transformedProducts.map((product: Product, index: number) => (
            <ItemCard key={product.id || index} product={product} />
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 mb-4">
            <button
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={!hasPrevious}
              className="btn btn-outline btn-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show first page, last page, current page, and pages around current
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`btn btn-sm ${
                      currentPage === pageNum ? 'btn-primary' : 'btn-outline'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!hasNext}
              className="btn btn-outline btn-sm"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Page Info */}
        {totalPages > 1 && (
          <div className="text-center text-sm text-base-content/60 mb-4">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
