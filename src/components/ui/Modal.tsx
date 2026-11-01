import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useResponsive } from '../../hooks/useMediaQuery';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  title?: string;
  description?: string;
  showClose?: boolean;
}

export function Modal({ open, onClose, children, className, size = 'md', title, description, showClose = true }: ModalProps) {
  const { isMobile } = useResponsive();

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)]',
  };

  // Mobile: bottom sheet
  if (isMobile) {
    return (
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Modal Content — slides up from bottom */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                'relative neu-card rounded-t-3xl rounded-b-none w-full max-h-[90vh] flex flex-col overflow-hidden text-[var(--neu-text-primary)]',
                className,
              )}
              role="dialog"
              aria-modal="true"
              aria-label={title}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-12 h-1.5 neu-inset-sm rounded-full" />
              </div>

              {(title || showClose) && (
                <div className="flex items-start justify-between px-5 py-3 shrink-0">
                  <div className="min-w-0">
                    {title && <h2 className="text-base sm:text-lg font-bold text-[var(--neu-text-primary)] font-display">{title}</h2>}
                    {description && <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">{description}</p>}
                  </div>
                  {showClose && (
                    <button
                      onClick={onClose}
                      className="p-2 neu-button rounded-xl text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] transition-all -mt-1 touch-target"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <div className="px-5 pb-5 flex-1 overflow-y-auto">{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  // Desktop/Tablet: centered soft elevated modal
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'relative neu-card rounded-3xl w-full overflow-hidden max-h-[90vh] flex flex-col text-[var(--neu-text-primary)]',
              sizes[size],
              className,
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {(title || showClose) && (
              <div className="flex items-start justify-between p-6 pb-2 shrink-0">
                <div>
                  {title && <h2 className="text-lg font-bold text-[var(--neu-text-primary)] font-display">{title}</h2>}
                  {description && <p className="text-xs sm:text-sm text-[var(--neu-text-secondary)] mt-1">{description}</p>}
                </div>
                {showClose && (
                  <button
                    onClick={onClose}
                    className="p-2 neu-button rounded-xl text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] transition-all -mt-1 -mr-1"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            <div className="p-6 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
