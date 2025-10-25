import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getCSRFToken } from '../utils/csrf';
import { apiBaseUrl } from '../api/index';

interface DashboardData {
  new_chats: number;
  new_orders: number;
  service_queue_today: {
    pending: number;
    completed: number;
  };
}

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const getHeaders = () => {
  const csrfToken = getCSRFToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }
  
  return headers;
};

export const useDashboardData = (): UseDashboardDataReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated || !user?.is_staff) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/dashboard/`, {
        method: 'GET',
        credentials: 'include',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.is_staff]);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refresh: fetchDashboardData,
  };
};
