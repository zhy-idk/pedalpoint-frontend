import { useState, useEffect } from 'react';
import api from '../api/index';
import { Order } from '../types/order';

export const useOrderDetail = (orderId: string | undefined) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetail = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/orders/${orderId}`);
      setOrder(response.data);
    } catch (err: any) {
      console.error('Failed to fetch order detail:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const refetch = () => {
    fetchOrderDetail();
  };

  return {
    order,
    loading,
    error,
    refetch,
  };
};
