import api from './index'

export async function fetchCSRFToken(): Promise<void> {
  try {
    console.log('[fetchCSRFToken] Fetching CSRF token from /api/csrf/');
    const response = await api.get('/api/csrf/');
    
    // Backend returns token in response body
    const data = response.data;
    console.log('[fetchCSRFToken] Response:', data);
    
    if (data.csrfToken && data.csrfToken.trim() !== '') {
      // Store token in meta tag for cross-origin access
      const meta = document.querySelector('meta[name="csrf-token"]') || document.createElement('meta');
      meta.setAttribute('name', 'csrf-token');
      meta.setAttribute('content', data.csrfToken);
      if (!document.querySelector('meta[name="csrf-token"]')) {
        document.head.appendChild(meta);
      }
      console.log('[fetchCSRFToken] Token stored, length:', data.csrfToken.length);
    } else {
      console.warn('[fetchCSRFToken] No CSRF token in response');
    }
  } catch (error) {
    console.error('[fetchCSRFToken] Error:', error);
    throw error;
  }
}

export interface UserInfo {
  address: string;
  contact_number: string;
  image: string | null;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_info: UserInfo[];
  is_staff: boolean;
  is_superuser: boolean;
}

export async function fetchUserInfo(): Promise<UserData> {
  const response = await api.get('/api/user_info/');
  return response.data;
}