import { useState, useEffect, useCallback } from 'react';
import { apiBaseUrl } from '../api/index';

export interface Supplier {
  id: number;
  name: string;
  contact: string;
  total_products: number;
  low_stock_count: number;
  total_stock_value: number;
  has_low_stock: boolean;
}

export interface SupplierProduct {
  id: number;
  name: string;
  variant_attribute: string;
  brand: string;
  sku: string;
  price: number;
  supplier_price?: number;
  stock: number;
  available: boolean;
  is_low_stock: boolean;
  product_listing: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

interface SupplierProductsResponse {
  supplier: {
    id: number;
    name: string;
    contact: string;
  };
  products: SupplierProduct[];
}

interface UseSuppliersReturn {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getSupplierProducts: (supplierId: number) => Promise<SupplierProductsResponse | null>;
  createSupplier: (supplierData: { name: string; contact?: string }) => Promise<Supplier | null>;
  updateSupplier: (supplierId: number, supplierData: { name: string; contact?: string }) => Promise<Supplier | null>;
  deleteSupplier: (supplierId: number) => Promise<boolean>;
}

const getCSRFToken = () => {
  const name = "csrftoken";
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

export const useSuppliers = (): UseSuppliersReturn => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/suppliers/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch suppliers: ${response.statusText}`);
      }

      const data = await response.json();
      setSuppliers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch suppliers';
      setError(errorMessage);
      console.error('Suppliers fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSupplierProducts = useCallback(async (supplierId: number): Promise<SupplierProductsResponse | null> => {
    try {
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/suppliers/${supplierId}/products/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch supplier products: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch supplier products';
      setError(errorMessage);
      console.error('Supplier products fetch error:', err);
      return null;
    }
  }, []);

  const createSupplier = useCallback(async (supplierData: { name: string; contact?: string }): Promise<Supplier | null> => {
    try {
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/suppliers/create/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
        },
        body: JSON.stringify(supplierData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create supplier: ${response.statusText}`);
      }

      const newSupplier = await response.json();
      
      // Add the new supplier to the list
      setSuppliers(prev => [...prev, newSupplier]);
      
      return newSupplier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create supplier';
      setError(errorMessage);
      console.error('Supplier creation error:', err);
      return null;
    }
  }, []);

  const updateSupplier = useCallback(async (supplierId: number, supplierData: { name: string; contact?: string }): Promise<Supplier | null> => {
    try {
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/suppliers/${supplierId}/update/`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
        },
        body: JSON.stringify(supplierData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update supplier: ${response.statusText}`);
      }

      const updatedSupplier = await response.json();
      
      // Update the supplier in the list
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === supplierId ? updatedSupplier : supplier
      ));
      
      return updatedSupplier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update supplier';
      setError(errorMessage);
      console.error('Supplier update error:', err);
      return null;
    }
  }, []);

  const deleteSupplier = useCallback(async (supplierId: number): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/suppliers/${supplierId}/delete/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete supplier: ${response.statusText}`);
      }

      // Remove the supplier from the list
      setSuppliers(prev => prev.filter(supplier => supplier.id !== supplierId));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete supplier';
      setError(errorMessage);
      console.error('Supplier deletion error:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return {
    suppliers,
    loading,
    error,
    refresh: fetchSuppliers,
    getSupplierProducts,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};
