import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

type StoredClientAuth = {
  token: string | null;
  user: ClientUser | null;
  client: ClientInfo | null;
};

function clearStoredClientAuth() {
  localStorage.removeItem('client_token');
  localStorage.removeItem('client_refresh_token');
  localStorage.removeItem('client_user');
  localStorage.removeItem('client_info');
}

function readStoredClientAuth(): StoredClientAuth {
  try {
    const savedToken = localStorage.getItem('client_token');
    const savedUser = localStorage.getItem('client_user');
    const savedClient = localStorage.getItem('client_info');

    if (!savedToken || !savedUser) {
      return { token: null, user: null, client: null };
    }

    return {
      token: savedToken,
      user: JSON.parse(savedUser),
      client: savedClient ? JSON.parse(savedClient) : null,
    };
  } catch {
    clearStoredClientAuth();
    return { token: null, user: null, client: null };
  }
}

export function useClientAuth() {
  const ctx = useContext(ClientAuthContext);
  if (!ctx) throw new Error('useClientAuth must be used within ClientAuthProvider');
  return ctx;
}

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialAuth] = useState(readStoredClientAuth);
  const [user, setUser] = useState<ClientUser | null>(initialAuth.user);
  const [client, setClient] = useState<ClientInfo | null>(initialAuth.client);
  const [token, setToken] = useState<string | null>(initialAuth.token);
  const [isLoading] = useState(false);

  useEffect(() => {
    const handleTokenRefreshed = (event: Event) => {
      const detail = (event as CustomEvent<{ accessToken: string }>).detail;
      if (!detail?.accessToken) return;
      setToken(detail.accessToken);
    };

    const handleSessionExpired = (event: Event) => {
      const detail = (event as CustomEvent<{ reason?: string }>).detail || {};
      const reason = detail.reason || 'Client session expired';

      setToken(null);
      setUser(null);
      setClient(null);

      if (!location.pathname.includes('/client/login')) {
        navigate('/client/login', {
          state: { from: location, reason },
          replace: true,
        });
      }
    };

    window.addEventListener('schedit-client-auth-token-refreshed', handleTokenRefreshed);
    window.addEventListener('schedit-client-auth-session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('schedit-client-auth-token-refreshed', handleTokenRefreshed);
      window.removeEventListener('schedit-client-auth-session-expired', handleSessionExpired);
    };
  }, [location, navigate]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await clientApiRequest<{
      accessToken: string;
      refreshToken: string;
      user: ClientUser;
      client: ClientInfo;
    }>('/api/v1/clients/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuthRefresh: true,
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
        skipAuthRefresh: true,
      }).catch(() => {});
    }

    setToken(null);
    setUser(null);
    setClient(null);
    clearStoredClientAuth();
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
