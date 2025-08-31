import { useState, useEffect } from 'react';
import type { ProductListing } from '../types/product';
import PlaceholderIMG from '../assets/placeholder_img.jpg';

export const useRecommendations = (categorySlug: string) => {
  const [recommendations, setRecommendations] = useState<ProductListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useRecommendations hook called with categorySlug:', categorySlug);
    if (!categorySlug) {
      console.log('No categorySlug provided, skipping recommendations fetch');
      return;
    }

    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:8000/api/categories/${categorySlug}/recommendations/`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Handle different response structures
        if (Array.isArray(data)) {
          setRecommendations(data);
        } else if (data && Array.isArray(data.listings)) {
          setRecommendations(data.listings);
        } else if (data && Array.isArray(data.results)) {
          setRecommendations(data.results);
        } else if (data && Array.isArray(data.items)) {
          setRecommendations(data.items);
        } else if (data && Array.isArray(data.data)) {
          setRecommendations(data.data);
        } else {
          console.warn('Unexpected recommendations API response structure:', data);
          setRecommendations([]);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [categorySlug]);

  // Transform ProductListing to Product format for ItemCard compatibility
  const transformedRecommendations = Array.isArray(recommendations) ? recommendations.map((listing: ProductListing) => {
    // Use the main image from the listing, fallback to placeholder if blank
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
      price: parseFloat(listing.price),
      description: listing.description,
      image: defaultImage,
      slug: listing.slug,
      available: listing.available,
      brand: listing.brand,
      category: listing.category,
      images: listing.images,
      products: listing.products, // Add the products array
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
  }) : [];

  return {
    recommendations: transformedRecommendations,
    isLoading,
    error
  };
};
