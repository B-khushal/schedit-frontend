import React, { useState } from 'react';
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

export function Tabs({ tabs, activeTab, onChange, className, variant = 'underline' }: TabsProps) {
  if (variant === 'pills') {
    return (
      <div className={cn('flex items-center bg-gray-100 p-1 rounded-xl gap-1 overflow-x-auto scrollbar-hide', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap shrink-0',
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-card'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                activeTab === tab.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-600',
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'enclosed') {
    return (
      <div className={cn('flex items-center border border-gray-200 rounded-xl bg-white p-1 gap-1 overflow-x-auto scrollbar-hide', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap shrink-0',
              activeTab === tab.id
                ? 'bg-brand-50 text-brand-700 border border-brand-200'
                : 'text-gray-500 hover:text-gray-700 border border-transparent',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  // Default: underline
  return (
    <div className={cn('flex items-center gap-1 border-b border-gray-200 overflow-x-auto scrollbar-hide', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative pb-3 px-3 sm:px-4 text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap shrink-0',
            activeTab === tab.id ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
              activeTab === tab.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500',
            )}>
              {tab.count}
            </span>
          )}
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-t-full"
              transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
