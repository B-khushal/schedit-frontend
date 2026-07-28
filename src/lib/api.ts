import { toApiUrl } from '../config';

type AuthEventDetail = {
  reason: string;
  path?: string;
  status?: number;
};

type TokenRefreshDetail = {
  accessToken: string;
  refreshToken?: string;
};

export interface ApiRequestOptions extends RequestInit {
  skipAuthRefresh?: boolean;
}

const AUTH_DEBUG =
  import.meta.env.DEV || import.meta.env.VITE_AUTH_DEBUG === 'true';

let refreshPromise: Promise<TokenRefreshDetail | null> | null = null;
let clientRefreshPromise: Promise<TokenRefreshDetail | null> | null = null;

function authLog(event: string, meta: Record<string, unknown> = {}) {
  if (!AUTH_DEBUG) return;
  console.info('[auth]', event, {
    at: new Date().toISOString(),
    ...meta,
  });
}

function emitSessionExpired(detail: AuthEventDetail) {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('admin_original_token');
  localStorage.removeItem('admin_original_user');
  authLog('session-expired', detail);
  window.dispatchEvent(new CustomEvent<AuthEventDetail>('schedit-auth-session-expired', { detail }));
}

function emitTokenRefreshed(detail: TokenRefreshDetail) {
  window.dispatchEvent(new CustomEvent<TokenRefreshDetail>('schedit-auth-token-refreshed', { detail }));
}

function emitClientSessionExpired(detail: AuthEventDetail) {
  localStorage.removeItem('client_token');
  localStorage.removeItem('client_refresh_token');
  localStorage.removeItem('client_user');
  localStorage.removeItem('client_info');
  authLog('client-session-expired', detail);
  window.dispatchEvent(new CustomEvent<AuthEventDetail>('schedit-client-auth-session-expired', { detail }));
}

function emitClientTokenRefreshed(detail: TokenRefreshDetail) {
  window.dispatchEvent(new CustomEvent<TokenRefreshDetail>('schedit-client-auth-token-refreshed', { detail }));
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text);
}

async function refreshAccessToken(path: string): Promise<TokenRefreshDetail | null> {
  if (localStorage.getItem('admin_original_token')) {
    authLog('refresh-skipped', { reason: 'Impersonation session cannot be refreshed silently', path });
    return null;
  }

  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    authLog('refresh-skipped', { reason: 'No refresh token', path });
    return null;
  }

  if (!refreshPromise) {
    authLog('refresh-start', { path });
    refreshPromise = fetch(toApiUrl('/api/v1/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        authLog('refresh-response', { status: response.status, path });

        if (!response.ok) {
          return null;
        }

        const data = await parseResponse<TokenRefreshDetail>(response);
        if (!data.accessToken) {
          return null;
        }

        localStorage.setItem('token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        emitTokenRefreshed(data);
        authLog('refresh-success', { path });
        return data;
      })
      .catch((error) => {
        authLog('refresh-error', { path, message: error instanceof Error ? error.message : String(error) });
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function refreshClientAccessToken(path: string): Promise<TokenRefreshDetail | null> {
  const refreshToken = localStorage.getItem('client_refresh_token');

  if (!refreshToken) {
    authLog('client-refresh-skipped', { reason: 'No refresh token', path });
    return null;
  }

  if (!clientRefreshPromise) {
    authLog('client-refresh-start', { path });
    clientRefreshPromise = fetch(toApiUrl('/api/v1/clients/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        authLog('client-refresh-response', { status: response.status, path });

        if (!response.ok) {
          return null;
        }

        const data = await parseResponse<TokenRefreshDetail>(response);
        if (!data.accessToken) {
          return null;
        }

        localStorage.setItem('client_token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('client_refresh_token', data.refreshToken);
        }
        emitClientTokenRefreshed(data);
        authLog('client-refresh-success', { path });
        return data;
      })
      .catch((error) => {
        authLog('client-refresh-error', { path, message: error instanceof Error ? error.message : String(error) });
        return null;
      })
      .finally(() => {
        clientRefreshPromise = null;
      });
  }

  return clientRefreshPromise;
}

function buildHeaders(options: RequestInit, token: string | null) {
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
}

export async function apiRequest<T = any>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { skipAuthRefresh, ...fetchOptions } = options;
  const token = localStorage.getItem('token');
  const headers = buildHeaders(fetchOptions, token);

  authLog('request', {
    path,
    method: fetchOptions.method || 'GET',
    hasToken: Boolean(token),
    hasAuthorizationHeader: headers.has('Authorization'),
  });

  const response = await fetch(toApiUrl(path), {
    ...fetchOptions,
    headers,
  });

  authLog('response', { path, status: response.status });

  if (response.status === 401) {
    if (!skipAuthRefresh) {
      const refreshed = await refreshAccessToken(path);
      if (refreshed?.accessToken) {
        const retryHeaders = buildHeaders(fetchOptions, refreshed.accessToken);
        const retryResponse = await fetch(toApiUrl(path), {
          ...fetchOptions,
          headers: retryHeaders,
        });

        authLog('retry-response', { path, status: retryResponse.status });

        if (retryResponse.status !== 401) {
          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            let errorMessage = 'Request failed';
            try {
              const parsed = JSON.parse(errorText);
              errorMessage = parsed.message || errorMessage;
            } catch {}
            throw new Error(errorMessage);
          }

          return parseResponse<T>(retryResponse);
        }
      }
    }

    emitSessionExpired({
      reason: `401 from ${path}`,
      path,
      status: response.status,
    });
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

  return parseResponse<T>(response);
}

/**
 * API request utility for client portal.
 * Uses separate 'client_token' localStorage key to keep
 * client and admin sessions completely isolated.
 */
export async function clientApiRequest<T = any>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { skipAuthRefresh, ...fetchOptions } = options;
  const token = localStorage.getItem('client_token');
  const headers = buildHeaders(fetchOptions, token);

  authLog('client-request', {
    path,
    method: fetchOptions.method || 'GET',
    hasToken: Boolean(token),
    hasAuthorizationHeader: headers.has('Authorization'),
  });

  const response = await fetch(toApiUrl(path), {
    ...fetchOptions,
    headers,
  });

  authLog('client-response', { path, status: response.status });

  if (response.status === 401) {
    if (!skipAuthRefresh) {
      const refreshed = await refreshClientAccessToken(path);
      if (refreshed?.accessToken) {
        const retryHeaders = buildHeaders(fetchOptions, refreshed.accessToken);
        const retryResponse = await fetch(toApiUrl(path), {
          ...fetchOptions,
          headers: retryHeaders,
        });

        authLog('client-retry-response', { path, status: retryResponse.status });

        if (retryResponse.status !== 401) {
          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            let errorMessage = 'Request failed';
            try {
              const parsed = JSON.parse(errorText);
              errorMessage = parsed.message || errorMessage;
            } catch {}
            throw new Error(errorMessage);
          }

          return parseResponse<T>(retryResponse);
        }
      }
    }

    emitClientSessionExpired({
      reason: `401 from ${path}`,
      path,
      status: response.status,
    });
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

  return parseResponse<T>(response);
}
