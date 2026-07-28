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
    <div className={cn('relative pl-6 border-l border-gray-200 ml-4 space-y-6', className)}>
      {events.map((event) => (
        <div key={event.id} className="relative">
          {/* Timeline Dot/Icon */}
          <div className="absolute -left-[35px] top-1 flex items-center justify-center">
            {event.icon ? (
              <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-white', event.iconBg || 'bg-brand-500')}>
                {event.icon}
              </div>
            ) : event.user ? (
              <Avatar
                src={event.user.avatarUrl}
                name={event.user.name}
                size="sm"
                className="ring-4 ring-white"
              />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full bg-brand-500 ring-4 ring-white shadow-sm" />
            )}
          </div>

          {/* Event Content */}
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs max-w-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-sm font-semibold text-gray-900">{event.title}</span>
              <span className="text-xs text-gray-400 font-medium">{event.timestamp}</span>
            </div>
            {event.description && (
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed font-medium">
                {event.description}
              </p>
            )}
            {event.user && !event.icon && (
              <div className="mt-2 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                By: {event.user.name}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
