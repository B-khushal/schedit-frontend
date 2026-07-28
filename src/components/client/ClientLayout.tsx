import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ClientSidebar } from './ClientSidebar';
import { ErrorBoundary } from '../ErrorBoundary';
import { Bell, Search, User, LogOut, Settings, LayoutDashboard, FileCheck, FolderKanban } from 'lucide-react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { Avatar } from '../ui';

export function ClientLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useClientAuth();

  let title = 'Dashboard';
  if (location.pathname.includes('/projects')) title = 'Projects';
  if (location.pathname.includes('/calendar')) title = 'Calendar';
  if (location.pathname.includes('/reviews')) title = 'Review Queue';
  if (location.pathname.includes('/approved')) title = 'Approved Content';
  if (location.pathname.includes('/rejected')) title = 'Rejected Content';
  if (location.pathname.includes('/notifications')) title = 'Notifications';
  if (location.pathname.includes('/profile')) title = 'Profile';
  if (location.pathname.includes('/settings')) title = 'Settings';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownOpen && !(e.target as HTMLElement).closest('#client-account-menu')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/client/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 text-gray-900 font-sans selection:bg-brand-500/30 text-left select-none">
      <ClientSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative bg-gray-50/50">
        {/* Header */}
        <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-gray-900 font-display tracking-tight">{title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <Bell className="w-4 h-4" />
            </button>

            {/* Client Account Dropdown Menu */}
            <div className="relative" id="client-account-menu">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 bg-white border border-gray-200 hover:border-brand-300 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Avatar src={user?.avatarUrl} name={user?.name || 'Client'} size="sm" />
                <span className="text-xs font-bold text-gray-800 hidden sm:inline-block pr-1">{user?.name || 'Account'}</span>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-50 text-left"
                  >
                    <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-xl mb-1">
                      <p className="text-xs font-bold text-gray-900">{user?.name || 'Client Account'}</p>
                      <p className="text-[10px] text-gray-500 font-mono truncate">{user?.email}</p>
                      <span className="mt-1 inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                        CLIENT PORTAL
                      </span>
                    </div>

                    <div className="space-y-0.5 py-1">
                      <Link
                        to="/client/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-brand-600" />
                        <span>Client Dashboard</span>
                      </Link>
                      <Link
                        to="/client/reviews"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <FileCheck className="w-4 h-4 text-indigo-600" />
                        <span>Review Queue</span>
                      </Link>
                      <Link
                        to="/client/projects"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <FolderKanban className="w-4 h-4 text-emerald-600" />
                        <span>My Projects</span>
                      </Link>
                      <Link
                        to="/client/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span>Profile & Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 mt-1 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth bg-transparent">
          <ErrorBoundary>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
