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

  // Mobile: full-screen drawer from bottom
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
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={onClose}
            />
            
            {/* Modal Content — slides up from bottom */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                'relative bg-white rounded-t-2xl shadow-modal w-full max-h-[90vh] flex flex-col overflow-hidden',
                className,
              )}
              role="dialog"
              aria-modal="true"
              aria-label={title}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {(title || showClose) && (
                <div className="flex items-start justify-between px-4 pb-2 shrink-0">
                  <div className="min-w-0">
                    {title && <h2 className="text-lg font-bold text-gray-900 font-display">{title}</h2>}
                    {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                  </div>
                  {showClose && (
                    <button
                      onClick={onClose}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors -mt-1 touch-target"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
              <div className="px-4 pb-4 flex-1 overflow-y-auto">{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  // Desktop/Tablet: centered modal
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
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'relative bg-white rounded-2xl shadow-modal border border-gray-200 w-full overflow-hidden max-h-[90vh] flex flex-col',
              sizes[size],
              className,
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {(title || showClose) && (
              <div className="flex items-start justify-between p-6 pb-0 shrink-0">
                <div>
                  {title && <h2 className="text-lg font-bold text-gray-900 font-display">{title}</h2>}
                  {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                </div>
                {showClose && (
                  <button
                    onClick={onClose}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors -mt-1 -mr-1"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
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
