import { useState, useEffect, useCallback } from 'react';
import { apiBaseUrl } from '../api/index';

export interface StaffPermissions {
  can_access_pos: boolean;
  can_access_chats: boolean;
  can_access_orders: boolean;
  can_access_listings: boolean;
  can_access_inventory: boolean;
  can_access_queueing: boolean;
  can_access_reservations: boolean;
  can_access_suppliers: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  staff_permissions?: StaffPermissions;
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateUser: (userId: number, userData: Partial<User>) => Promise<boolean>;
  deleteUser: (userId: number) => Promise<boolean>;
}

export function getCSRFToken(): string | null {
  try {
    console.log('[getCSRFToken] Retrieving CSRF token from meta tag');

    const meta = document.querySelector('meta[name="csrf-token"]');
    const token = meta?.getAttribute('content');

    if (token && token.trim() !== '') {
      console.log('[getCSRFToken] Token found, length:', token.length);
      return token;
    } else {
      console.warn('[getCSRFToken] No CSRF token in meta tag');
      return null;
    }
  } catch (error) {
    console.error('[getCSRFToken] Error:', error);
    return null;
  }
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/users/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId: number, userData: Partial<User>): Promise<boolean> => {
    try {
      setError(null);

      console.log(getCSRFToken());

      const response = await fetch(`${apiBaseUrl}/api/users/${userId}/update/`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
        },
        body: JSON.stringify(userData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      const responseData = await response.json();
      console.log('Response data:', responseData);
      console.log('csrftoken:', getCSRFToken());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update user: ${response.statusText}`);
      }

      // Refresh the users list
      await fetchUsers();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      console.error('User update error:', err);
      return false;
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (userId: number): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/users/${userId}/delete/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken() || '',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete user: ${response.statusText}`);
      }

      // Refresh the users list
      await fetchUsers();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      console.error('User delete error:', err);
      return false;
    }
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refresh: fetchUsers,
    updateUser,
    deleteUser,
  };
};
