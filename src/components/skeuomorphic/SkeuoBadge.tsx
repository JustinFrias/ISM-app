import React from 'react';
import { cn, getStatusBg } from '../../utils';

interface SkeuoBadgeProps {
  label: string;
  variant?: 'status' | 'metal' | 'gold' | 'custom';
  status?: string;
  className?: string;
  dot?: boolean;
}

export const SkeuoBadge: React.FC<SkeuoBadgeProps> = ({
  label, variant = 'status', status, dot = true, className,
}) => {
  if (variant === 'metal') {
    return (
      <span className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-wider uppercase',
        'bg-gradient-to-b from-[#3a4150] to-[#22262f] text-gray-300 border border-white/10 shadow-skeuo-card',
        className
      )}>
        {label}
      </span>
    );
  }
  if (variant === 'gold') {
    return (
      <span className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wider uppercase',
        'bg-metallic-gold text-black border border-yellow-700 shadow-skeuo-button',
        className
      )}>
        {label}
      </span>
    );
  }
  // Status variant
  const colorClass = status ? getStatusBg(status) : 'bg-gray-500/15 border-gray-500/30 text-gray-400';
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      colorClass, className
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      {label.replace('_', ' ')}
    </span>
  );
};
