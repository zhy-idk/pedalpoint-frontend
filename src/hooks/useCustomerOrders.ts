import { useState, useEffect } from 'react';
import api from '../api/index';
import type { Order } from '../types/order';

export const useCustomerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/orders/my-orders/');
      setOrders(response.data);
    } catch (err: any) {
      console.error('Failed to fetch customer orders:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const refetch = () => {
    fetchOrders();
  };

  return {
    orders,
    loading,
    error,
    refetch,
  };
};
