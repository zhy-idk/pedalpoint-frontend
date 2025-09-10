import { useState, useCallback } from 'react';
import { getCSRFToken } from '../utils/csrf';
import { useCSRF } from './useCSRF';

interface InventoryItem {
  id: number;
  name: string;
  variant_attribute: string;
  brand: string;
  price: number;
  stock: number;
  sku: string;
  available: boolean;
  product_listing?: number;
}

interface CreateInventoryItemData {
  name: string;
  variant_attribute: string;
  brand: number;
  price: number;
  stock: number;
  sku: string;
  available: boolean;
  product_listing?: number;
}

interface UpdateInventoryItemData {
  name?: string;
  variant_attribute?: string;
  brand?: number;
  price?: number;
  stock?: number;
  sku?: string;
  available?: boolean;
}

interface BulkUpdateItem {
  id: number;
  stock?: number;
  price?: number;
  available?: boolean;
}

interface UseInventoryAPIReturn {
  loading: boolean;
  error: string | null;
  csrfReady: boolean;
  fetchInventory: () => Promise<InventoryItem[]>;
  createItem: (data: CreateInventoryItemData) => Promise<InventoryItem>;
  updateItem: (id: number, data: UpdateInventoryItemData) => Promise<InventoryItem>;
  deleteItem: (id: number) => Promise<void>;
  bulkUpdate: (updates: BulkUpdateItem[]) => Promise<{ updated_count: number }>;
}

// Determine API base URL dynamically
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  
  // If no env var, use same host as current page but port 8000
  const currentHost = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${currentHost}:8000/api`;
};

const API_BASE_URL = getApiBaseUrl();

export const useInventoryAPI = (): UseInventoryAPIReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isReady: csrfReady, error: csrfError } = useCSRF();

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
    
    return headers;
  };

  const handleRequest = async <T>(
    requestFn: () => Promise<Response>
  ): Promise<T> => {
    setLoading(true);
    
    // Combine CSRF and general errors
    const combinedError = csrfError || error;
    setError(combinedError);
    
    try {
      if (!csrfReady) {
        throw new Error('CSRF token not ready. Please wait and try again.');
      }
      
      const response = await requestFn();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = useCallback(async (): Promise<InventoryItem[]> => {
    return handleRequest<InventoryItem[]>(() =>
      fetch(`${API_BASE_URL}/inventory/`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      })
    );
  }, []);

  const createItem = useCallback(async (data: CreateInventoryItemData): Promise<InventoryItem> => {
    return handleRequest<InventoryItem>(() =>
      fetch(`${API_BASE_URL}/inventory/create/`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
    );
  }, []);

  const updateItem = useCallback(async (id: number, data: UpdateInventoryItemData): Promise<InventoryItem> => {
    return handleRequest<InventoryItem>(() =>
      fetch(`${API_BASE_URL}/inventory/${id}/update/`, {
        method: 'PUT',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
    );
  }, []);

  const deleteItem = useCallback(async (id: number): Promise<void> => {
    return handleRequest<void>(() =>
      fetch(`${API_BASE_URL}/inventory/${id}/delete/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getHeaders(),
      })
    );
  }, []);

  const bulkUpdate = useCallback(async (updates: BulkUpdateItem[]): Promise<{ updated_count: number }> => {
    return handleRequest<{ updated_count: number }>(() =>
      fetch(`${API_BASE_URL}/inventory/bulk-update/`, {
        method: 'PUT',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({ updates }),
      })
    );
  }, []);

  return {
    loading,
    error,
    csrfReady,
    fetchInventory,
    createItem,
    updateItem,
    deleteItem,
    bulkUpdate,
  };
};
