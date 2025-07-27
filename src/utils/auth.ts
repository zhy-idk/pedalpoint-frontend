import Axios from 'axios';

export const API_BASE_URL = "http://localhost:8000";

export function getCSRFToken(): string | null {
  const name = "csrftoken";
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return cookieValue ? decodeURIComponent(cookieValue.split("=")[1]) : null;
}

export async function fetchCSRFToken(): Promise<void> {
  await Axios.get(`${API_BASE_URL}/api/csrf/`, {
    withCredentials: true,
  });
}