import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, PenSquare, CalendarDays, Bot, MoreHorizontal, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface BottomNavigationProps {
  onMoreClick: () => void;
}

const bottomTabs = [
  { icon: LayoutDashboard, label: 'Overview', path: '/app', end: true },
  { icon: CalendarDays, label: 'Calendar', path: '/app/calendar', end: false },
  { icon: Plus, label: 'Create', path: '/app/studio', isPrimary: true },
  { icon: Bot, label: 'AI', path: '/app/ai', end: false },
];

export function BottomNavigation({ onMoreClick }: BottomNavigationProps) {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-3 left-3 right-3 z-40 neu-card rounded-3xl p-1.5 safe-bottom lg:hidden bg-[var(--neu-surface)]"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-1">
        {bottomTabs.map((tab) => {
          if (tab.isPrimary) {
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="flex items-center justify-center -mt-5 neu-button-primary w-12 h-12 rounded-full text-white shadow-lg active:scale-95 transition-transform"
                aria-label="Create Post"
              >
                <Plus className="w-6 h-6" />
              </NavLink>
            );
          }

          const isActive = tab.end
            ? location.pathname === tab.path
            : location.pathname.startsWith(tab.path);

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.end}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-1.5 rounded-2xl transition-all touch-target',
                isActive ? 'neu-button-inset text-blue-500' : 'text-[var(--neu-text-muted)] hover:text-[var(--neu-text-primary)]',
              )}
              aria-label={tab.label}
            >
              <tab.icon className="w-4.5 h-4.5" />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </NavLink>
          );
        })}

        {/* More tab */}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center gap-1 flex-1 py-1.5 rounded-2xl text-[var(--neu-text-muted)] hover:text-[var(--neu-text-primary)] transition-all touch-target cursor-pointer"
          aria-label="More navigation options"
        >
          <MoreHorizontal className="w-4.5 h-4.5" />
          <span className="text-[10px] font-bold">More</span>
        </button>
      </div>
    </nav>
  );
}
