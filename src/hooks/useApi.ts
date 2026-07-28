import { useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '../lib/api';

interface UseApiOptions {
  immediate?: boolean;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  mutate: (data: T) => void;
  reset: () => void;
}

export function useApi<T = any>(
  path: string | null,
  options?: RequestInit,
  { immediate = true }: UseApiOptions = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!path && immediate);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (..._args: any[]): Promise<T | null> => {
    if (!path) return null;
    
    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await apiRequest<T>(path, {
        ...options,
        signal: controller.signal,
      });
      setData(result);
      return result;
    } catch (err: any) {
      if (err.name === 'AbortError') return null;
      const message = err.message || 'An error occurred';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [path, options]);

  useEffect(() => {
    if (path && immediate) {
      execute();
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [path, immediate]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, mutate, reset };
}

export function useApiMutation<T = any, B = any>(
  path: string,
  method: string = 'POST',
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (body?: B, pathOverride?: string) => Promise<T | null>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (body?: B, pathOverride?: string): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiRequest<T>(pathOverride || path, {
        method,
        body: body ? JSON.stringify(body) : undefined,
      });
      setData(result);
      return result;
    } catch (err: any) {
      const message = err.message || 'An error occurred';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [path, method]);

  return { data, loading, error, execute };
}
