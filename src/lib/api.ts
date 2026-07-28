import { toApiUrl } from '../config';

export async function apiRequest<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(toApiUrl(path), {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Guard against redirect loops
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Request failed';
    try {
      const parsed = JSON.parse(errorText);
      errorMessage = parsed.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  // Handle empty or 204 No Content responses safely
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * API request utility for client portal.
 * Uses separate 'client_token' localStorage key to keep
 * client and admin sessions completely isolated.
 */
export async function clientApiRequest<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('client_token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(toApiUrl(path), {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_user');
    localStorage.removeItem('client_info');
    if (!window.location.pathname.includes('/client/login')) {
      window.location.href = '/client/login';
    }
    throw new Error('Unauthorized');
  }

  if (response.status === 403) {
    throw new Error('Access denied. You do not have permission to access this resource.');
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Request failed';
    try {
      const parsed = JSON.parse(errorText);
      errorMessage = parsed.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
