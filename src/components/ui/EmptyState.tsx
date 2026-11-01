import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('neu-card flex flex-col items-center justify-center text-center py-16 px-6 max-w-lg mx-auto my-8', className)}>
      {icon && (
        <div className="w-16 h-16 neu-inset rounded-3xl flex items-center justify-center mb-5 text-blue-500 shadow-inner">
          <span className="w-7 h-7 flex items-center justify-center">{icon}</span>
        </div>
      )}
      <h3 className="text-base sm:text-lg font-bold text-[var(--neu-text-primary)] font-display tracking-tight mb-1.5">{title}</h3>
      {description && <p className="text-xs sm:text-sm text-[var(--neu-text-secondary)] max-w-sm leading-relaxed">{description}</p>}
      {action && (
        <Button
          variant="primary"
          size="md"
          icon={action.icon}
          onClick={action.onClick}
          className="mt-6"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
