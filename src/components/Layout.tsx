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
  if (location.pathname.includes('/calendar')) title = 'Content Calendar';
  if (location.pathname.includes('/studio')) title = 'Content Studio';
  if (location.pathname.includes('/workflow')) title = 'Content Workflow';
  if (location.pathname.includes('/analytics')) title = 'Analytics Report';
  if (location.pathname.includes('/ai')) title = 'AI Assistant';
  if (location.pathname.includes('/media')) title = 'Media Library';
  if (location.pathname.includes('/team')) title = 'Team Management';
  if (location.pathname.includes('/billing')) title = 'Billing & Subscriptions';
  if (location.pathname.includes('/settings')) title = 'Workspace Settings';
  if (location.pathname.includes('/projects')) title = 'Projects';
  if (location.pathname.includes('/notifications')) title = 'Notifications Center';
  if (location.pathname.includes('/admin')) title = 'Platform Admin Portal';

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-gray-50 text-gray-900 font-sans selection:bg-brand-500/30">
      {/* Desktop/Tablet sidebar — hidden on mobile */}
      {!isMobileNav && <Sidebar />}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative bg-gray-50/50">
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
