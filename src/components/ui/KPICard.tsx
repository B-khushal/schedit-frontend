import React from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  className?: string;
  onClick?: () => void;
}

export function KPICard({ label, value, trend, trendUp, icon, iconBg, iconColor, className, onClick }: KPICardProps) {
  return (
    <div
      className={cn(
        'bg-white p-3 sm:p-5 rounded-2xl border border-gray-200 shadow-card relative overflow-hidden group transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-elevated hover:border-gray-300',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4 relative z-10 gap-2 flex-wrap">
        {icon && (
          <div className={cn('p-2.5 rounded-xl border', iconBg || 'bg-brand-50 border-brand-100')}>
            <span className={cn(iconColor || 'text-brand-600')}>{icon}</span>
          </div>
        )}
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border',
              trendUp
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-red-700 bg-red-50 border-red-200',
            )}
          >
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 tracking-tight font-display">{value}</p>
      </div>

      {/* Decorative gradient on hover */}
      <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-gradient-to-br from-gray-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}

interface MiniStatProps {
  label: string;
  value: string | number;
  color?: string;
  className?: string;
}

export function MiniStat({ label, value, color, className }: MiniStatProps) {
  return (
    <div className={cn('bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-xs', className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold text-gray-900 font-display">{value}</span>
        {color && <span className={cn('w-2.5 h-2.5 rounded-full', color)} />}
      </div>
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}
