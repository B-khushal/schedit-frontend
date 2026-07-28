import React, { useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, CalendarDays, PenSquare, BarChart3, Settings, Users,
  Sparkles, FolderOpen, ChevronsUpDown, Inbox, CreditCard, LogOut, Check,
  Image, Shield, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel, Avatar } from './ui';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
  { icon: FolderOpen, label: 'Projects', path: '/app/projects' },
  { icon: CalendarDays, label: 'Calendar', path: '/app/calendar' },
  { icon: PenSquare, label: 'Content Studio', path: '/app/studio' },
  { icon: Image, label: 'Assets', path: '/app/assets' },
  { icon: Inbox, label: 'Workflow', path: '/app/workflow' },
  { icon: BarChart3, label: 'Analytics', path: '/app/analytics' },
  { icon: BarChart3, label: 'Reports', path: '/app/reports' },
];

const workspaceItems = [
  { icon: Sparkles, label: 'AI Assistant', path: '/app/ai' },
  { icon: Users, label: 'Team', path: '/app/team' },
  { icon: Users, label: 'Client CRM', path: '/app/clients' },
];

const bottomNavItems = [
  { icon: CreditCard, label: 'Billing', path: '/app/billing' },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
];

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { organizations, currentOrg, currentProject, setCurrentOrg, setCurrentProject } = useWorkspace();
  const { user, logout } = useAuth();

  // Close on escape
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  // Swipe right to close
  const swipeHandlers = useSwipeGesture({
    onSwipe: (dir) => { if (dir === 'left') onClose(); },
    directions: ['left'],
    threshold: 60,
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" {...swipeHandlers}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-modal flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-gray-900 text-sm leading-tight truncate">
                    {currentProject?.name || currentOrg?.name || 'SCHEDIT Inc.'}
                  </span>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider truncate">
                    {currentProject ? (currentOrg?.name || 'SCHEDIT Inc.') : `${currentOrg?.subscriptionPlan || 'Free'} Plan`}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-3">
              <nav className="px-3 space-y-1 mb-4">
                <div className="px-2.5 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider h-5 flex items-end">
                  Overview
                </div>
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/app'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all touch-target",
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-brand-600" : "text-gray-500")} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              <nav className="px-3 space-y-1 mb-4">
                <div className="px-2.5 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider h-5 flex items-end">
                  Workspace
                </div>
                {workspaceItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all touch-target",
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-brand-600" : "text-gray-500")} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              <nav className="px-3 space-y-1">
                <div className="border-t border-gray-100 my-2" />
                {(user?.isPlatformOwner || user?.isPlatformAdmin || user?.email?.toLowerCase() === 'khushalprasad242@gmail.com') && (
                  <NavLink
                    to="/app/admin"
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all touch-target",
                        isActive
                          ? "bg-purple-100 text-purple-800"
                          : "text-purple-700 hover:bg-purple-50"
                      )
                    }
                  >
                    <Shield className="w-5 h-5 shrink-0 text-purple-600" />
                    <span className="font-bold">Platform Admin</span>
                  </NavLink>
                )}
                {bottomNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all touch-target",
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-brand-600" : "text-gray-500")} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* User profile */}
            <div className="p-3 border-t border-gray-200">
              <div className="flex items-center gap-3 p-2">
                <Avatar
                  src={user?.avatarUrl}
                  name={user?.name || 'Alex Carter'}
                  size="sm"
                />
                <div className="flex flex-col text-left min-w-0 flex-1">
                  <span className="text-sm font-bold text-gray-800 truncate leading-tight">
                    {user?.name || 'Alex Carter'}
                  </span>
                  <span className="text-xs text-gray-500 truncate mt-0.5">
                    {user?.email || 'alex@schedit.com'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => { logout(); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors touch-target"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
