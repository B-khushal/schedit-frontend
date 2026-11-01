import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success' | 'inset' | 'brand';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, isLoading, icon, iconRight, children, disabled, ...props }, ref) => {
    const isSpinning = loading || isLoading;

    const variants = {
      primary: 'neu-button-primary',
      brand: 'neu-button-primary',
      secondary: 'neu-button text-[var(--neu-text-primary)] hover:text-blue-500',
      inset: 'neu-button-inset text-blue-500 font-semibold',
      ghost: 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all',
      danger: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[4px_4px_12px_rgba(239,68,68,0.35),-4px_-4px_12px_var(--neu-highlight)] border border-rose-400/30 hover:brightness-105 active:scale-95',
      outline: 'neu-inset-sm text-blue-500 hover:text-blue-600',
      success: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[4px_4px_12px_rgba(16,185,129,0.35),-4px_-4px_12px_var(--neu-highlight)] border border-emerald-400/30 hover:brightness-105 active:scale-95',
    };

    const sizes = {
      xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-xl min-h-[32px]',
      sm: 'px-3.5 py-1.5 text-xs gap-2 rounded-xl min-h-[36px]',
      md: 'px-4 py-2.5 text-sm gap-2 rounded-2xl min-h-[44px]',
      lg: 'px-6 py-3 text-sm sm:text-base gap-2.5 rounded-2xl min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isSpinning}
        className={cn(
          'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 cursor-pointer select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variants[variant] || variants.primary,
          sizes[size],
          className,
        )}
        {...props}
      >
        {isSpinning ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : icon ? (
          <span className="shrink-0 flex items-center justify-center">{icon}</span>
        ) : null}
        {children}
        {iconRight && <span className="shrink-0 flex items-center justify-center">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
