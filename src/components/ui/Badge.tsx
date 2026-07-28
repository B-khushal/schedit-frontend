import React from 'react';
import { cn, statusColor, statusLabel } from '../../lib/utils';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', size = 'sm', dot, children, className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    neutral: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const dotColors = {
    default: 'bg-gray-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    brand: 'bg-brand-500',
    neutral: 'bg-gray-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold border rounded-full whitespace-nowrap',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
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
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold border rounded-full whitespace-nowrap',
        colors.bg, colors.text, colors.border,
        sizes[size],
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', colors.dot)} />
      {label}
    </span>
  );
}
