import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, iconRight, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-xs active:bg-brand-800 focus-visible:ring-brand-500',
      secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-xs active:bg-gray-100',
      ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200',
      danger: 'bg-error-600 text-white hover:bg-red-700 shadow-xs active:bg-red-800',
      outline: 'border border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100 active:bg-brand-200',
      success: 'bg-success-600 text-white hover:bg-green-700 shadow-xs active:bg-green-800',
    };

    const sizes = {
      xs: 'px-2.5 py-1.5 text-xs gap-1 rounded-md min-h-[36px] sm:min-h-[32px]',
      sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg min-h-[40px] sm:min-h-[36px]',
      md: 'px-4 py-2 text-sm gap-2 rounded-lg min-h-[44px]',
      lg: 'px-5 py-2.5 text-sm gap-2 rounded-xl min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-150 cursor-pointer select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
        {iconRight && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
