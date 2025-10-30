import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cartReducer, initialState } from '../reducers/cartReducer';
import type { CartContextType, CartItem, CartResponse } from '../types/cart';
import { apiBaseUrl } from '../api/index';
import { getCSRFToken } from '../utils/csrf';
import { useAuth } from '../hooks/useAuth';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  const fetchCart = async () => {
    try {
      console.log('Fetching cart data...');
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      if (!isAuthenticated) {
        console.log('User not authenticated, showing empty cart');
        dispatch({ type: 'SET_CART', payload: [] });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const csrfToken = getCSRFToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch(`${apiBaseUrl}/api/cart/`, {
        signal: controller.signal,
        credentials: 'include',
        headers,
      });

      clearTimeout(timeoutId);
      console.log('Cart API response status:', response.status);

      if (response.status === 401) {
        console.log('User not authenticated (401), showing empty cart');
        dispatch({ type: 'SET_ERROR', payload: 'Please log in to view your cart' });
        dispatch({ type: 'SET_CART', payload: [] });
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cart API error response:', errorText);
        throw new Error(`Failed to fetch cart: ${response.status} ${response.statusText}`);
      }

      const cartData: CartResponse = await response.json();
      console.log('Cart data received:', cartData);
      dispatch({ type: 'SET_CART', payload: cartData.items });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cart';
      console.error('Error fetching cart:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        dispatch({ type: 'SET_ERROR', payload: 'Request timed out. Please check your connection and try again.' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addItem = async (productId: number, quantity: number = 1) => {
    try {
      if (!isAuthenticated) {
        dispatch({ type: 'SET_ERROR', payload: 'Please log in to add items to cart' });
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const csrfToken = getCSRFToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch(`${apiBaseUrl}/api/cart/add/`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          product: productId,
          quantity: quantity,
        }),
      });

      if (response.status === 401) {
        dispatch({ type: 'SET_ERROR', payload: 'Please log in to add items to cart' });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }
      await fetchCart();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error adding item to cart:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeItem = async (productId: number) => {
    try {
      if (!isAuthenticated) {
        dispatch({ type: 'SET_ERROR', payload: 'Please log in to manage your cart' });
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const csrfToken = getCSRFToken();
      const headers: Record<string, string> = {};

      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch(`${apiBaseUrl}/api/cart/remove/${productId}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });

      if (response.status === 401) {
        dispatch({ type: 'SET_ERROR', payload: 'Please log in to manage your cart' });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }
      await fetchCart();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item from cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error removing item from cart:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      if (!isAuthenticated) {
        dispatch({ type: 'SET_ERROR', payload: 'Please log in to manage your cart' });
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const csrfToken = getCSRFToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch(`${apiBaseUrl}/api/cart/update/${productId}/`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          quantity: quantity,
        }),
      });

      if (response.status === 401) {
        dispatch({ type: 'SET_ERROR', payload: 'Please log in to manage your cart' });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to update item quantity');
      }
      await fetchCart();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item quantity';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error updating item quantity:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearCart = async () => {
    try {
      if (!isAuthenticated) {
        dispatch({ type: 'SET_ERROR', payload: 'Please log in to manage your cart' });
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const csrfToken = getCSRFToken();
      const headers: Record<string, string> = {};

      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      // Ensure we have a valid base URL
      const baseUrl = apiBaseUrl && apiBaseUrl.includes('://') 
        ? apiBaseUrl 
        : `${window.location.protocol}//${window.location.hostname}:8000`;

      const response = await fetch(`${baseUrl}/api/cart/clear/`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });

      if (response.status === 401) {
        dispatch({ type: 'SET_ERROR', payload: 'Please log in to manage your cart' });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
      await fetchCart();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error clearing cart:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    // Only fetch cart if user is authenticated
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Clear cart if user is not authenticated
      dispatch({ type: 'SET_CART', payload: [] });
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  }, [isAuthenticated]);

  // Function to clear cart (can be called from AuthProvider)
  const clearCartOnLogout = () => {
    console.log('Clearing cart on logout');
    dispatch({ type: 'SET_CART', payload: [] });
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // Function to refresh cart (can be called from AuthProvider)
  const refreshCartOnLogin = () => {
    console.log('Refreshing cart on login');
    fetchCart();
  };

  // Expose the functions globally so AuthProvider can call them
  useEffect(() => {
    (window as any).clearCartOnLogout = clearCartOnLogout;
    (window as any).refreshCartOnLogin = refreshCartOnLogin;
    
    // Listen for storage events (when user logs out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sessionid' && !e.newValue) {
        // Session was cleared, clear cart
        clearCartOnLogout();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      delete (window as any).clearCartOnLogout;
      delete (window as any).refreshCartOnLogin;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const actions = {
    fetchCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refreshCartOnLogin,
  };

  const value: CartContextType = {
    state,
    actions,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
