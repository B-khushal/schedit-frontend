import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, LogOut } from 'lucide-react';

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedUser, stopImpersonating } = useAuth();

  if (!isImpersonating) return null;

  return (
    <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 text-white px-4 py-2 flex items-center justify-between shadow-md text-xs sm:text-sm font-medium z-50 sticky top-0">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-purple-300 animate-pulse" />
        <span>
          <strong>Impersonation Active:</strong> Viewing SCHEDIT as{' '}
          <span className="underline font-bold">{impersonatedUser?.name || impersonatedUser?.email || 'Target User'}</span>
        </span>
      </div>

      <button
        onClick={stopImpersonating}
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-semibold backdrop-blur-sm transition-colors border border-white/30"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Exit Impersonation</span>
      </button>
    </div>
  );
}
