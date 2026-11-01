import React, { useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  X,
  Shield,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './ui';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { currentOrg, currentProject } = useWorkspace();
  const { user, logout } = useAuth();
  const location = useLocation();

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

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const navGroups = [
    {
      label: 'Workspace',
      items: [
        { icon: LayoutDashboard, label: 'Overview', path: '/app' },
        { icon: FolderOpen, label: 'Projects', path: '/app/projects' },
        { icon: Users, label: 'Clients', path: '/app/clients' },
        { icon: Share2, label: 'Social Accounts', path: '/app/accounts' },
      ],
    },
    {
      label: 'Publishing',
      items: [
        { icon: PenSquare, label: 'Content Studio', path: '/app/studio' },
        { icon: CalendarDays, label: 'Content Calendar', path: '/app/calendar' },
        { icon: Inbox, label: 'Review Pipeline', path: '/app/workflow' },
        { icon: Image, label: 'Media Library', path: '/app/media' },
      ],
    },
    {
      label: 'Autonomous AI',
      isAi: true,
      items: [
        { icon: Sparkles, label: 'AI Command Center', path: '/app/ai' },
        { icon: Compass, label: 'AI Strategy', path: '/app/ai/strategy' },
        { icon: CalendarCheck2, label: 'Content Planner', path: '/app/ai/content-planner' },
        { icon: Wand2, label: 'Creative Studio', path: '/app/ai/creative-studio' },
        { icon: Cpu, label: 'Autonomy Controls', path: '/app/ai/automation' },
        { icon: GitBranch, label: 'Workflow Builder', path: '/app/ai/automation/workflows' },
        { icon: ShieldCheck, label: 'Approval Center', path: '/app/ai/approvals' },
        { icon: Activity, label: 'AI Activity Logs', path: '/app/ai/activity' },
        { icon: Brain, label: 'Business Memory', path: '/app/ai/business-memory' },
      ],
    },
    {
      label: 'Advertising',
      items: [
        { icon: Megaphone, label: 'Ads Command Center', path: '/app/ads' },
        { icon: Target, label: 'Campaigns', path: '/app/ads/campaigns' },
        { icon: LineChart, label: 'Ad Analytics', path: '/app/ads/analytics' },
      ],
    },
    {
      label: 'Analytics',
      items: [
        { icon: BarChart3, label: 'Performance', path: '/app/analytics' },
        { icon: FileText, label: 'Reports', path: '/app/reports' },
        { icon: Lightbulb, label: 'Recommendations', path: '/app/recommendations' },
      ],
    },
    {
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
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative neu-card rounded-r-3xl w-72 max-w-[85vw] h-full flex flex-col z-10 overflow-hidden bg-[var(--neu-surface)] text-[var(--neu-text-primary)]"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--neu-border-inset)]/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar src={user?.avatarUrl} name={user?.name || 'Khushal'} size="sm" />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-xs text-[var(--neu-text-primary)] truncate">{user?.name || 'Khushal'}</h3>
                  <p className="text-[10px] text-[var(--neu-text-muted)] truncate">{currentProject?.name || 'SchedIt OS'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 neu-button rounded-xl text-[var(--neu-text-muted)] hover:text-[var(--neu-text-primary)] transition-all touch-target"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {navGroups.map((group) => (
                <div key={group.label} className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[var(--neu-text-muted)] px-3 py-1">
                    {group.label}
                  </p>
                  {group.items.map((item) => {
                    const isExact = item.path === '/app';
                    const isActive = isExact
                      ? location.pathname === '/app'
                      : location.pathname.startsWith(item.path);
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={isExact}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all',
                          isActive
                            ? 'neu-button-inset text-blue-500'
                            : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] hover:neu-raised-sm',
                        )}
                      >
                        <Icon className={cn('w-4 h-4', isActive ? 'text-blue-500' : 'text-[var(--neu-text-muted)]')} />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[var(--neu-border-inset)]/60 shrink-0">
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="flex items-center gap-2.5 w-full p-2.5 rounded-2xl text-xs font-bold text-rose-500 hover:neu-raised-sm transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
