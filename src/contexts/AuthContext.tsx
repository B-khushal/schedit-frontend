import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      const savedImpToken = localStorage.getItem('admin_original_token');

      if (savedImpToken) {
        setIsImpersonating(true);
      }

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiRequest<{ accessToken: string; refreshToken: string; user: User }>(
      '/api/v1/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );

    const { accessToken, refreshToken, user: userData } = response;
    
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
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
      }).catch(() => {});
    }

    setToken(null);
    setUser(null);
    setIsImpersonating(false);
    setImpersonatedUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('admin_original_token');
    localStorage.removeItem('admin_original_user');
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
