import React from 'react';
import { cn, getPlatformGradient, getPlatformLabel } from '../../lib/utils';

interface PlatformIconProps {
  platform: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function PlatformIcon({ platform, size = 'sm', className }: PlatformIconProps) {
  const sizes = {
    xs: 'w-4 h-4 text-[7px]',
    sm: 'w-6 h-6 text-[9px]',
    md: 'w-8 h-8 text-[11px]',
    lg: 'w-10 h-10 text-sm',
  };

  return (
    <span
      className={cn(
        'rounded-md flex items-center justify-center font-bold shrink-0',
        sizes[size],
        getPlatformGradient(platform),
        className,
      )}
      title={platform}
    >
      {getPlatformLabel(platform)}
    </span>
  );
}
