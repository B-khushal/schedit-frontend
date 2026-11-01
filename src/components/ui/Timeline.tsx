import React from 'react';
import { cn } from '../../lib/utils';
import { Avatar } from './Avatar';

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  user?: {
    name: string;
    avatarUrl?: string;
  };
  icon?: React.ReactNode;
  iconBg?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn('relative pl-6 border-l border-[var(--neu-border-inset)] ml-4 space-y-6', className)}>
      {events.map((event) => (
        <div key={event.id} className="relative">
          {/* Timeline Dot/Icon */}
          <div className="absolute -left-[35px] top-1 flex items-center justify-center">
            {event.icon ? (
              <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-white neu-raised-sm', event.iconBg || 'bg-blue-500')}>
                {event.icon}
              </div>
            ) : event.user ? (
              <Avatar
                src={event.user.avatarUrl}
                name={event.user.name}
                size="sm"
                className="neu-avatar-frame"
              />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full bg-blue-500 neu-raised-sm" />
            )}
          </div>

          {/* Event Content */}
          <div className="neu-card p-4 rounded-2xl max-w-2xl text-[var(--neu-text-primary)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-sm font-bold text-[var(--neu-text-primary)]">{event.title}</span>
              <span className="text-xs text-[var(--neu-text-muted)] font-semibold">{event.timestamp}</span>
            </div>
            {event.description && (
              <p className="text-xs text-[var(--neu-text-secondary)] mt-1.5 leading-relaxed font-medium">
                {event.description}
              </p>
            )}
            {event.user && !event.icon && (
              <div className="mt-2 text-[10px] text-[var(--neu-text-muted)] font-bold uppercase tracking-wider">
                By: {event.user.name}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
