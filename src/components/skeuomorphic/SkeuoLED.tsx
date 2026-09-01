import React from 'react';
import { cn } from '../../utils';

interface SkeuoLEDProps {
  status: 'green' | 'red' | 'amber' | 'off' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  pulse?: boolean;
  className?: string;
}

const colors = {
  green: { led: 'bg-emerald-400', glow: 'shadow-skeuo-led-green', pulse: 'animate-led-pulse-green' },
  red: { led: 'bg-red-500', glow: 'shadow-skeuo-led-red', pulse: 'animate-led-pulse-red' },
  amber: { led: 'bg-amber-400', glow: 'shadow-skeuo-led-amber', pulse: 'animate-led-pulse-amber' },
  blue: { led: 'bg-blue-400', glow: 'shadow-[0_0_10px_#3b82f6,0_0_20px_rgba(59,130,246,0.5)]', pulse: '' },
  off: { led: 'bg-gray-800', glow: '', pulse: '' },
};
const sizes = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export const SkeuoLED: React.FC<SkeuoLEDProps> = ({ status, size = 'md', label, pulse = true, className }) => {
  const c = colors[status];
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* LED housing */}
      <div className={cn(
        'relative rounded-full ring-1 ring-black/60 flex items-center justify-center',
        // Outer casing
        'before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/20 before:to-transparent',
        sizes[size]
      )}>
        <div className={cn(
          'w-full h-full rounded-full',
          c.led,
          c.glow,
          pulse && status !== 'off' && c.pulse,
        )} />
      </div>
      {label && <span className="text-xs font-mono text-gray-400">{label}</span>}
    </div>
  );
};

// Alert LED panel (row of LEDs for dashboard)
interface LEDPanelProps {
  outOfStock: number;
  critical: number;
  expired: number;
}
export const LEDAlertPanel: React.FC<LEDPanelProps> = ({ outOfStock, critical, expired }) => (
  <div className="flex items-center gap-4 bg-gradient-to-r from-[#1a1c24] to-[#22262f] border border-white/08 rounded-xl px-5 py-3 shadow-skeuo-panel">
    <span className="skeuo-label mr-2">System Status</span>
    <SkeuoLED status={outOfStock > 0 ? 'red' : 'green'} size="lg" label={`OOS: ${outOfStock}`} />
    <SkeuoLED status={critical > 0 ? 'amber' : 'green'} size="lg" label={`Critical: ${critical}`} />
    <SkeuoLED status={expired > 0 ? 'red' : 'green'} size="lg" label={`Expired: ${expired}`} />
    <SkeuoLED status="green" size="lg" label="System OK" />
  </div>
);
