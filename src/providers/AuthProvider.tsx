// components/AuthProvider.tsx
import { useReducer, useEffect } from 'react';
import Axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { authReducer, initialState } from '../reducers/authReducer';
import type { AuthContextType } from '../types/auth';
import { fetchCSRFToken } from '../api/auth';
import { getCSRFToken } from '../utils/csrf';
import api, { apiBaseUrl } from '../api/index'

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
      console.log('Login API call successful, now checking auth status...');
      await checkAuth();
      console.log('checkAuth completed after login');
      
      // Refresh cart when user logs in
      if ((window as any).refreshCartOnLogin) {
        (window as any).refreshCartOnLogin();
      }

    } catch (error: unknown) {
      let errorMessage = 'Login failed';
      
      if (Axios.isAxiosError(error)) {
        const status = error.response?.status;
        
        // Handle specific status codes according to allauth documentation
        if (status === 400) {
          // 400: Invalid credentials
          errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Invalid email or password. Please check your credentials and try again.';
        } else if (status === 409) {
          // 409: User is already logged in
          errorMessage = 'You are already logged in. Please log out first if you want to use a different account.';
        } else if (status === 401) {
          // 401: Unauthorized (could be MFA or email verification)
          errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Authentication failed. Please check your credentials and try again.';
        } else {
          // Other errors
          errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Login failed. Please try again.';
        }
      }
      
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    try {
      // 1. Ensure CSRF cookie/session exists
      await fetch(`${apiBaseUrl}/_allauth/browser/v1/auth/session`, {
        credentials: "include",
      });

      // 2. Get CSRF token
      const csrf = getCSRFToken();
      if (!csrf) {
        console.error("Missing csrftoken cookie");
        return;
      }

      // 3. Create a hidden form to submit
      const form = document.createElement("form");
      form.method = "POST";
      form.action = `${apiBaseUrl}/_allauth/browser/v1/auth/provider/redirect`;

      // Helper function to add hidden inputs
      const addInput = (name: string, value: string) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      };

      // 4. Add form data
      addInput("csrfmiddlewaretoken", csrf);
      addInput("provider", provider);
      addInput("process", "login");
      // Callback URL - where Django redirects after OAuth completes
      addInput("callback_url", `${window.location.origin}/auth/callback`);

      // 5. Submit the form
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      throw error;
    }
  }

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
    
    // Use allauth headless session endpoint
    const response = await fetch(`${apiBaseUrl}/_allauth/browser/v1/auth/session`, {
      credentials: 'include',
    });

    const data = await response.json();
    console.log('Allauth session response:', data);

    // Check if user is authenticated via allauth
    if (data.meta?.is_authenticated && data.data?.user) {
      console.log('User authenticated via allauth:', data.data.user);
      
      // Now fetch your custom user data from your API
      try {
        const userResponse = await api.get('/api/test');
        console.log('Custom user data:', userResponse.data);

        // Check if we have user data in the response
        if (userResponse.data && userResponse.data.id) {
          // Process the user data to extract user_info
          const userData = {
            ...userResponse.data,
            // Extract the first user_info entry if it exists
            primaryUserInfo: userResponse.data.user_info && userResponse.data.user_info.length > 0 
              ? userResponse.data.user_info[0] 
              : null
          };
          
          dispatch({ type: 'AUTH_SUCCESS', payload: userData });
          
          // Refresh cart when user is authenticated
          if ((window as any).refreshCartOnLogin) {
            (window as any).refreshCartOnLogin();
          }
        } else {
          console.log('Allauth authenticated but no custom user data found');
          dispatch({ type: 'LOGOUT' });
          
          // Clear cart when user data not found
          if ((window as any).clearCartOnLogout) {
            (window as any).clearCartOnLogout();
          }
        }
      } catch (apiError) {
        console.error('Failed to fetch custom user data:', apiError);
        dispatch({ type: 'LOGOUT' });
        
        // Clear cart when API fails
        if ((window as any).clearCartOnLogout) {
          (window as any).clearCartOnLogout();
        }
      }
    } else {
      console.log('User not authenticated via allauth');
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
        '/_allauth/browser/v1/auth/password/request',
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
    handleSocialLogin,
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