import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'left', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-2 min-w-[200px] max-w-[calc(100vw-2rem)] neu-card rounded-2xl overflow-hidden max-h-[70vh] overflow-y-auto p-1.5 text-[var(--neu-text-primary)]',
              align === 'right' ? 'right-0' : 'left-0',
              className,
            )}
            onClick={() => setOpen(false)}
          >
            <div>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  destructive?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function DropdownItem({ className, icon, destructive, children, ...props }: DropdownItemProps) {
  return (
    <button
      className={cn(
        'w-full flex items-center gap-2.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all text-left cursor-pointer select-none',
        destructive
          ? 'text-rose-500 hover:bg-rose-500/10'
          : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] hover:bg-black/5 dark:hover:bg-white/5',
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0 w-4 h-4 flex items-center justify-center">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 border-t border-[var(--neu-border-inset)]" />;
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3.5 py-1 text-[11px] font-bold text-[var(--neu-text-muted)] uppercase tracking-wider">
      {children}
    </div>
  );
}
