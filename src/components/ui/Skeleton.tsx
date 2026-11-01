import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('neu-skeleton rounded-xl', className)} />;
}

export function SkeletonLine({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} />;
}

export function SkeletonCircle({ className }: SkeletonProps) {
  return <Skeleton className={cn('w-10 h-10 rounded-full', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="neu-card p-5 rounded-2xl space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="animate-fade-in">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className={cn('h-4', i === 0 ? 'w-48' : 'w-20')} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 animate-fade-in max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="neu-raised-sm p-4 rounded-2xl space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Chart area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 neu-card p-6 rounded-2xl">
          <Skeleton className="h-5 w-40 mb-8" />
          <div className="neu-well p-4 rounded-2xl">
            <Skeleton className="h-[260px] w-full rounded-xl" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="neu-card p-6 rounded-2xl space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
          <div className="neu-card p-6 rounded-2xl space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
