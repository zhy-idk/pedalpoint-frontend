export function getCSRFToken(): string | null {
  // First, try to get from meta tag (for cross-origin scenarios)
  const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (metaToken) {
    console.log('[CSRF] Token from meta tag, length:', metaToken.length, 'value:', metaToken.substring(0, 20) + '...');
    return metaToken;
  }
  
  // Fallback: Try to get from cookie (for same-origin)
  const name = "csrftoken";
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  
  const token = cookieValue ? decodeURIComponent(cookieValue.split("=")[1]) : null;
  if (token) {
    console.log('[CSRF] Token from cookie, length:', token.length, 'value:', token.substring(0, 20) + '...');
  } else {
    console.log('[CSRF] No token found in meta tag or cookie');
  }
  
  return token;
}
