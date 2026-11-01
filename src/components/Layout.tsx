import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useKeyboard } from '../hooks/useKeyboard';
import { SearchCommand } from './ui';
import { FreePlanBanner } from './plan/FreePlanBanner';
import { ErrorBoundary } from './ErrorBoundary';
import { BottomNavigation } from './BottomNavigation';
import { MobileDrawer } from './MobileDrawer';
import { useResponsive } from '../hooks/useMediaQuery';

export function Layout() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isMobileNav } = useResponsive();

  // Trigger search palette on ⌘K / ctrl+k keydown combinations
  useKeyboard('ctrl+k', () => setSearchOpen(true));

  let title = 'Dashboard';
  if (location.pathname.includes('/ai/strategy')) title = 'AI Strategy';
  else if (location.pathname.includes('/ai/content-planner')) title = 'AI Content Planner';
  else if (location.pathname.includes('/ai/creative-studio')) title = 'AI Creative Studio';
  else if (location.pathname.includes('/ai/automation/workflows')) title = 'Visual Workflow Builder';
  else if (location.pathname.includes('/ai/automation')) title = 'Autonomy Control Center';
  else if (location.pathname.includes('/ai/approvals')) title = 'Approval Center';
  else if (location.pathname.includes('/ai/activity')) title = 'AI Activity Logs';
  else if (location.pathname.includes('/ai/business-memory')) title = 'Business Memory';
  else if (location.pathname.includes('/ai')) title = 'AI Command Center';
  else if (location.pathname.includes('/ads')) title = 'Ads Command Center';
  else if (location.pathname.includes('/calendar')) title = 'Content Calendar';
  else if (location.pathname.includes('/studio')) title = 'Content Studio';
  else if (location.pathname.includes('/workflow')) title = 'Content Workflow';
  else if (location.pathname.includes('/analytics')) title = 'Performance Analytics';
  else if (location.pathname.includes('/reports')) title = 'Marketing Reports';
  else if (location.pathname.includes('/recommendations')) title = 'AI Recommendations';
  else if (location.pathname.includes('/media')) title = 'Media Library';
  else if (location.pathname.includes('/team')) title = 'Team & Permissions';
  else if (location.pathname.includes('/billing')) title = 'Billing & Subscriptions';
  else if (location.pathname.includes('/settings')) title = 'Workspace Settings';
  else if (location.pathname.includes('/projects')) title = 'Projects';
  else if (location.pathname.includes('/clients')) title = 'Clients Management';
  else if (location.pathname.includes('/notifications')) title = 'Notifications Center';
  else if (location.pathname.includes('/admin')) title = 'Platform Admin Portal';

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[var(--neu-bg)] text-[var(--neu-text-primary)] font-sans selection:bg-blue-500/20">
      {/* Desktop/Tablet sidebar — hidden on mobile */}
      {!isMobileNav && <Sidebar />}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative bg-[var(--neu-bg)]">
        <Header title={title} onMenuClick={() => setDrawerOpen(true)} />
        <FreePlanBanner />
        <main className={`flex-1 overflow-y-auto relative scroll-smooth bg-transparent ${isMobileNav ? 'pb-bottom-nav' : ''}`}>
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

      {/* Mobile bottom navigation */}
      {isMobileNav && (
        <BottomNavigation onMoreClick={() => setDrawerOpen(true)} />
      )}

      {/* Mobile navigation drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Global Hotkey Search Command Palette */}
      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
