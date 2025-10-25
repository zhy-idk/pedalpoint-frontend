import { useState, useCallback } from 'react';
import { getCSRFToken } from '../utils/csrf';
import { useCSRF } from './useCSRF';
import { apiBaseUrl } from '../api/index';

interface InventoryItem {
  id: number;
  name: string;
  variant_attribute: string;
  brand: string;
  price: number;
  supplier_price?: number;
  stock: number;
  sku: string;
  available: boolean;
  product_listing?: number;
  supply?: string;
  supply_id?: number;
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
  supplier_id?: number;
}

interface UpdateInventoryItemData {
  name?: string;
  variant_attribute?: string;
  brand?: number;
  price?: number;
  stock?: number;
  sku?: string;
  available?: boolean;
  supplier_id?: number;
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
      // Check if we have a CSRF token available
      const csrfToken = getCSRFToken();
      if (!csrfToken) {
        throw new Error('CSRF token not available. Please refresh the page and try again.');
      }
      
      const response = await requestFn();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      // Don't try to parse JSON for 204 No Content responses
      if (response.status === 204) {
        return undefined as T;
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
      fetch(`${apiBaseUrl}/api/inventory/`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      })
    );
  }, [csrfReady, csrfError]);

  const createItem = useCallback(async (data: CreateInventoryItemData): Promise<InventoryItem> => {
    return handleRequest<InventoryItem>(() =>
      fetch(`${apiBaseUrl}/api/inventory/create/`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
    );
  }, [csrfReady, csrfError]);

  const updateItem = useCallback(async (id: number, data: UpdateInventoryItemData): Promise<InventoryItem> => {
    return handleRequest<InventoryItem>(() =>
      fetch(`${apiBaseUrl}/api/inventory/${id}/update/`, {
        method: 'PUT',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
    );
  }, [csrfReady, csrfError]);

  const deleteItem = useCallback(async (id: number): Promise<void> => {
    return handleRequest<void>(() =>
      fetch(`${apiBaseUrl}/api/inventory/${id}/delete/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getHeaders(),
      })
    );
  }, [csrfReady, csrfError]);

  const bulkUpdate = useCallback(async (updates: BulkUpdateItem[]): Promise<{ updated_count: number }> => {
    return handleRequest<{ updated_count: number }>(() =>
      fetch(`${apiBaseUrl}/api/inventory/bulk-update/`, {
        method: 'PUT',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({ updates }),
      })
    );
  }, [csrfReady, csrfError]);

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
