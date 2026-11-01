import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  pill?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, iconRight, pill, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs sm:text-sm font-semibold text-[var(--neu-text-secondary)] tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3.5 text-[var(--neu-text-muted)] pointer-events-none flex items-center justify-center">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full neu-input px-4 py-2.5 text-sm text-[var(--neu-text-primary)] placeholder:text-[var(--neu-text-muted)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              pill ? 'rounded-full px-5' : 'rounded-2xl',
              icon && 'pl-10',
              iconRight && 'pr-10',
              error && 'border-rose-400 focus:ring-rose-500/20',
              className,
            )}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3.5 text-[var(--neu-text-muted)] flex items-center justify-center">
              {iconRight}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--neu-text-muted)]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs sm:text-sm font-semibold text-[var(--neu-text-secondary)] tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full neu-input px-4 py-3 text-sm text-[var(--neu-text-primary)] placeholder:text-[var(--neu-text-muted)] resize-none rounded-2xl',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-rose-400 focus:ring-rose-500/20',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--neu-text-muted)]">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs sm:text-sm font-semibold text-[var(--neu-text-secondary)] tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full neu-input px-4 py-2.5 text-sm text-[var(--neu-text-primary)] rounded-2xl cursor-pointer',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-rose-400 focus:ring-rose-500/20',
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[var(--neu-surface)] text-[var(--neu-text-primary)]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
