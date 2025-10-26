import { useEffect, useState, useCallback } from 'react';
import { getCSRFToken } from '../utils/csrf';
import { apiBaseUrl } from '../api/index';

export const useCSRF = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCSRFToken = useCallback(async () => {
    try {
      // Check if we already have a CSRF token
      const existingToken = getCSRFToken();
      if (existingToken) {
        setIsReady(true);
        return;
      }

      // Fetch CSRF token from Django using centralized API URL
      const csrfUrl = `${apiBaseUrl}/api/csrf/`;
      
      console.log('Fetching CSRF token from:', csrfUrl);
      
      const response = await fetch(csrfUrl, {
        method: 'GET',
        credentials: 'include', // Important for cookies
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log('CSRF endpoint response:', data);
        
        // Backend sends token in response body for cross-origin scenarios
        if (data.csrfToken && data.csrfToken.trim() !== '') {
          // Store token in a meta tag for cross-origin access
          const meta = document.querySelector('meta[name="csrf-token"]') || document.createElement('meta');
          meta.setAttribute('name', 'csrf-token');
          meta.setAttribute('content', data.csrfToken);
          if (!document.querySelector('meta[name="csrf-token"]')) {
            document.head.appendChild(meta);
          }
          
          console.log('CSRF token stored in meta tag:', data.csrfToken.substring(0, 20) + '...');
          console.log('Token length:', data.csrfToken.length);
          setIsReady(true);
          setError(null);
        } else {
          // Fallback: Check if token was set in cookie
          const token = getCSRFToken();
          if (token) {
            console.log('CSRF token received successfully from cookie');
            setIsReady(true);
            setError(null);
          } else {
            console.warn('Response OK but no CSRF token found');
            setIsReady(true); // Still mark as ready, token might come later
          }
        }
      } else {
        throw new Error(`Failed to get CSRF token: ${response.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize CSRF';
      setError(errorMessage);
      console.error('CSRF initialization error:', err);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchCSRFToken();
  }, [fetchCSRFToken]);

  return { 
    isReady, 
    error, 
    csrfToken: getCSRFToken(), 
    fetchCSRFToken 
  };
};
