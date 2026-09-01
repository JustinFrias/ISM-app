import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils';

interface SkeuoButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'metal' | 'gold' | 'danger' | 'success' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  ledStatus?: 'green' | 'red' | 'amber' | 'off';
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantStyles = {
  metal: 'bg-gradient-to-b from-[#3a4150] via-[#2a2f3b] to-[#1f232c] text-gray-200 border-t border-gray-500/30 border-b border-black/80',
  gold: 'bg-metallic-gold text-black font-semibold border-t border-yellow-200/70 border-b border-yellow-900',
  danger: 'bg-gradient-to-b from-[#c0392b] via-[#922b21] to-[#641e16] text-white border-t border-red-300/30 border-b border-red-950',
  success: 'bg-gradient-to-b from-[#27ae60] via-[#1e8449] to-[#145a32] text-white border-t border-green-300/30 border-b border-green-950',
  ghost: 'bg-transparent text-gray-400 border border-white/10 hover:border-white/20 hover:text-gray-200',
};
const sizeStyles = {
  xs: 'px-2.5 py-1 text-xs rounded-md gap-1.5',
  sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-2',
  md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
};
const ledColors = {
  green: 'bg-emerald-400 shadow-skeuo-led-green animate-led-pulse-green',
  red: 'bg-rose-500 shadow-skeuo-led-red animate-led-pulse-red',
  amber: 'bg-amber-400 shadow-skeuo-led-amber animate-led-pulse-amber',
  off: 'bg-gray-700/60',
};

export const SkeuoButton: React.FC<SkeuoButtonProps> = ({
  variant = 'metal', size = 'md', ledStatus = 'off', isLoading, children, className, disabled, ...props
}) => (
  <motion.button
    whileHover={!disabled ? { translateY: -1.5, filter: 'brightness(1.10)' } : {}}
    whileTap={!disabled ? { translateY: 2, scale: 0.98, filter: 'brightness(0.90)' } : {}}
    transition={{ type: 'spring', stiffness: 600, damping: 28 }}
    disabled={disabled || isLoading}
    className={cn(
      'relative inline-flex items-center justify-center select-none font-medium tracking-wide transition-all shadow-skeuo-button active:shadow-skeuo-button-pressed focus-visible:ring-2 focus-visible:ring-skeuo-gold/60',
      variantStyles[variant],
      sizeStyles[size],
      (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
      className
    )}
    {...props}
  >
    {ledStatus !== 'off' && (
      <span className={cn('flex-shrink-0 w-2 h-2 rounded-full ring-1 ring-black/40', ledColors[ledStatus])} />
    )}
    {isLoading ? (
      <span className="flex items-center gap-2">
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Processing...
      </span>
    ) : children}
    {/* Specular glint */}
    {variant !== 'ghost' && (
      <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    )}
  </motion.button>
);
