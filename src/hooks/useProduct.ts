import { useQuery } from "@tanstack/react-query";
import type { Product } from '../types/product';
import api from "../api/index";

const fetchProducts = async (): Promise<Product[]> => {
  const response = await api.get('/api/products/');
  return response.data;
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
};