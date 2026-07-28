import React, { useState, useEffect } from 'react';
import { Bell, Search, Check, AlertCircle, Folder, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useLocation, Link } from 'react-router-dom';
import { SearchCommand, Dropdown, DropdownItem, DropdownLabel, DropdownSeparator, Avatar } from './ui';
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
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const { isMobileNav, isMobile } = useResponsive();
  
  // Notification states
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
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
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

  // Generate breadcrumbs from route path
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
      <header className="sticky top-0 z-30 h-14 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-3 sm:px-4 md:px-6 shrink-0 transition-all gap-2">
        {/* Left: Hamburger + Breadcrumbs / Page Title & Project Switcher */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {/* Hamburger menu — mobile/tablet only */}
          {isMobileNav && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-target shrink-0 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Breadcrumbs — hidden on mobile */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-gray-500 min-w-0">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-gray-300">/</span>}
                {crumb.href ? (
                  <Link to={crumb.href} className="hover:text-gray-900 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 truncate">{title}</span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Project switcher — hidden on mobile */}
          {currentOrg && currentOrg.projects && currentOrg.projects.length > 0 && (
            <div className="hidden md:flex items-center gap-2 border-l border-gray-200 pl-4">
              <Dropdown
                align="left"
                trigger={
                  <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 transition-colors cursor-pointer shadow-xs">
                    <Folder className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate max-w-[120px]">{currentProject?.name || 'Select Project'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
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
                    <span className="truncate max-w-[140px]">{proj.name}</span>
                    {currentProject?.id === proj.id && <Check className="w-3.5 h-3.5 text-brand-650 shrink-0" />}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>
          )}

          {/* Mobile page title */}
          <h1 className="md:hidden text-sm font-bold text-gray-900 font-display truncate">{title}</h1>
        </div>

        {/* Right: Action Panel */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search — icon on mobile, input on desktop */}
          {isMobile ? (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-target"
              aria-label="Search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
          ) : (
            <div 
              onClick={() => setSearchOpen(true)}
              className="relative group cursor-pointer"
            >
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-brand-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search (⌘K)..." 
                readOnly
                className="pl-9 pr-12 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-100/50 w-48 lg:w-64 transition-all text-gray-700 placeholder:text-gray-400 focus:outline-none"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-0.5">
                <kbd className="hidden sm:inline-block border border-gray-200 bg-white rounded px-1.5 text-[9px] font-bold text-gray-400 shadow-xs">⌘</kbd>
                <kbd className="hidden sm:inline-block border border-gray-200 bg-white rounded px-1.5 text-[9px] font-bold text-gray-400 shadow-xs">K</kbd>
              </div>
            </div>
          )}
          
          {/* Notifications Dropdown */}
          <Dropdown
            align="right"
            trigger={
              <button className="relative p-2 text-gray-500 hover:text-gray-900 transition-all rounded-lg hover:bg-gray-50 cursor-pointer touch-target">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
            }
            className="w-80 max-w-[calc(100vw-2rem)] max-h-96 overflow-y-auto"
          >
            <DropdownLabel>Notifications</DropdownLabel>
            <DropdownSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400 font-medium">
                No notifications found
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`flex gap-2.5 p-3 text-xs transition-colors hover:bg-gray-50 relative ${!n.read ? 'bg-brand-50/30' : ''}`}
                >
                  <div className="shrink-0 mt-0.5">
                    {n.eventType?.includes('fail') ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Check className="w-4 h-4 text-brand-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <p className="font-bold text-gray-900 truncate pr-4">{n.title}</p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      className="absolute right-2 bottom-2 text-[10px] text-brand-500 hover:text-brand-600 font-semibold"
                      title="Mark as read"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))
            )}
            <DropdownSeparator />
            <Link to="/app/notifications" className="block text-center py-2 text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors">
              View all notifications
            </Link>
          </Dropdown>
          
          {/* User profile avatar info */}
          <Link to="/app/settings">
            <Avatar
              src={user?.avatarUrl}
              name={user?.name || 'Alex Carter'}
              size="sm"
              className="cursor-pointer hover:opacity-90 transition-opacity"
            />
          </Link>
        </div>
      </header>

      {/* Global search commands modal shortcut overlay */}
      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
