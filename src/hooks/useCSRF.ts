import { useEffect, useState, useCallback } from 'react';
import { getCSRFToken } from '../utils/csrf';

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

      // Fetch CSRF token from Django
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const csrfUrl = `${protocol}//${hostname}:8000/api/csrf/`;
      
      const response = await fetch(csrfUrl, {
        method: 'GET',
        credentials: 'include', // Important for cookies
      });

      if (response.ok) {
        setIsReady(true);
        setError(null);
      } else {
        throw new Error(`Failed to get CSRF token: ${response.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize CSRF';
      setError(errorMessage);
      console.error('CSRF initialization error:', err);
    }
  }, []);

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
