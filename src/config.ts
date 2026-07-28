const browserOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
const defaultAppUrl = import.meta.env.DEV ? 'http://localhost:3000' : 'https://schedit.in';
const defaultApiUrl = import.meta.env.DEV ? 'http://localhost:3001' : 'https://api.schedit.in';

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export const APP_URL = normalizeUrl(
  import.meta.env.VITE_APP_URL ||
    import.meta.env.NEXT_PUBLIC_APP_URL ||
    browserOrigin ||
    defaultAppUrl,
);

export const API_URL = normalizeUrl(
  import.meta.env.VITE_API_URL ||
    import.meta.env.NEXT_PUBLIC_API_URL ||
    defaultApiUrl,
);

export const API_ORIGIN = new URL(API_URL).origin;

export function toApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
}
