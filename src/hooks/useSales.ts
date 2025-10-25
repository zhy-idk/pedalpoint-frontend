import { useState, useEffect, useCallback } from 'react';
import { getCSRFToken } from '../utils/csrf';

interface SalesItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: string;
    variant_attribute: string;
    product_listing: {
      name: string;
      slug: string;
    };
    brand: {
      name: string;
    };
  };
  quantity_sold: number;
  amount: number;
}

export interface Sale {
  id: number;
  user: {
    username: string;
  };
  sale_date: string;
  payment_method: 'cash' | 'card' | 'gcash' | 'paymaya' | 'bank_transfer';
  sales_item: SalesItem[];
  total_amount: number;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  quantity_sold: number;
  revenue: number;
  sales_count: number;
}

interface UseSalesReturn {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  fetchTopProducts: () => Promise<TopProduct[]>;
}

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;
  
  const currentHost = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${currentHost}:8000`;
};

const getHeaders = () => {
  const csrfToken = getCSRFToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }
  
  return headers;
};

export const useSales = (): UseSalesReturn => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/sales/`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sales: ${response.statusText}`);
      }

      const data = await response.json();
      setSales(data);
    } catch (err) {
      console.error('Sales fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTopProducts = useCallback(async (): Promise<TopProduct[]> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/sales/top-products/`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch top products: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Top products fetch error:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    sales,
    loading,
    error,
    refresh: fetchSales,
    fetchTopProducts,
  };
};

