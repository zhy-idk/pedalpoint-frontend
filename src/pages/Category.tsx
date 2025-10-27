import { useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import ItemCard from "../components/ItemCard";
import ItemCardSkeleton from "../components/ItemCardSkeleton";
import Breadcrumbs from "../components/Breadcrumbs";
import { useProductsByCategory } from "../hooks/useProducts";
import type { Product, ProductListing } from "../types/product";
import PlaceholderIMG from "../assets/placeholder_img.jpg";

type SortOption = 
  | 'price-low-high' 
  | 'price-high-low' 
  | 'name-a-z' 
  | 'name-z-a' 
  | 'newest' 
  | 'oldest' 
  | 'bestselling';

function Category() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const {
    data: productListings,
    isLoading,
    error,
  } = useProductsByCategory(categorySlug || "");

  // Transform ProductListing to Product format for ItemCard compatibility
  const transformedProducts: Product[] =
    productListings?.map((listing: ProductListing) => {
      // Get the first available variant for default image and price
      let defaultImage = PlaceholderIMG;
      if (listing.image && listing.image.trim() !== "") {
        // Check if this looks like a valid API image path
        if (listing.image.startsWith("/media/") || listing.image.includes(".")) {
          defaultImage = listing.image;
        }
      }

      return {
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
        variants: listing.products.map((variant) => ({
          id: variant.id,
          name: variant.name,
          sku: variant.sku,
          price: variant.price ? (typeof variant.price === 'number' ? variant.price : parseFloat(variant.price)) : 0,
          stock: variant.stock || 0,
          available: variant.available,
          variant_images: variant.product_images || variant.images || [],
        })),
        reviews: listing.reviews,
        compatibility: listing.compatibility_attributes,
      };
    }).filter((product: Product) => {
      // Filter out products with missing essential data
      return product.id && product.name && product.slug;
    }) || [];

  // Sort products based on selected option
  const sortedProducts = useMemo(() => {
    const products = [...transformedProducts];
    
    switch (sortBy) {
      case 'price-low-high':
        return products.sort((a, b) => a.price - b.price);
      case 'price-high-low':
        return products.sort((a, b) => b.price - a.price);
      case 'name-a-z':
        return products.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-z-a':
        return products.sort((a, b) => b.name.localeCompare(a.name));
      case 'newest':
        return products.sort((a, b) => (b.id || 0) - (a.id || 0));
      case 'oldest':
        return products.sort((a, b) => (a.id || 0) - (b.id || 0));
      case 'bestselling':
        // Sort by reviews count (best selling based on reviews)
        return products.sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
      default:
        return products;
    }
  }, [transformedProducts, sortBy]);

  // Get category display name
  const getCategoryDisplayName = (slug: string) => {
    // Capitalize first letter of slug
    const formatted = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return formatted || "Category";
  };

  // Show loading skeletons while fetching data
  if (isLoading) {
    return (
      <div className="bg-base-100 xs:mx-[clamp(0.75rem,6vw,7.5rem)] mx-3 flex flex-col items-center rounded-sm p-3 lg:mx-30">
        <Breadcrumbs category={{
          name: getCategoryDisplayName(categorySlug || ""),
          slug: categorySlug || ""
        }} />
        <h1 className="mb-4 text-4xl font-bold">
          {getCategoryDisplayName(categorySlug || "")}
        </h1>
        <div className="w-full">
          <div className="xs:grid-cols-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {/* Show 6 skeleton cards while loading */}
            {Array.from({ length: 6 }).map((_, index) => (
              <ItemCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state if something went wrong
  if (error) {
    return (
      <div className="bg-base-100 xs:mx-[clamp(0.75rem,6vw,7.5rem)] mx-3 flex flex-col items-center rounded-sm p-3 lg:mx-30">
        <Breadcrumbs category={{
          name: getCategoryDisplayName(categorySlug || ""),
          slug: categorySlug || ""
        }} />
        <h1 className="mb-4 text-4xl font-bold">
          {getCategoryDisplayName(categorySlug || "")}
        </h1>
        <div className="alert alert-error">
          <span>Error loading products. Please try again later.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 xs:mx-[clamp(0.75rem,6vw,7.5rem)] mx-3 flex flex-col items-center rounded-sm p-3 lg:mx-30">
      <Breadcrumbs category={{
        name: getCategoryDisplayName(categorySlug || ""),
        slug: categorySlug || ""
      }} />
      <h1 className="mb-4 text-4xl font-bold">
        {getCategoryDisplayName(categorySlug || "")}
      </h1>

      {/* Sort Filter */}
      {transformedProducts.length > 0 && (
        <div className="mb-4 w-full">
          <label className="label">
            <span className="label-text font-semibold">Sort by:</span>
          </label>
          <select 
            className="select select-bordered w-full max-w-xs"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="name-a-z">Name: A-Z</option>
            <option value="name-z-a">Name: Z-A</option>
            <option value="bestselling">Best Selling</option>
          </select>
        </div>
      )}

      {transformedProducts.length === 0 ? (
        <div className="py-8 text-center">
          <div className="text-6xl mb-4">🚲</div>
          <p className="text-lg text-base-content/70 mb-2">
            No products found in this category yet.
          </p>
          <p className="text-sm text-base-content/50">
            We're working on adding more products. Check back soon!
          </p>
          <Link 
            to="/" 
            className="btn btn-primary mt-4"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="w-full">
          <div className="mb-4 text-base-content/70">
            Showing {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
          </div>
          <div className="xs:grid-cols-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {sortedProducts.map((product: Product, index: number) => (
              <ItemCard key={product.id || index} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Category;
