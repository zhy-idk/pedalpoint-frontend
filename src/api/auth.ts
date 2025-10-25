import api from './index'

export async function fetchCSRFToken(): Promise<void> {
  await api.get('/api/csrf/');
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