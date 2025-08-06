import axios from "axios";
import { getCSRFToken } from '../utils/csrf';

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getCSRFToken();
  if (token) {
    config.headers["X-CSRFToken"] = token;
  }
  return config;
});

export default api

