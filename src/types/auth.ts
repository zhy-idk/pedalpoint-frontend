export interface UserInfo {
  address?: string;
  contact_number?: string;
  image?: string | null;
}

export interface User {
  id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  user_info?: UserInfo[];
  primaryUserInfo?: UserInfo | null; // Convenience field for the first user_info entry
  is_staff?: boolean;
  is_superuser?: boolean;
  // Add other user fields as needed
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signup: (email: string, password: string, password2: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  handleSocialLogin: (provider: "google" | "facebook") => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  clearError: () => void;
}