import { useState, useEffect, useCallback } from 'react';
import { apiBaseUrl } from '../api/index';

export interface Brand {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: number;
  name: string;
  variant_attribute: string;
  brand: Brand;
  sku: string;
  price: number;
  stock: number;
  available: boolean;
  product_images: Array<{
    image: string;
    alt_text: string;
  }>;
}

export interface ProductListing {
  id: number;
  name: string;
  price: number | null;
  category: Category;
  description: string | null;
  image: string | null;
  images?: Array<{
    image: string;
    alt_text: string;
  }>;
  slug: string;
  available: boolean;
  brand: Brand;
  products: ProductVariant[];
  bike_builder_enabled?: boolean;
  builder_category?: string;
  builder_priority?: number;
  compatibility_tags?: Array<{
    id: number;
    tag_type: 'use_case' | 'budget' | 'physical';
    value: string;
    display_name: string;
    description?: string;
    display_order: number;
  }>;
  // Old fields (deprecated, kept for backward compatibility)
  compatibility_attributes?: Array<{
    id: number;
    display_name: string;
    value: string;
    attribute: {
      id: number;
      name: string;
    };
  }>;
  compatible_with?: Array<{
    id: number;
    display_name: string;
    value: string;
    attribute: {
      id: number;
      name: string;
    };
  }>;
}

interface UseProductListingsReturn {
  listings: ProductListing[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createListing: (listingData: Partial<ProductListing>) => Promise<boolean>;
  updateListing: (listingId: number, listingData: Partial<ProductListing>) => Promise<boolean>;
  deleteListing: (listingId: number) => Promise<boolean>;
}

const getCSRFToken = () => {
  const name = "csrftoken";
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

export const useProductListings = (): UseProductListingsReturn => {
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/listings/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch product listings: ${response.statusText}`);
      }

      const data = await response.json();
      setListings(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product listings';
      setError(errorMessage);
      console.error('Product listings fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createListing = useCallback(async (listingData: Partial<ProductListing>): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/listings/create/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
        },
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create listing: ${response.statusText}`);
      }

      // Refresh the listings
      await fetchListings();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create listing';
      setError(errorMessage);
      console.error('Listing creation error:', err);
      return false;
    }
  }, [fetchListings]);

  const updateListing = useCallback(async (listingId: number, listingData: Partial<ProductListing>): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/listings/${listingId}/update/`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
        },
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update listing: ${response.statusText}`);
      }

      // Refresh the listings
      await fetchListings();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update listing';
      setError(errorMessage);
      console.error('Listing update error:', err);
      return false;
    }
  }, [fetchListings]);

  const deleteListing = useCallback(async (listingId: number): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/listings/${listingId}/delete/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete listing: ${response.statusText}`);
      }

      // Refresh the listings
      await fetchListings();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete listing';
      setError(errorMessage);
      console.error('Listing delete error:', err);
      return false;
    }
  }, [fetchListings]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    loading,
    error,
    refresh: fetchListings,
    createListing,
    updateListing,
    deleteListing,
  };
};
