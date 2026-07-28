import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'outlined' | 'elevated';
}

export function Card({ className, hover, padding = 'md', variant = 'default', children, ...props }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-3 sm:p-4 md:p-5',
    lg: 'p-4 sm:p-5 md:p-6',
  };

  const variants = {
    default: 'bg-white border border-gray-200 shadow-card',
    glass: 'glass',
    outlined: 'bg-white border border-gray-200',
    elevated: 'bg-white border border-gray-100 shadow-elevated',
  };

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-200',
        variants[variant],
        paddings[padding],
        hover && 'hover:shadow-elevated hover:border-gray-300 cursor-pointer',
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
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base font-semibold text-gray-900 font-display', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-gray-500 mt-1', className)} {...props}>
      {children}
    </p>
  );
}
