import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";
import ItemCardSkeleton from "../components/ItemCardSkeleton";
import { Search, X, ArrowLeft } from "lucide-react";
import type { Product, ProductListing } from "../types/product";
import PlaceholderIMG from "../assets/placeholder_img.jpg";
import { apiBaseUrl } from "../api/index";

function SearchResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to home if no query
  useEffect(() => {
    if (!query.trim()) {
      navigate("/");
    }
  }, [query, navigate]);

  // Fetch search results
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/api/listings/`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data: ProductListing[] = await response.json();

        // Filter products based on search query
        const filteredProducts = data.filter((listing) => {
          const searchLower = query.toLowerCase();
          return (
            (listing.name || '').toLowerCase().includes(searchLower) ||
            (listing.brand?.name || '').toLowerCase().includes(searchLower) ||
            (listing.description || '').toLowerCase().includes(searchLower) ||
            (listing.category?.name || '').toLowerCase().includes(searchLower)
          );
        });

        // Transform to Product format
        const transformedProducts: Product[] = filteredProducts.map(
          (listing): any => {
            let defaultImage = PlaceholderIMG;
            if (listing.image && listing.image.trim() !== "") {
              // Check if this looks like a valid API image path
              if (
                listing.image.startsWith("/media/") ||
                listing.image.includes(".")
              ) {
                defaultImage = listing.image;
              }
            }

            return {
              id: listing.id,
              name: listing.name,
              price: listing.price ? parseFloat(listing.price) : 0,
              description: listing.description || '',
              image: defaultImage,
              slug: listing.slug,
              available: listing.available || true,
              brand: listing.brand,
              category: listing.category,
              images: listing.images || [],
              products: listing.products.map((v) => ({
                ...v,
                product_images: v.product_images || v.images || []
              })),
              variants: listing.products.map((variant) => ({
                id: variant.id,
                name: variant.name,
                sku: variant.sku,
                price: variant.price ? (typeof variant.price === 'number' ? variant.price : parseFloat(variant.price)) : 0,
                stock: variant.stock || 0,
                available: variant.available,
                variant_images: variant.product_images || variant.images || [],
              })),
              reviews: listing.reviews || [],
              compatibility: listing.compatibility_attributes || [],
            };
          },
        ).filter((product: any) => {
          // Filter out products with missing essential data
          return product.id && product.name && product.slug;
        });

        setSearchResults(transformedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error searching products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  // Don't render anything if redirecting
  if (!query.trim()) {
    return null;
  }

  return (
    <div className="bg-base-100 xs:mx-[clamp(0.75rem,6vw,7.5rem)] mx-3 flex flex-col items-center rounded-sm p-3 lg:mx-30">

      {/* Search Header */}
      <div className="mb-6 w-full">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Search Results</h1>
          <div className="badge badge-primary badge-lg">
            {searchResults.length}{" "}
            {searchResults.length === 1 ? "result" : "results"}
          </div>
        </div>

        <div className="bg-base-200 flex items-center gap-3 rounded-lg p-4">
          <Search className="text-primary h-5 w-5" />
          <span className="text-lg">"{query}"</span>
          <button
            onClick={() => navigate("/")}
            className="btn btn-ghost btn-sm"
          >
            <X className="h-4 w-4" />
            Clear Search
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="w-full">
          <div className="xs:grid-cols-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ItemCardSkeleton key={index} />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="w-full py-8 text-center">
          <div className="alert alert-error mb-4">
            <span>Error searching products: {error}</span>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Search Results */}
      {!isLoading && !error && (
        <>
          {searchResults.length === 0 ? (
            <div className="w-full py-8 text-center">
              <Search className="mx-auto mb-4 h-16 w-16 opacity-50" />
              <h2 className="mb-2 text-xl font-semibold">No products found</h2>
              <p className="text-base-content/70 mb-4">
                We couldn't find any products matching "{query}"
              </p>
              <div className="mb-6 space-y-2">
                <p className="text-base-content/60 text-sm">Try:</p>
                <ul className="text-base-content/60 space-y-1 text-sm">
                  <li>• Using different keywords</li>
                  <li>• Checking your spelling</li>
                  <li>• Using more general terms</li>
                </ul>
              </div>
              <button
                onClick={() => navigate("/")}
                className="btn btn-outline btn-primary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Products
              </button>
            </div>
          ) : (
            <div className="w-full">
              <div className="xs:grid-cols-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {searchResults.map((product: Product, index: number) => (
                  <ItemCard key={product.id || index} product={product} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchResult;
