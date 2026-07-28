import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  avatar?: string;
  role?: string;
  twoFactorEnabled?: boolean;
  isPlatformOwner?: boolean;
  isPlatformAdmin?: boolean;
  isClient?: boolean;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isImpersonating: boolean;
  impersonatedUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  startImpersonation: (token: string, targetUser: User) => void;
  stopImpersonating: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type StoredAuth = {
  token: string | null;
  user: User | null;
  isImpersonating: boolean;
};

const AUTH_DEBUG =
  import.meta.env.DEV || import.meta.env.VITE_AUTH_DEBUG === 'true';

function authLog(event: string, meta: Record<string, unknown> = {}) {
  if (!AUTH_DEBUG) return;
  console.info('[auth]', event, {
    at: new Date().toISOString(),
    ...meta,
  });
}

function clearStoredAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('admin_original_token');
  localStorage.removeItem('admin_original_user');
}

function readStoredAuth(): StoredAuth {
  try {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedImpToken = localStorage.getItem('admin_original_token');

    if (!savedToken || !savedUser) {
      authLog('hydrate-empty', {
        hasToken: Boolean(savedToken),
        hasUser: Boolean(savedUser),
      });
      return {
        token: null,
        user: null,
        isImpersonating: Boolean(savedImpToken),
      };
    }

    const parsedUser = JSON.parse(savedUser) as User;
    authLog('hydrate-success', {
      hasToken: true,
      userId: parsedUser.id,
      email: parsedUser.email,
    });

    return {
      token: savedToken,
      user: parsedUser,
      isImpersonating: Boolean(savedImpToken),
    };
  } catch (error) {
    authLog('hydrate-failed', {
      reason: error instanceof Error ? error.message : 'Invalid stored auth',
    });
    clearStoredAuth();
    return {
      token: null,
      user: null,
      isImpersonating: false,
    };
  }
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialAuth] = useState(readStoredAuth);
  const [user, setUser] = useState<User | null>(initialAuth.user);
  const [token, setToken] = useState<string | null>(initialAuth.token);
  const [isLoading] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(initialAuth.isImpersonating);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);

  useEffect(() => {
    const handleTokenRefreshed = (event: Event) => {
      const detail = (event as CustomEvent<{ accessToken: string }>).detail;
      if (!detail?.accessToken) return;
      authLog('token-refreshed-state-sync', { hasToken: true });
      setToken(detail.accessToken);
    };

    const handleSessionExpired = (event: Event) => {
      const detail = (event as CustomEvent<{ reason?: string; path?: string; status?: number }>).detail || {};
      const reason = detail.reason || 'Session expired';

      authLog('redirect-to-login', {
        reason,
        path: detail.path,
        status: detail.status,
        from: location.pathname,
      });

      setToken(null);
      setUser(null);
      setIsImpersonating(false);
      setImpersonatedUser(null);

      if (!location.pathname.includes('/login')) {
        navigate('/login', {
          state: { from: location, reason },
          replace: true,
        });
      }
    };

    window.addEventListener('schedit-auth-token-refreshed', handleTokenRefreshed);
    window.addEventListener('schedit-auth-session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('schedit-auth-token-refreshed', handleTokenRefreshed);
      window.removeEventListener('schedit-auth-session-expired', handleSessionExpired);
    };
  }, [location, navigate]);

  const login = useCallback(async (email: string, password: string) => {
    authLog('login-start', { email: email.toLowerCase() });
    const response = await apiRequest<{ accessToken: string; refreshToken: string; user: User }>(
      '/api/v1/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }), skipAuthRefresh: true }
    );

    const { accessToken, refreshToken, user: userData } = response;
    
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    authLog('login-success-token-stored', {
      userId: userData.id,
      email: userData.email,
      hasAccessToken: Boolean(accessToken),
      hasRefreshToken: Boolean(refreshToken),
    });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await apiRequest<{ message: string; user: User }>(
      '/api/v1/auth/register',
      { method: 'POST', body: JSON.stringify({ name, email, password }) }
    );
  }, []);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      apiRequest('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
        skipAuthRefresh: true,
      }).catch(() => {});
    }

    setToken(null);
    setUser(null);
    setIsImpersonating(false);
    setImpersonatedUser(null);
    clearStoredAuth();
    authLog('logout-complete', { reason: 'User initiated logout' });
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const startImpersonation = useCallback((impersonateToken: string, targetUser: User) => {
    if (token && user) {
      localStorage.setItem('admin_original_token', token);
      localStorage.setItem('admin_original_user', JSON.stringify(user));
    }
    setToken(impersonateToken);
    setUser(targetUser);
    setImpersonatedUser(targetUser);
    setIsImpersonating(true);
    localStorage.setItem('token', impersonateToken);
    localStorage.setItem('user', JSON.stringify(targetUser));
  }, [token, user]);

  const stopImpersonating = useCallback(() => {
    const origToken = localStorage.getItem('admin_original_token');
    const origUser = localStorage.getItem('admin_original_user');
    if (origToken && origUser) {
      setToken(origToken);
      setUser(JSON.parse(origUser));
      localStorage.setItem('token', origToken);
      localStorage.setItem('user', origUser);
    }
    setIsImpersonating(false);
    setImpersonatedUser(null);
    localStorage.removeItem('admin_original_token');
    localStorage.removeItem('admin_original_user');
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    isImpersonating,
    impersonatedUser,
    login,
    register,
    logout,
    updateUser,
    startImpersonation,
    stopImpersonating,
  }), [user, token, isLoading, isImpersonating, impersonatedUser, login, register, logout, updateUser, startImpersonation, stopImpersonating]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
