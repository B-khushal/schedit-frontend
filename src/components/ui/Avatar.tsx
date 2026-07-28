import React from 'react';
import { cn, getInitials } from '../../lib/utils';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  className?: string;
}

export function Avatar({ src, name, size = 'md', online, className }: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  const sizes = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const dotSizes = {
    xs: 'w-1.5 h-1.5 -bottom-0 -right-0',
    sm: 'w-2 h-2 -bottom-0 -right-0',
    md: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
    lg: 'w-3 h-3 -bottom-0.5 -right-0.5',
    xl: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
  };

  const initials = getInitials(name || '');

  const validSrc = src && typeof src === 'string' && src.length > 5 && !src.includes('pravatar.cc') && !src.includes('unsplash.com') ? src : null;

  return (
    <div className={cn('relative shrink-0', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-2xs border border-white/20 select-none',
          sizes[size],
        )}
      >
        {validSrc && !hasError ? (
          <img 
            src={validSrc} 
            alt={name || 'Avatar'} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
          />
        ) : (
          <span className="uppercase tracking-wider drop-shadow-xs">{initials}</span>
        )}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            'absolute rounded-full border-2 border-white',
            dotSizes[size],
            online ? 'bg-emerald-500' : 'bg-gray-300',
          )}
        />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  avatars: { src?: string; name: string }[];
  max?: number;
  size?: 'sm' | 'md';
}

export function AvatarGroup({ avatars, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((a, i) => (
        <Avatar key={i} src={a.src} name={a.name} size={size} className="ring-2 ring-white" />
      ))}
      {remaining > 0 && (
        <div className={cn(
          'rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-600 font-semibold',
          size === 'sm' ? 'w-8 h-8 text-[10px]' : 'w-10 h-10 text-xs',
        )}>
          +{remaining}
        </div>
      )}
    </div>
  );
}
