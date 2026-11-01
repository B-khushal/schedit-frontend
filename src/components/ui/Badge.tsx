import React from 'react';
import { cn, statusColor, statusLabel } from '../../lib/utils';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand' | 'neutral' | 'amber';
  size?: 'sm' | 'md';
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', size = 'sm', dot, children, className }: BadgeProps) {
  const variants = {
    default: 'neu-pill-inset text-[var(--neu-text-secondary)]',
    success: 'neu-pill-inset text-emerald-600 dark:text-emerald-400',
    warning: 'neu-pill-inset text-amber-600 dark:text-amber-400',
    amber: 'neu-pill-inset text-amber-600 dark:text-amber-400',
    error: 'neu-pill-inset text-rose-600 dark:text-rose-400',
    info: 'neu-pill-inset text-blue-600 dark:text-blue-400',
    brand: 'neu-pill-inset text-blue-600 dark:text-blue-400',
    neutral: 'neu-pill-inset text-[var(--neu-text-muted)]',
  };

  const dotColors = {
    default: 'bg-[var(--neu-text-muted)]',
    success: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    warning: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    amber: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    error: 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    info: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    brand: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    neutral: 'bg-slate-400',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-bold tracking-tight rounded-full whitespace-nowrap select-none',
        variants[variant] || variants.default,
        sizes[size],
        className,
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant] || dotColors.default)} />}
      {children}
    </span>
  );
}

interface StatusPillProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusPill({ status, size = 'sm', className }: StatusPillProps) {
  const colors = statusColor(status);
  const label = statusLabel(status);

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'neu-pill-inset inline-flex items-center gap-1.5 font-bold tracking-tight rounded-full whitespace-nowrap',
        colors.text,
        sizes[size],
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 shadow-xs', colors.dot)} />
      {label}
    </span>
  );
}
