// components/AuthProvider.tsx
import { useReducer, useEffect } from 'react';
import Axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { authReducer, initialState } from '../reducers/authReducer';
import type { AuthContextType } from '../types/auth';
import { fetchCSRFToken } from '../api/auth';
import { getCSRFToken } from '../utils/csrf';
import api from '../api/index'

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Ensure CSRF token is available
  useEffect(() => {
    fetchCSRFToken().catch(console.error);
  }, []);

  const signup = async (email: string, password: string, password2: string): Promise<void> => {
    dispatch({ type: 'AUTH_START'})
    try {
      // Ensure we have CSRF token
      await fetchCSRFToken();
      const token = getCSRFToken();

      if (!token) {
        throw new Error('Unable to get CSRF token');
      }

      await api.post(
        '/_allauth/browser/v1/auth/signup',
        {
          email,
          password,
          password2
        }
      );

      // Check authentication status after successful signup
      // (allauth automatically logs in the user)
      await checkAuth();

    } catch (error: unknown) {
      let errorMessage = 'Signup failed';
      
      if (Axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Signup failed';
      }
      
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  }

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      // Ensure we have CSRF token
      await fetchCSRFToken();
      const token = getCSRFToken();

      if (!token) {
        throw new Error('Unable to get CSRF token');
      }

      // Use allauth browser API with proper session handling
      await api.post(
        '/_allauth/browser/v1/auth/login',
        {
          email,
          password,
        },
        {
          withCredentials: true, // Important: include cookies
        }
      );

      // After successful login, get user info
      await checkAuth();
      
      // Refresh cart when user logs in
      if ((window as any).refreshCartOnLogin) {
        (window as any).refreshCartOnLogin();
      }

    } catch (error: unknown) {
      let errorMessage = 'Login failed';
      
      if (Axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Login failed';
      }
      
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      
      await api.delete(
        '/_allauth/browser/v1/auth/session',
      );

      dispatch({ type: 'LOGOUT' });
      
      // Clear cart when user logs out
      if ((window as any).clearCartOnLogout) {
        (window as any).clearCartOnLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
      dispatch({ type: 'LOGOUT' });
      
      // Clear cart even if logout fails
      if ((window as any).clearCartOnLogout) {
        (window as any).clearCartOnLogout();
      }
    }
  };

  const checkAuth = async (): Promise<void> => {
    try {
      console.log('Checking authentication...');
      const response = await api.get('/api/test');

      console.log('API response:', response.data);

      // Check if we have user data in the response
      if (response.data && response.data.user) {
        console.log('User data found:', response.data.user);
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
        
        // Refresh cart when user is authenticated
        if ((window as any).refreshCartOnLogin) {
          (window as any).refreshCartOnLogin();
        }
      } else if (response.data && response.data.username) {
        // Fallback for different response structure
        console.log('Username found:', response.data.username);
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
        
        // Refresh cart when user is authenticated
        if ((window as any).refreshCartOnLogin) {
          (window as any).refreshCartOnLogin();
        }
      } else {
        console.log('No user data found, logging out');
        dispatch({ type: 'LOGOUT' });
        
        // Clear cart when user is not authenticated
        if ((window as any).clearCartOnLogout) {
          (window as any).clearCartOnLogout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'LOGOUT' });
      
      // Clear cart when auth check fails
      if ((window as any).clearCartOnLogout) {
        (window as any).clearCartOnLogout();
      }
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      // Ensure we have CSRF token
      await fetchCSRFToken();
      const token = getCSRFToken();

      if (!token) {
        throw new Error('Unable to get CSRF token');
      }

      // Use allauth browser API for password reset
      await api.post(
        '/_allauth/browser/v1/auth/password/reset',
        {
          email,
        },
        {
          withCredentials: true,
        }
      );

      dispatch({ type: 'SET_LOADING', payload: false });

    } catch (error: unknown) {
      let errorMessage = 'Password reset failed';
      
      if (Axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Password reset failed';
      }
      
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    signup,
    login,
    logout,
    checkAuth,
    forgotPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;