// components/AuthProvider.tsx
import { useReducer, useEffect } from 'react';
import Axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { authReducer, initialState } from '../reducers/authReducer';
import type { AuthContextType } from '../types/auth';
import { API_BASE_URL, getCSRFToken, fetchCSRFToken } from '../utils/auth';

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

  const signup = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START'})
    try {
      // Ensure we have CSRF token
      await fetchCSRFToken();
      const token = getCSRFToken();

      if (!token) {
        throw new Error('Unable to get CSRF token');
      }



      await Axios.post(
        `${API_BASE_URL}/_allauth/browser/v1/auth/signup`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          withCredentials: true,
        }
      );


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

      await Axios.post(
        `${API_BASE_URL}/_allauth/browser/v1/auth/login`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          withCredentials: true,
        }
      );

      // After successful login, get user info
      await checkAuth();

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
      const token = getCSRFToken();
      
      await Axios.delete(
        `${API_BASE_URL}/_allauth/browser/v1/auth/session`,
        {
          headers: {
            "X-CSRFToken": token,
          },
          withCredentials: true,
        }
      );

      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
      dispatch({ type: 'LOGOUT' });
    }
  };

  const checkAuth = async (): Promise<void> => {
    try {
      const response = await Axios.get(`${API_BASE_URL}/api/test`, {
        withCredentials: true,
      });

      console.log(response);

      // Assuming your /api/test endpoint returns user data when authenticated
      // Adjust this based on your actual API response structure
      if (response.data && response.data.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
      } else if (response.data && response.data.id) {
        // If the response directly contains user data
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'LOGOUT' });
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
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;