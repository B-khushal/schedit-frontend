import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, CalendarDays, ClipboardCheck, CheckCircle2, XCircle, Bell, UserCircle, Settings, LogOut, ChevronsUpDown, ChevronLeft, ChevronRight, Building2, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel, Avatar } from '../ui';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/client/dashboard' },
  { icon: FolderOpen, label: 'Projects', path: '/client/projects' },
  { icon: CalendarDays, label: 'Calendar', path: '/client/calendar' },
];

const reviewItems = [
  { icon: ClipboardCheck, label: 'Pending Reviews', path: '/client/reviews' },
  { icon: CheckCircle2, label: 'Approved', path: '/client/approved' },
  { icon: XCircle, label: 'Rejected', path: '/client/rejected' },
];

const bottomItems = [
  { icon: Bell, label: 'Notifications', path: '/client/notifications' },
  { icon: UserCircle, label: 'Profile', path: '/client/profile' },
  { icon: Settings, label: 'Settings', path: '/client/settings' },
];

export function ClientSidebar() {
  const { user, client, logout } = useClientAuth();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('schedit_client_sidebar_collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('schedit_client_sidebar_collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const renderNavItem = (item: typeof navItems[0]) => (
    <NavLink
      key={item.path}
      to={item.path}
      end={item.path === '/client/dashboard'}
      className={({ isActive }) =>
        cn(
          "flex items-center rounded-xl text-sm font-semibold transition-all group/nav relative",
          isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
          isActive
            ? "bg-brand-50 text-brand-700"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-brand-600" : "text-gray-500 group-hover/nav:text-gray-700")} />
          {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-md">
              {item.label}
            </div>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 68 : 240 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="border-r border-gray-200 bg-white flex flex-col h-full shrink-0 relative z-20 group"
    >
      {/* Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-6 bg-white border border-gray-200 shadow-sm p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-50 z-30 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Client Brand Header */}
      <div className="p-3">
        <div className={cn(
          "flex items-center w-full p-2 rounded-xl border border-transparent",
          isCollapsed ? "justify-center" : "gap-3"
        )}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden text-left min-w-0">
              <span className="font-bold text-gray-900 text-sm leading-tight truncate">
                {client?.companyName || 'Client Portal'}
              </span>
              <span className="text-[10px] text-brand-600 font-bold uppercase tracking-wider truncate">
                Client Portal
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-2">
        <nav className="px-3 space-y-1 mb-6">
          {!isCollapsed && (
            <div className="px-2.5 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider h-5 flex items-end">
              Overview
            </div>
          )}
          {navItems.map(renderNavItem)}
        </nav>

        <nav className="px-3 space-y-1">
          {!isCollapsed && (
            <div className="px-2.5 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider h-5 flex items-end">
              Reviews
            </div>
          )}
          {reviewItems.map(renderNavItem)}
        </nav>
      </div>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-200">
        <div className="space-y-1">
          {bottomItems.map(renderNavItem)}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <Dropdown
            align="left"
            trigger={
              <div className={cn(
                "flex items-center p-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer",
                isCollapsed ? "justify-center" : "gap-3"
              )}>
                <Avatar src={user?.avatarUrl} name={user?.name || 'Client'} size="sm" />
                {!isCollapsed && (
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-sm font-bold text-gray-800 truncate leading-tight">
                      {user?.name || 'Client User'}
                    </span>
                    <span className="text-xs text-gray-500 truncate mt-0.5">
                      {user?.email || 'client@example.com'}
                    </span>
                  </div>
                )}
              </div>
            }
            className="w-48 ml-2 bottom-full mb-2"
          >
            <DropdownLabel>Account</DropdownLabel>
            <DropdownItem onClick={logout} destructive icon={<LogOut className="w-4 h-4" />}>
              Sign Out
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </motion.aside>
  );
}
