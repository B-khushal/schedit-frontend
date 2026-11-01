import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'outlined' | 'elevated' | 'inset' | 'well';
}

export function Card({ className, hover, padding = 'md', variant = 'default', children, ...props }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5 md:p-6',
    lg: 'p-5 sm:p-6 md:p-8',
  };

  const variants = {
    default: 'neu-card',
    elevated: 'neu-raised-lg rounded-2xl',
    glass: 'neu-card backdrop-blur-md',
    outlined: 'neu-raised-sm rounded-2xl',
    inset: 'neu-inset rounded-2xl',
    well: 'neu-well p-4 sm:p-6',
  };

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-200 text-[var(--neu-text-primary)]',
        variants[variant] || variants.default,
        paddings[padding],
        hover && 'neu-card-hover cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between mb-4 gap-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base font-bold text-[var(--neu-text-primary)] font-display tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs sm:text-sm text-[var(--neu-text-secondary)] mt-1 leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
}
