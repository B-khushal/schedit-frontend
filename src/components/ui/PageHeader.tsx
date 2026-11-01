import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronRight } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap', className)}>
      <div className="min-w-0 flex-1 w-full sm:w-auto">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-[var(--neu-text-muted)] mb-1.5 overflow-x-auto scrollbar-hide font-semibold">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-blue-500 transition-colors truncate whitespace-nowrap">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-[var(--neu-text-primary)] truncate">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--neu-text-primary)] font-display tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-[var(--neu-text-secondary)] mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0 flex-wrap w-full sm:w-auto">{actions}</div>}
    </div>
  );
}
