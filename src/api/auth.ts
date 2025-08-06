import api from './index'

export async function fetchCSRFToken(): Promise<void> {
  await api.get('/api/csrf/');
}