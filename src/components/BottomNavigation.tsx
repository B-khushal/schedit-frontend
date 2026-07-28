import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, PenSquare, CalendarDays, Image, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface BottomNavigationProps {
  onMoreClick: () => void;
}

const bottomTabs = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app', end: true },
  { icon: PenSquare, label: 'Studio', path: '/app/studio', end: false },
  { icon: CalendarDays, label: 'Calendar', path: '/app/calendar', end: false },
  { icon: Image, label: 'Assets', path: '/app/assets', end: false },
];

export function BottomNavigation({ onMoreClick }: BottomNavigationProps) {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200 safe-bottom lg:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {bottomTabs.map((tab) => {
          const isActive = tab.end
            ? location.pathname === tab.path
            : location.pathname.startsWith(tab.path);

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.end}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative touch-target"
              aria-label={tab.label}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomnav-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-600 rounded-full"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
              )}
              <tab.icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-brand-600' : 'text-gray-400'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-semibold transition-colors',
                  isActive ? 'text-brand-700' : 'text-gray-500'
                )}
              >
                {tab.label}
              </span>
            </NavLink>
          );
        })}

        {/* More tab */}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 touch-target"
          aria-label="More navigation options"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
          <span className="text-[10px] font-semibold text-gray-500">More</span>
        </button>
      </div>
    </nav>
  );
}
