import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getCSRFToken } from '../utils/csrf';
import { Order } from '../types/order';

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

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateOrderStatus: (orderId: number, newStatus?: string, reason?: string, paymentStatus?: string) => Promise<boolean>;
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

  const updateOrderStatus = useCallback(async (orderId: number, newStatus?: string, reason?: string, paymentStatus?: string): Promise<boolean> => {
    try {
      const body: { status?: string; reason?: string; payment_status?: string } = {};
      if (newStatus) {
        body.status = newStatus;
      }
      if (reason) {
        body.reason = reason;
      }
      if (paymentStatus) {
        body.payment_status = paymentStatus;
      }

      const response = await fetch(`${getApiBaseUrl()}/api/orders/${orderId}/update-status/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Failed to update order: ${response.statusText}`);
      }

      const updatedOrder = await response.json();

      // Update local state with the full updated order data
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? updatedOrder
            : order
        )
      );

      return true;
    } catch (err) {
      console.error('Order update error:', err);
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
