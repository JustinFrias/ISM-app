import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils';
import { SkeuoButton } from './SkeuoButton';

interface SkeuoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'vault' | 'paper' | 'metal';
  footer?: React.ReactNode;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl',
};

export const SkeuoModal: React.FC<SkeuoModalProps> = ({
  isOpen, onClose, title, subtitle, children, size = 'md', variant = 'vault', footer,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.92, rotateY: -12, translateZ: -80 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0, translateZ: 0 }}
              exit={{ opacity: 0, scale: 0.92, rotateY: 12, translateZ: -80 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
              style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
              className={cn(
                'relative w-full flex flex-col max-h-[90vh] rounded-2xl overflow-hidden',
                sizeStyles[size],
                variant === 'vault' && 'skeuo-panel border border-white/08',
                variant === 'paper' && 'skeuo-paper rounded-xl',
                variant === 'metal' && 'bg-brushed-metal border border-white/08 shadow-skeuo-vault',
              )}
              onClick={e => e.stopPropagation()}
            >
              {/* Top specular edge */}
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Header */}
              <div className={cn(
                'flex items-start justify-between px-6 py-4 border-b flex-shrink-0',
                variant === 'paper' ? 'border-gray-300/50' : 'border-white/08'
              )}>
                <div>
                  <h2 className={cn(
                    'font-display font-bold text-lg',
                    variant === 'paper' ? 'text-gray-800' : 'text-skeuo-chrome'
                  )}>{title}</h2>
                  {subtitle && <p className={cn('text-sm mt-0.5', variant === 'paper' ? 'text-gray-500' : 'text-gray-500')}>{subtitle}</p>}
                </div>
                <button onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/08 transition-colors ml-4 flex-shrink-0">
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

              {/* Footer */}
              {footer && (
                <div className={cn(
                  'flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0',
                  variant === 'paper' ? 'border-gray-300/50 bg-gray-50' : 'border-white/08 bg-black/20'
                )}>
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Confirmation modal
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDanger?: boolean;
}
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', isDanger,
}) => (
  <SkeuoModal isOpen={isOpen} onClose={onClose} title={title} size="sm"
    footer={
      <>
        <SkeuoButton variant="ghost" size="sm" onClick={onClose}>Cancel</SkeuoButton>
        <SkeuoButton variant={isDanger ? 'danger' : 'gold'} size="sm" onClick={() => { onConfirm(); onClose(); }}>
          {confirmLabel}
        </SkeuoButton>
      </>
    }>
    <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
  </SkeuoModal>
);
