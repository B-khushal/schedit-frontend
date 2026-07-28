import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, PenSquare, BarChart3, Settings, Users, Sparkles, FolderOpen, ChevronsUpDown, ChevronLeft, ChevronRight, Inbox, CreditCard, LogOut, Check, Image, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel, Avatar } from './ui';
import { useResponsive } from '../hooks/useMediaQuery';

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

export function Sidebar() {
  const { organizations, currentOrg, currentProject, setCurrentOrg, setCurrentProject } = useWorkspace();
  const { user, logout } = useAuth();
  const { isTablet, isDesktop } = useResponsive();
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('schedit_sidebar_collapsed');
    return saved === 'true';
  });

  // Auto-collapse on tablet
  useEffect(() => {
    if (isTablet) {
      setIsCollapsed(true);
    }
  }, [isTablet]);

  useEffect(() => {
    if (isDesktop) {
      localStorage.setItem('schedit_sidebar_collapsed', isCollapsed.toString());
    }
  }, [isCollapsed, isDesktop]);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 68 : 240 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="border-r border-gray-200 bg-white flex flex-col h-full shrink-0 relative z-20 group hidden lg:flex"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Toggle button — only show on desktop */}
      {isDesktop && !isTablet && (
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-6 bg-white border border-gray-200 shadow-sm p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-50 z-30 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}

      {/* Workspace Switcher */}
      <div className="p-3">
        <Dropdown
          align="left"
          trigger={
            <div className={cn(
              "flex items-center w-full p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-200", 
              isCollapsed ? "justify-center" : "justify-between"
            )}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col overflow-hidden text-left min-w-0">
                    <span className="font-bold text-gray-900 text-sm leading-tight truncate">
                      {currentProject?.name || currentOrg?.name || 'SCHEDIT Inc.'}
                    </span>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider truncate">
                      {currentProject ? (currentOrg?.name || 'SCHEDIT Inc.') : `${currentOrg?.subscriptionPlan || 'Free'} Plan`}
                    </span>
                  </div>
                )}
              </div>
              {!isCollapsed && <ChevronsUpDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />}
            </div>
          }
          className="w-56 ml-2"
        >
          <DropdownLabel>Organizations</DropdownLabel>
          {organizations.map((org) => (
            <DropdownItem
              key={org.id}
              onClick={() => setCurrentOrg(org)}
              className="justify-between"
            >
              <span>{org.name}</span>
              {currentOrg?.id === org.id && <Check className="w-4 h-4 text-brand-600" />}
            </DropdownItem>
          ))}
          
          {currentOrg && currentOrg.projects && currentOrg.projects.length > 0 && (
            <>
              <DropdownSeparator />
              <DropdownLabel>Projects</DropdownLabel>
              {currentOrg.projects.map((proj) => (
                <DropdownItem
                  key={proj.id}
                  onClick={() => setCurrentProject(proj)}
                  className="justify-between"
                >
                  <span className="truncate">{proj.name}</span>
                  {currentProject?.id === proj.id && <Check className="w-4 h-4 text-brand-600" />}
                </DropdownItem>
              ))}
            </>
          )}
        </Dropdown>
      </div>
      
      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-2">
        <nav className="px-3 space-y-1 mb-6">
          {!isCollapsed && (
            <div className="px-2.5 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider h-5 flex items-end">
              Overview
            </div>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
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
          ))}
        </nav>

        <nav className="px-3 space-y-1">
          {!isCollapsed && (
            <div className="px-2.5 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider h-5 flex items-end">
              Workspace
            </div>
          )}
          {workspaceItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
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
          ))}
        </nav>
      </div>

      {/* Bottom Nav / Settings / Profile */}
      <div className="p-3 border-t border-gray-200">
        <div className="space-y-1">
          {(user?.isPlatformOwner || user?.isPlatformAdmin || user?.email?.toLowerCase() === 'khushalprasad242@gmail.com') && (
            <NavLink
              to="/app/admin"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-xl text-sm font-semibold transition-all group/nav relative",
                  isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                  isActive 
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" 
                    : "text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Shield className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-purple-700" : "text-purple-600")} />
                  {!isCollapsed && <span className="whitespace-nowrap font-bold">Platform Admin</span>}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-md">
                      Platform Admin
                    </div>
                  )}
                </>
              )}
            </NavLink>
          )}

          {bottomNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
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
          ))}
        </div>
        
        {/* User profile dropdown triggers logout */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Dropdown
            align="left"
            trigger={
              <div className={cn(
                "flex items-center p-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer", 
                isCollapsed ? "justify-center" : "gap-3"
              )}>
                <Avatar
                  src={user?.avatarUrl}
                  name={user?.name || 'Alex Carter'}
                  size="sm"
                />
                {!isCollapsed && (
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-sm font-bold text-gray-800 truncate leading-tight">
                      {user?.name || 'Alex Carter'}
                    </span>
                    <span className="text-xs text-gray-500 truncate mt-0.5">
                      {user?.email || 'alex@schedit.com'}
                    </span>
                  </div>
                )}
              </div>
            }
            className="w-48 ml-2 bottom-full mb-2"
          >
            <DropdownLabel>Account Menu</DropdownLabel>
            <DropdownItem onClick={logout} destructive icon={<LogOut className="w-4 h-4" />}>
              Sign Out
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </motion.aside>
  );
}
