import { useState } from 'react';
import api from '../api/index';
import { useCSRF } from './useCSRF';

interface POSSaleItem {
  product_id: number;
  quantity: number;
}

interface POSSaleData {
  items: POSSaleItem[];
  payment_method: string;
  customer_name?: string;
  customer_contact?: string;
  [key: string]: unknown;
}

interface POSSaleResponse {
  success: boolean;
  order_id: number;
  sale_id?: number;  // Added for compatibility
  total_amount: number;
  message: string;
  qrph?: any;
  checkout_url?: string;
}

// Export the type for use in other files
export type { POSSaleResponse, POSSaleData };

export const usePOSSales = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { csrfToken } = useCSRF();

  const processSale = async (saleData: POSSaleData): Promise<POSSaleResponse | null> => {
    if (!csrfToken) {
      setError('CSRF token not available');
      return null;
    }

    console.log('Processing sale with data:', saleData);
    console.log('CSRF token:', csrfToken);

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/pos/sale/', saleData, {
        headers: {
          'X-CSRFToken': csrfToken,
        },
      });

      console.log('Sale response:', response.data);
      return response.data;
    } catch (err: any) {
      console.error('Sale error:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'Failed to process sale';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    processSale,
    isLoading,
    error,
    clearError,
  };
};
