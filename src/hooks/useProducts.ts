// This is likely what your original useProducts hook looked like
// Please replace this with your actual implementation

import { useQuery } from '@tanstack/react-query';
import api from '../api/index';

// Hook to fetch all products (for home page, product listings, etc.)
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/api/listings/');
      return response.data;
    },
  });
};

// Hook to fetch products by category
export const useProductsByCategory = (categorySlug: string) => {
  return useQuery({
    queryKey: ['products', 'category', categorySlug],
    queryFn: async () => {
      const response = await api.get('/api/listings/');
      const allProducts = response.data;
      
      // Filter products by category slug
      if (categorySlug) {
        return allProducts.filter((product: any) => 
          product.category?.slug?.toLowerCase() === categorySlug.toLowerCase()
        );
      }
      
      return allProducts;
    },
    enabled: !!categorySlug,
  });
};

// Hook to search products
export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: async () => {
      const response = await api.get('/api/listings/');
      const allProducts = response.data;
      
      // Filter products based on search query
      if (query) {
        const searchLower = query.toLowerCase();
        return allProducts.filter((product: any) => 
          product.name.toLowerCase().includes(searchLower) ||
          product.brand.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.name.toLowerCase().includes(searchLower)
        );
      }
      
      return allProducts;
    },
    enabled: !!query,
  });
};