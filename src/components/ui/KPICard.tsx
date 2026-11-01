import React from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  label?: string;
  title?: string;
  value: string | number;
  trend?: string;
  change?: string;
  trendUp?: boolean;
  changeType?: string;
  subValue?: string | number;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  className?: string;
  onClick?: () => void;
}

export function KPICard({
  label,
  title,
  value,
  trend,
  change,
  trendUp,
  changeType,
  subValue,
  icon,
  iconBg,
  iconColor,
  className,
  onClick,
}: KPICardProps) {
  const displayLabel = label || title || '';
  const displayTrend = trend || change;
  const isTrendUp = trendUp !== undefined
    ? trendUp
    : (changeType === 'positive' || changeType === 'increase' || (displayTrend ? !displayTrend.startsWith('-') : true));

  return (
    <div
      className={cn(
        'neu-card p-4 sm:p-5 relative overflow-hidden group transition-all duration-200 flex flex-col justify-between',
        onClick && 'neu-card-hover cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Soft Icon container */}
        {icon && (
          <div
            className={cn(
              'neu-inset-sm p-3 rounded-2xl flex items-center justify-center text-blue-500 shrink-0 transition-transform duration-200 group-hover:scale-105',
              iconBg,
            )}
          >
            <span className={cn('w-5 h-5 flex items-center justify-center', iconColor || 'text-blue-500')}>
              {icon}
            </span>
          </div>
        )}

        {/* Right inset pill (trend or sub-value like in reference image [ 330 ]) */}
        {(displayTrend || subValue !== undefined) && (
          <div className="neu-pill-inset px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 text-[var(--neu-text-secondary)] shrink-0">
            {displayTrend && (
              <span className={cn('flex items-center gap-1', isTrendUp ? 'text-emerald-500' : 'text-rose-500')}>
                {isTrendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {displayTrend}
              </span>
            )}
            {subValue !== undefined && !displayTrend && (
              <span className="font-mono text-[11px] font-bold text-[var(--neu-text-secondary)]">
                {subValue}
              </span>
            )}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs sm:text-sm font-medium text-[var(--neu-text-secondary)] tracking-wide">{displayLabel}</p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--neu-text-primary)] mt-1 tracking-tight font-display">
          {value}
        </p>
      </div>
    </div>
  );
}

interface MiniStatProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MiniStat({ label, value, color, icon, className }: MiniStatProps) {
  return (
    <div
      className={cn(
        'neu-raised-sm p-3 sm:p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] flex items-center justify-between gap-3',
        className,
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <div className="neu-inset-sm p-2 rounded-xl text-blue-500 shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[var(--neu-text-secondary)] tracking-wide truncate">
            {label}
          </p>
          <p className="text-lg sm:text-xl font-bold text-[var(--neu-text-primary)] font-display tracking-tight mt-0.5">
            {value}
          </p>
        </div>
      </div>
      {color && <span className={cn('w-2.5 h-2.5 rounded-full shrink-0 shadow-xs', color)} />}
    </div>
  );
}
