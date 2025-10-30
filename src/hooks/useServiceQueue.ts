import { useState, useEffect, useCallback } from 'react';
import { apiBaseUrl } from '../api/index';
import { getCSRFToken } from '../utils/csrf';

export interface ServiceQueueItem {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  queue_date: string;
  info: string;
  status: 'pending' | 'completed';
}

interface UseServiceQueueReturn {
  queueItems: ServiceQueueItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateQueueItem: (itemId: number, status: 'pending' | 'completed') => Promise<boolean>;
  addService: (queueDate: string, info: string, userId: number) => Promise<boolean>;
}

export const useServiceQueue = (): UseServiceQueueReturn => {
  const [queueItems, setQueueItems] = useState<ServiceQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueueItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const csrfToken = getCSRFToken();
      const response = await fetch(`${apiBaseUrl}/api/queue/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch service queue: ${response.statusText}`);
      }

      const data = await response.json();
      setQueueItems(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch service queue';
      setError(errorMessage);
      console.error('Service queue fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQueueItem = useCallback(async (itemId: number, status: 'pending' | 'completed'): Promise<boolean> => {
    try {
      setError(null);

      const csrfToken = getCSRFToken();
      const response = await fetch(`${apiBaseUrl}/api/queue/${itemId}/update/`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update queue item: ${response.statusText}`);
      }

      // Refresh the queue items list
      await fetchQueueItems();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update queue item';
      setError(errorMessage);
      console.error('Queue item update error:', err);
      return false;
    }
  }, [fetchQueueItems]);

  const addService = useCallback(async (queueDate: string, info: string, userId: number): Promise<boolean> => {
    try {
      setError(null);

      const csrfToken = getCSRFToken();
      console.log('Adding service:', { queueDate, info, userId });
      console.log('CSRF Token:', csrfToken ? `${csrfToken.substring(0, 20)}... (length: ${csrfToken.length})` : 'null');

      const response = await fetch(`${apiBaseUrl}/api/queue/add/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({ 
          queue_date: queueDate,
          info: info,
          user: userId
        }),
      });

      console.log('Add service response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Failed to add service: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Add service error data:', errorData);
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch (e) {
          console.error('Could not parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      // Refresh the queue items list
      await fetchQueueItems();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add service';
      setError(errorMessage);
      console.error('Add service error:', err);
      return false;
    }
  }, [fetchQueueItems]);

  useEffect(() => {
    fetchQueueItems();
  }, [fetchQueueItems]);

  return {
    queueItems,
    loading,
    error,
    refresh: fetchQueueItems,
    updateQueueItem,
    addService,
  };
};
