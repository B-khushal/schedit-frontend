import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { clientApiRequest } from '../lib/api';

interface ClientUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'CLIENT';
}

interface ClientInfo {
  id: string;
  companyName: string;
  organizationName: string;
  projects: { id: string; name: string }[];
}

interface ClientAuthContextType {
  user: ClientUser | null;
  client: ClientInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: ClientUser) => void;
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

export function useClientAuth() {
  const ctx = useContext(ClientAuthContext);
  if (!ctx) throw new Error('useClientAuth must be used within ClientAuthProvider');
  return ctx;
}

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('client_token');
      const savedUser = localStorage.getItem('client_user');
      const savedClient = localStorage.getItem('client_info');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        if (savedClient) setClient(JSON.parse(savedClient));
      }
    } catch {
      localStorage.removeItem('client_token');
      localStorage.removeItem('client_user');
      localStorage.removeItem('client_info');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await clientApiRequest<{
      accessToken: string;
      refreshToken: string;
      user: ClientUser;
      client: ClientInfo;
    }>('/api/v1/clients/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const { accessToken, refreshToken, user: userData, client: clientData } = response;

    setToken(accessToken);
    setUser({ ...userData, role: 'CLIENT' });
    setClient(clientData);
    localStorage.setItem('client_token', accessToken);
    localStorage.setItem('client_refresh_token', refreshToken);
    localStorage.setItem('client_user', JSON.stringify({ ...userData, role: 'CLIENT' }));
    localStorage.setItem('client_info', JSON.stringify(clientData));
  }, []);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('client_refresh_token');

    if (refreshToken) {
      clientApiRequest('/api/v1/clients/me/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }

    setToken(null);
    setUser(null);
    setClient(null);
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_refresh_token');
    localStorage.removeItem('client_user');
    localStorage.removeItem('client_info');
  }, []);

  const updateUser = useCallback((updatedUser: ClientUser) => {
    setUser(updatedUser);
    localStorage.setItem('client_user', JSON.stringify(updatedUser));
  }, []);

  const value = useMemo<ClientAuthContextType>(() => ({
    user,
    client,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    updateUser,
  }), [user, client, token, isLoading, login, logout, updateUser]);

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>;
}
