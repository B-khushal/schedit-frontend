import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Share2,
  PenSquare,
  CalendarDays,
  Inbox,
  Image,
  Sparkles,
  Compass,
  CalendarCheck2,
  Wand2,
  Cpu,
  GitBranch,
  ShieldCheck,
  Activity,
  Brain,
  Megaphone,
  Target,
  LineChart,
  BarChart3,
  FileText,
  Lightbulb,
  Settings,
  Key,
  Layers,
  CreditCard,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsUpDown,
  Check,
  Shield,
  Circle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel, Avatar } from './ui';
import { useResponsive } from '../hooks/useMediaQuery';
import { apiRequest } from '../lib/api';

interface NavSection {
  id: string;
  label: string;
  isAi?: boolean;
  items: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    path: string;
    badge?: string | number;
    badgeVariant?: 'brand' | 'amber' | 'neutral';
  }[];
}

export function Sidebar() {
  const { organizations, currentOrg, currentProject, setCurrentOrg, setCurrentProject } = useWorkspace();
  const { user, logout } = useAuth();
  const { isTablet, isDesktop } = useResponsive();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('schedit_sidebar_collapsed');
    return saved === 'true';
  });

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('schedit_sidebar_groups');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [aiStatus, setAiStatus] = useState<{ mode: string; emergencyStop: boolean } | null>(null);

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

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = { ...prev, [sectionId]: !prev[sectionId] };
      localStorage.setItem('schedit_sidebar_groups', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    if (!currentProject?.id) return;
    let isMounted = true;

    const fetchNavStatus = async () => {
      try {
        const [dashData, apprvData] = await Promise.allSettled([
          apiRequest(`/api/v1/projects/${currentProject.id}/ai/dashboard`),
          apiRequest(`/api/v1/projects/${currentProject.id}/ai/approvals`),
        ]);

        if (isMounted) {
          if (dashData.status === 'fulfilled' && dashData.value?.operationalStatus) {
            setAiStatus({
              mode: dashData.value.operationalStatus.mode,
              emergencyStop: dashData.value.operationalStatus.emergencyStop,
            });
          }
          if (apprvData.status === 'fulfilled' && Array.isArray(apprvData.value)) {
            setPendingApprovalsCount(apprvData.value.length);
          }
        }
      } catch (err) {
        // Silently handle fallback
      }
    };

    fetchNavStatus();
    const interval = setInterval(fetchNavStatus, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentProject?.id]);

  const navSections: NavSection[] = [
    {
      id: 'workspace',
      label: 'Workspace',
      items: [
        { icon: LayoutDashboard, label: 'Overview', path: '/app' },
        { icon: FolderOpen, label: 'Projects', path: '/app/projects' },
        { icon: Users, label: 'Clients', path: '/app/clients' },
        { icon: Share2, label: 'Social Accounts', path: '/app/accounts' },
      ],
    },
    {
      id: 'publishing',
      label: 'Publishing',
      items: [
        { icon: PenSquare, label: 'Content Studio', path: '/app/studio' },
        { icon: CalendarDays, label: 'Content Calendar', path: '/app/calendar' },
        { icon: Inbox, label: 'Review Pipeline', path: '/app/workflow' },
        { icon: Image, label: 'Media Library', path: '/app/media' },
      ],
    },
    {
      id: 'autonomous_ai',
      label: 'Autonomous AI',
      isAi: true,
      items: [
        { icon: Sparkles, label: 'AI Command Center', path: '/app/ai' },
        { icon: Compass, label: 'AI Strategy', path: '/app/ai/strategy' },
        { icon: CalendarCheck2, label: 'Content Planner', path: '/app/ai/content-planner' },
        { icon: Wand2, label: 'Creative Studio', path: '/app/ai/creative-studio' },
        { icon: Cpu, label: 'Autonomy Controls', path: '/app/ai/automation' },
        { icon: GitBranch, label: 'Workflow Builder', path: '/app/ai/automation/workflows' },
        {
          icon: ShieldCheck,
          label: 'Approval Center',
          path: '/app/ai/approvals',
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeVariant: 'amber',
        },
        { icon: Activity, label: 'AI Activity Logs', path: '/app/ai/activity' },
        { icon: Brain, label: 'Business Memory', path: '/app/ai/business-memory' },
      ],
    },
    {
      id: 'advertising',
      label: 'Advertising',
      items: [
        { icon: Megaphone, label: 'Ads Command Center', path: '/app/ads' },
        { icon: Target, label: 'Campaigns', path: '/app/ads/campaigns' },
        { icon: LineChart, label: 'Ad Analytics', path: '/app/ads/analytics' },
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      items: [
        { icon: BarChart3, label: 'Performance', path: '/app/analytics' },
        { icon: FileText, label: 'Reports', path: '/app/reports' },
        { icon: Lightbulb, label: 'Recommendations', path: '/app/recommendations' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      items: [
        { icon: Settings, label: 'Workspace Settings', path: '/app/settings' },
        { icon: Key, label: 'AI Provider Settings', path: '/app/settings/ai' },
        { icon: Layers, label: 'Integrations', path: '/app/connections' },
        { icon: CreditCard, label: 'Billing and Usage', path: '/app/billing' },
        { icon: Users, label: 'Permissions & Team', path: '/app/team' },
      ],
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 270 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="neu-card border-r-0 rounded-none sm:rounded-r-3xl bg-[var(--neu-surface)] flex flex-col h-full shrink-0 relative z-20 group hidden lg:flex select-none my-0"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Desktop collapse toggle */}
      {isDesktop && !isTablet && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-8 neu-button rounded-full p-1.5 text-[var(--neu-text-secondary)] hover:text-blue-500 z-30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Top Profile / SchedIt Branding inspired by reference image */}
      <div className="p-4 flex flex-col items-center border-b border-[var(--neu-border-inset)]/50 shrink-0">
        {!isCollapsed ? (
          <div className="flex flex-col items-center w-full">
            {/* Soft circular user avatar frame inspired by reference image */}
            <div className="p-1 neu-inset rounded-full mb-2.5">
              <Avatar
                src={user?.avatarUrl}
                name={user?.name || 'Khushal'}
                size="lg"
                className="w-16 h-16"
              />
            </div>
            <h2 className="text-sm font-extrabold text-[var(--neu-text-primary)] font-display tracking-tight text-center truncate max-w-[200px]">
              {user?.name || 'Khushal'}
            </h2>
            <p className="text-[11px] font-semibold text-[var(--neu-text-muted)] text-center truncate max-w-[200px]">
              {currentProject?.name || 'SchedIt Marketing OS'}
            </p>
          </div>
        ) : (
          <div className="p-1 neu-inset rounded-full">
            <Avatar
              src={user?.avatarUrl}
              name={user?.name || 'Khushal'}
              size="sm"
              className="w-9 h-9"
            />
          </div>
        )}

        {/* Workspace Switcher dropdown */}
        <div className="w-full mt-3">
          <Dropdown
            align="left"
            trigger={
              <div
                className={cn(
                  'flex items-center w-full p-2 neu-button rounded-xl cursor-pointer transition-all',
                  isCollapsed ? 'justify-center' : 'justify-between',
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-white font-black text-[10px] shrink-0 shadow-xs">
                    {currentProject?.name?.charAt(0) || currentOrg?.name?.charAt(0) || 'S'}
                  </div>
                  {!isCollapsed && (
                    <div className="flex flex-col overflow-hidden text-left min-w-0">
                      <span className="font-bold text-[var(--neu-text-primary)] text-xs truncate">
                        {currentProject?.name || currentOrg?.name || 'Workspace'}
                      </span>
                    </div>
                  )}
                </div>
                {!isCollapsed && <ChevronsUpDown className="w-3.5 h-3.5 text-[var(--neu-text-muted)] shrink-0 ml-1" />}
              </div>
            }
            className="w-56 ml-2"
          >
            <DropdownLabel>Organizations</DropdownLabel>
            {organizations.map((org) => (
              <DropdownItem key={org.id} onClick={() => setCurrentOrg(org)} className="justify-between text-xs">
                <span className="truncate">{org.name}</span>
                {currentOrg?.id === org.id && <Check className="w-3.5 h-3.5 text-blue-500" />}
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
                    className="justify-between text-xs"
                  >
                    <span className="truncate">{proj.name}</span>
                    {currentProject?.id === proj.id && <Check className="w-3.5 h-3.5 text-blue-500" />}
                  </DropdownItem>
                ))}
              </>
            )}
          </Dropdown>
        </div>

        {/* AI Operational Status Pill */}
        {!isCollapsed && (
          <NavLink
            to="/app/ai"
            className={cn(
              'mt-2.5 w-full px-3 py-1.5 neu-pill-inset flex items-center justify-between text-[11px] font-bold transition-all',
              aiStatus?.emergencyStop ? 'text-rose-500' : 'text-emerald-500',
            )}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0 shadow-xs',
                  aiStatus?.emergencyStop ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-pulse',
                )}
              />
              <span className="truncate">
                {aiStatus?.emergencyStop
                  ? 'AI Paused (Stop Active)'
                  : `AI: ${aiStatus?.mode?.replace('_', ' ') || 'Autonomous'}`}
              </span>
            </div>
            <Sparkles className="w-3 h-3 shrink-0 opacity-80" />
          </NavLink>
        )}
      </div>

      {/* Navigation Sections with Inset Active States */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-3 px-3 space-y-4">
        {navSections.map((section) => {
          const isSectionCollapsed = !!collapsedSections[section.id];
          return (
            <div key={section.id} className="space-y-1">
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--neu-text-muted)] hover:text-[var(--neu-text-secondary)] transition-colors cursor-pointer"
                >
                  <span className={cn('flex items-center gap-1.5', section.isAi && 'text-blue-500 font-black')}>
                    {section.isAi && <Sparkles className="w-3 h-3" />}
                    {section.label}
                  </span>
                  {isSectionCollapsed ? (
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  ) : (
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  )}
                </button>
              )}

              <AnimatePresence initial={false}>
                {(!isSectionCollapsed || isCollapsed) && (
                  <motion.div
                    initial={false}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-1"
                  >
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isExact = item.path === '/app';
                      const isActive = isExact
                        ? location.pathname === '/app'
                        : location.pathname.startsWith(item.path);

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end={isExact}
                          className={cn(
                            'flex items-center rounded-2xl text-xs font-bold transition-all group/nav relative cursor-pointer select-none',
                            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                            isActive
                              ? 'neu-button-inset text-blue-500'
                              : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] hover:neu-raised-sm',
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-4 h-4 shrink-0 transition-colors',
                              isActive ? 'text-blue-500' : 'text-[var(--neu-text-muted)] group-hover/nav:text-blue-500',
                            )}
                          />

                          {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

                          {!isCollapsed && item.badge != null && (
                            <span
                              className={cn(
                                'text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none shrink-0',
                                item.badgeVariant === 'amber'
                                  ? 'neu-inset-sm text-amber-500'
                                  : 'neu-inset-sm text-blue-500',
                              )}
                            >
                              {item.badge}
                            </span>
                          )}

                          {isCollapsed && (
                            <div className="absolute left-full ml-3 px-2.5 py-1.5 neu-raised text-[var(--neu-text-primary)] text-xs font-bold rounded-xl opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-lg flex items-center gap-1.5">
                              <span>{item.label}</span>
                              {item.badge != null && (
                                <span className="neu-pill-inset text-amber-500 font-extrabold px-1.5 text-[9px]">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          )}
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer / Account & Sign Out */}
      <div className="p-3 border-t border-[var(--neu-border-inset)]/50 shrink-0 space-y-1.5">
        {(user?.isPlatformOwner || user?.isPlatformAdmin || user?.email?.toLowerCase() === 'khushalprasad242@gmail.com') && (
          <NavLink
            to="/app/admin"
            className={cn(
              'flex items-center rounded-2xl text-xs font-bold transition-all group/nav relative',
              isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2',
              location.pathname.startsWith('/app/admin')
                ? 'neu-button-inset text-purple-600'
                : 'text-purple-600 hover:neu-raised-sm',
            )}
          >
            <Shield className="w-4 h-4 shrink-0 text-purple-600" />
            {!isCollapsed && <span className="truncate">Platform Admin</span>}
          </NavLink>
        )}

        <button
          onClick={logout}
          className={cn(
            'flex items-center w-full rounded-2xl text-xs font-bold text-rose-500 hover:neu-raised-sm transition-all p-2.5 cursor-pointer',
            isCollapsed ? 'justify-center' : 'gap-2.5 px-3',
          )}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
