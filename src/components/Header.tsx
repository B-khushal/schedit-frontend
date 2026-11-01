import React, { useState, useEffect } from 'react';
import { Bell, Search, Check, AlertCircle, Folder, ChevronDown, Menu, Sun, Moon, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { SearchCommand, Dropdown, DropdownItem, DropdownLabel, DropdownSeparator, Avatar, Button } from './ui';
import { apiRequest } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { useResponsive } from '../hooks/useMediaQuery';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const { currentProject, currentOrg, setCurrentProject } = useWorkspace();
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const { isMobileNav, isMobile } = useResponsive();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await apiRequest('/api/v1/notifications');
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiRequest(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const breadcrumbs = React.useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'App', href: '/app' }];

    let path = '';
    parts.forEach((part, i) => {
      if (part === 'app') return;
      path += `/${part}`;
      crumbs.push({
        label: part.charAt(0).toUpperCase() + part.slice(1),
        href: i === parts.length - 1 ? undefined : `/app${path}`
      });
    });

    return crumbs;
  }, [location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-[var(--neu-bg)] border-b border-[var(--neu-border-inset)]/60 flex items-center justify-between px-3 sm:px-6 md:px-8 shrink-0 transition-all gap-3">
        {/* Left: Mobile Trigger + Breadcrumbs / Page Title & Project Switcher */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isMobileNav && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 neu-button rounded-xl text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] transition-all touch-target shrink-0 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Breadcrumbs matching reference: "Dashboard / Home" */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-bold text-[var(--neu-text-muted)] min-w-0">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="opacity-40">/</span>}
                {crumb.href ? (
                  <Link to={crumb.href} className="hover:text-blue-500 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[var(--neu-text-primary)] font-extrabold tracking-tight truncate">{title}</span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Project switcher */}
          {currentOrg && currentOrg.projects && currentOrg.projects.length > 0 && (
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[var(--neu-border-inset)]/60">
              <Dropdown
                align="left"
                trigger={
                  <button className="flex items-center gap-2 px-3 py-1.5 neu-button rounded-xl text-xs font-bold text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] transition-all cursor-pointer">
                    <Folder className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate max-w-[130px]">{currentProject?.name || 'Select Project'}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  </button>
                }
              >
                <DropdownLabel>Switch Project</DropdownLabel>
                {currentOrg.projects.map((proj) => (
                  <DropdownItem
                    key={proj.id}
                    onClick={() => setCurrentProject(proj)}
                    className="justify-between text-xs font-semibold"
                  >
                    <span className="truncate max-w-[150px]">{proj.name}</span>
                    {currentProject?.id === proj.id && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>
          )}

          {/* Mobile title */}
          <h1 className="md:hidden text-sm font-extrabold text-[var(--neu-text-primary)] font-display truncate">{title}</h1>
        </div>

        {/* Center: Inset pill search bar inspired by reference image */}
        <div className="hidden sm:flex items-center flex-1 max-w-xs md:max-w-sm lg:max-w-md mx-2">
          <div
            onClick={() => setSearchOpen(true)}
            className="w-full relative group cursor-pointer"
          >
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--neu-text-muted)] group-hover:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search content, campaigns... (⌘K)"
              readOnly
              className="w-full pl-10 pr-12 py-2 neu-pill-inset text-xs sm:text-sm text-[var(--neu-text-primary)] placeholder:text-[var(--neu-text-muted)] cursor-pointer focus:outline-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-0.5">
              <kbd className="neu-raised-sm rounded-md px-1.5 py-0.5 text-[9px] font-extrabold text-[var(--neu-text-muted)]">⌘K</kbd>
            </div>
          </div>
        </div>

        {/* Right: Actions (Theme Toggle, Create, Notifications, Profile) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile search icon */}
          {isMobile && (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 neu-button rounded-xl text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] transition-all touch-target"
              aria-label="Search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
          )}

          {/* Quick Create Post button */}
          <button
            onClick={() => navigate('/app/studio')}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 neu-button-primary rounded-xl text-xs font-bold text-white transition-all cursor-pointer select-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 neu-button rounded-xl text-[var(--neu-text-secondary)] hover:text-blue-500 transition-all cursor-pointer"
            title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>

          {/* Notifications Dropdown with Soft Button */}
          <Dropdown
            align="right"
            trigger={
              <button
                className="relative p-2.5 neu-button rounded-xl text-[var(--neu-text-secondary)] hover:text-blue-500 transition-all cursor-pointer touch-target"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                )}
              </button>
            }
            className="w-80 max-w-[calc(100vw-2rem)] max-h-96 overflow-y-auto"
          >
            <DropdownLabel>Notifications</DropdownLabel>
            <DropdownSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--neu-text-muted)] font-medium">
                No notifications found
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-2.5 p-3 text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5 relative ${!n.read ? 'neu-inset-sm my-1 rounded-xl' : ''}`}
                >
                  <div className="shrink-0 mt-0.5">
                    {n.eventType?.includes('fail') ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <p className="font-bold text-[var(--neu-text-primary)] truncate pr-4">{n.title}</p>
                      <span className="text-[10px] text-[var(--neu-text-muted)] whitespace-nowrap">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-[var(--neu-text-secondary)] mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      className="absolute right-2 bottom-2 text-[10px] text-blue-500 hover:text-blue-600 font-bold"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))
            )}
            <DropdownSeparator />
            <Link to="/app/notifications" className="block text-center py-2 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors">
              View all notifications
            </Link>
          </Dropdown>

          {/* User profile with name and avatar inspired by reference image ("Sweetie Mehtaa") */}
          <Link
            to="/app/settings"
            className="flex items-center gap-2.5 pl-1.5 py-1 pr-2.5 neu-button rounded-2xl hover:scale-102 transition-all group"
          >
            <Avatar
              src={user?.avatarUrl}
              name={user?.name || 'Khushal'}
              size="sm"
            />
            <span className="hidden xl:inline-block text-xs font-bold text-[var(--neu-text-primary)] group-hover:text-blue-500 transition-colors truncate max-w-[110px]">
              {user?.name || 'Khushal'}
            </span>
          </Link>
        </div>
      </header>

      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
