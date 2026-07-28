import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  side?: 'right' | 'left' | 'bottom';
  title?: string;
  description?: string;
  width?: string;
}

export function Drawer({ open, onClose, children, className, side = 'right', title, description, width = 'w-full sm:w-[500px] md:w-[600px]' }: DrawerProps) {
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

  const slideVariants = {
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
      className: cn('fixed right-0 top-0 h-full max-w-full', width),
    },
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
      className: cn('fixed left-0 top-0 h-full max-w-full', width),
    },
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
      className: 'fixed bottom-0 left-0 w-full max-h-[90vh] rounded-t-2xl',
    },
  };

  const variant = slideVariants[side];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={variant.initial}
            animate={variant.animate}
            exit={variant.exit}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              variant.className,
              'bg-white shadow-modal flex flex-col z-50',
              side !== 'bottom' && 'border-l border-gray-200',
              className,
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {/* Drag handle for bottom sheet */}
            {side === 'bottom' && (
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
            )}

            {/* Header */}
            {(title || true) && (
              <div className="flex items-start justify-between p-4 sm:p-5 border-b border-gray-100 shrink-0">
                <div className="min-w-0">
                  {title && <h2 className="text-lg font-bold text-gray-900 font-display truncate">{title}</h2>}
                  {description && <p className="text-sm text-gray-500 mt-0.5 truncate">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors -mt-0.5 ml-4 shrink-0 touch-target"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
