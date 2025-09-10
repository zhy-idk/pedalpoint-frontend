import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getCSRFToken } from '../utils/csrf';

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number | string;
    variant_attribute: string;
    images?: Array<{
      image: string;
      alt_text?: string;
    }>;
  };
  quantity: number;
}

interface Order {
  id: number;
  user: {
    username: string;
  };
  created_at: string;
  status: 'pending' | 'completed' | 'cancelled' | 'returned';
  shipping_address?: string;
  contact_number?: string;
  notes?: string;
  items: OrderItem[];
}

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateOrderStatus: (orderId: number, newStatus: string) => Promise<boolean>;
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

export const useOrders = (): UseOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !user?.is_staff) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${getApiBaseUrl()}/api/orders/`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const ordersData = await response.json();
      setOrders(ordersData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      console.error('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.is_staff]);

  const updateOrderStatus = useCallback(async (orderId: number, newStatus: string): Promise<boolean> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/orders/${orderId}/update-status/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.statusText}`);
      }

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as Order['status'] }
            : order
        )
      );

      return true;
    } catch (err) {
      console.error('Order status update error:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders,
    updateOrderStatus,
  };
};
