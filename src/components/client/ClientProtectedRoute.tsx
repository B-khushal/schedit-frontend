import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useClientAuth } from '../../contexts/ClientAuthContext';

interface ClientProtectedRouteProps {
  children: React.ReactNode;
}

const AUTH_DEBUG =
  import.meta.env.DEV || import.meta.env.VITE_AUTH_DEBUG === 'true';

export function ClientProtectedRoute({ children }: ClientProtectedRouteProps) {
  const { isAuthenticated, isLoading, token, user } = useClientAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center animate-pulse shadow-brand">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <p className="text-sm text-gray-500 font-semibold">Loading client portal...</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (AUTH_DEBUG) {
      console.info('[auth]', 'redirect-to-client-login', {
        at: new Date().toISOString(),
        reason: !token ? 'No client token' : 'Client user null',
        hasToken: Boolean(token),
        hasUser: Boolean(user),
        from: location.pathname,
      });
    }
    return <Navigate to="/client/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
