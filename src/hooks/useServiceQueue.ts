import { useState, useEffect, useCallback } from 'react';
import { apiBaseUrl } from '../api/index';

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

export const useServiceQueue = (): UseServiceQueueReturn => {
  const [queueItems, setQueueItems] = useState<ServiceQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueueItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/queue/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
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

      const response = await fetch(`${apiBaseUrl}/api/queue/${itemId}/update/`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
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

      const response = await fetch(`${apiBaseUrl}/api/queue/add/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
        },
        body: JSON.stringify({ 
          queue_date: queueDate,
          info: info,
          user: userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add service: ${response.statusText}`);
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
