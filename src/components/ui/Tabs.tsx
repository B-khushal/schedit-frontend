import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'underline' | 'pills' | 'enclosed';
}

export function Tabs({ tabs, activeTab, onChange, className, variant = 'pills' }: TabsProps) {
  if (variant === 'pills' || variant === 'enclosed') {
    return (
      <div className={cn('neu-well p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-hide', className)}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer select-none',
                isActive
                  ? 'neu-button-primary text-white shadow-md'
                  : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] hover:bg-black/5 dark:hover:bg-white/5',
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                    isActive ? 'bg-white/20 text-white' : 'neu-inset-sm text-[var(--neu-text-secondary)]',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default: Underline / Subtle tab strip
  return (
    <div className={cn('flex items-center gap-2 border-b border-[var(--neu-border-inset)] overflow-x-auto scrollbar-hide pb-1', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative pb-3 px-4 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer',
              isActive ? 'text-blue-500' : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)]',
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                  isActive ? 'bg-blue-500 text-white' : 'neu-inset-sm text-[var(--neu-text-secondary)]',
                )}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
