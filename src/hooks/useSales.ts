import { useState, useEffect, useCallback } from 'react';
import { getCSRFToken } from '../utils/csrf';
import { apiBaseUrl } from '../api/index';

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
  refunded_quantity: number;
  refunded: boolean;
  supplier_price: number | null;
  amount: number;
}

export interface Sale {
  id: number;
  user: {
    username: string;
  };
  salesperson: {
    username: string;
  } | null;
  sale_date: string;
  last_modified: string;
  payment_method: 'cash' | 'card' | 'gcash' | 'paymaya' | 'bank_transfer';
  order: number | null;
  sales_item: SalesItem[];
  total_amount: number;
  net_revenue: number;
  capital: number;
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
  refundFullSale: (saleId: number, reason?: string, notes?: string) => Promise<void>;
  refundSaleItem: (saleId: number, itemId: number, quantity: number, reason?: string, notes?: string) => Promise<void>;
}

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
      const response = await fetch(`${apiBaseUrl}/api/sales/`, {
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
      const response = await fetch(`${apiBaseUrl}/api/sales/top-products/`, {
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

  const refundFullSale = useCallback(async (saleId: number, reason = '', notes = ''): Promise<void> => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/sales/${saleId}/refund/`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({ reason, notes }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Failed to refund sale: ${response.statusText}`);
      }

      // Refresh sales after refund
      await fetchSales();
    } catch (err) {
      console.error('Refund full sale error:', err);
      throw err;
    }
  }, [fetchSales]);

  const refundSaleItem = useCallback(async (saleId: number, itemId: number, quantity: number, reason = '', notes = ''): Promise<void> => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/sales/${saleId}/items/${itemId}/refund/`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({ quantity, reason, notes }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Failed to refund item: ${response.statusText}`);
      }

      // Refresh sales after refund
      await fetchSales();
    } catch (err) {
      console.error('Refund sale item error:', err);
      throw err;
    }
  }, [fetchSales]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    sales,
    loading,
    error,
    refresh: fetchSales,
    fetchTopProducts,
    refundFullSale,
    refundSaleItem,
  };
};

