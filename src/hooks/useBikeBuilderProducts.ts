import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import type { Product } from '../types/product';

interface UseBikeBuilderProductsParams {
  builderCategory?: string;
  compatibilityIds?: number[];
  requiredAttributeIds?: number[];
  autoFetch?: boolean;
}

export const useBikeBuilderProducts = ({
  builderCategory,
  compatibilityIds,
  requiredAttributeIds,
  autoFetch = true,
}: UseBikeBuilderProductsParams = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      
      if (builderCategory) {
        params.append('builder_category', builderCategory);
      }
      
      if (compatibilityIds && compatibilityIds.length > 0) {
        params.append('compatibility_ids', compatibilityIds.join(','));
      }
      
      if (requiredAttributeIds && requiredAttributeIds.length > 0) {
        params.append('required_attribute_ids', requiredAttributeIds.join(','));
      }

      const queryString = params.toString();
      const url = `/api/bike-builder/products/${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get<Product[]>(url);
      setProducts(response.data);
    } catch (err: any) {
      console.error('Error fetching bike builder products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [builderCategory, compatibilityIds, requiredAttributeIds]);

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [fetchProducts, autoFetch]);

  return {
    products,
    loading,
    error,
    refresh: fetchProducts,
  };
};

