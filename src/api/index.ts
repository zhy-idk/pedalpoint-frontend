import axios from "axios";
import { getCSRFToken } from '../utils/csrf';

// Determine API base URL dynamically
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;
  
  // If no env var, use same host as current page but port 8000
  const currentHost = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${currentHost}:8000`;
};

export const apiBaseUrl = getApiBaseUrl();

const api = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getCSRFToken();
  if (token && token.trim() !== '') {
    config.headers["X-CSRFToken"] = token;
    console.log('Sending CSRF token in header:', token.substring(0, 20) + '... (length:', token.length + ')');
  } else {
    console.warn('No CSRF token available for request to:', config.url);
  }
  return config;
});

export default api

