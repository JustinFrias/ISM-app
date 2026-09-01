import React from 'react';
import { cn } from '../../utils';

interface SkeuoGaugeProps {
  value: number;       // 0–100
  maxValue?: number;
  label: string;
  unit?: string;
  criticalThreshold?: number;
  warningThreshold?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SkeuoGauge: React.FC<SkeuoGaugeProps> = ({
  value, maxValue = 100, label, unit = '%', criticalThreshold = 20, warningThreshold = 40,
  size = 'md', className,
}) => {
  const pct = Math.min(100, Math.max(0, (value / maxValue) * 100));
  // Needle angle: from -135deg (0%) to +135deg (100%)
  const angle = -135 + (pct / 100) * 270;

  const color = pct <= criticalThreshold
    ? { arc: '#ef4444', needle: '#ef4444', glow: 'rgba(239,68,68,0.4)' }
    : pct <= warningThreshold
    ? { arc: '#f59e0b', needle: '#f59e0b', glow: 'rgba(245,158,11,0.4)' }
    : { arc: '#10b981', needle: '#10b981', glow: 'rgba(16,185,129,0.4)' };

  const sizePx = { sm: 100, md: 140, lg: 180 }[size];
  const r = sizePx / 2;
  const cx = r;
  const cy = r;
  const radius = r - 14;
  // Arc from -135° to angle (value)
  const toRad = (d: number) => (d * Math.PI) / 180;
  const arcStart = { x: cx + radius * Math.cos(toRad(-135)), y: cy + radius * Math.sin(toRad(-135)) };
  const arcEnd = { x: cx + radius * Math.cos(toRad(angle)), y: cy + radius * Math.sin(toRad(angle)) };
  const largeArc = angle - (-135) > 180 ? 1 : 0;
  const arcPath = `M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`;

  const needleLen = radius - 4;
  const needleTip = {
    x: cx + needleLen * Math.cos(toRad(angle)),
    y: cy + needleLen * Math.sin(toRad(angle)),
  };

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <svg width={sizePx} height={sizePx * 0.6} viewBox={`0 0 ${sizePx} ${sizePx * 0.75}`} className="overflow-visible">
        <defs>
          <radialGradient id={`gauge-bg-${label}`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="#2a2e39" />
            <stop offset="100%" stopColor="#1c1f26" />
          </radialGradient>
          <filter id={`glow-${label}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Background dial */}
        <circle cx={cx} cy={cy} r={radius + 10} fill={`url(#gauge-bg-${label})`}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        {/* Track arc (full 270°) */}
        <path d={`M ${cx + radius * Math.cos(toRad(-135))} ${cy + radius * Math.sin(toRad(-135))} A ${radius} ${radius} 0 1 1 ${cx + radius * Math.cos(toRad(135))} ${cy + radius * Math.sin(toRad(135))}`}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" strokeLinecap="round" />
        {/* Value arc */}
        {pct > 0 && (
          <path d={arcPath} fill="none" stroke={color.arc} strokeWidth="5" strokeLinecap="round"
            filter={`url(#glow-${label})`} style={{ transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)' }} />
        )}
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map(t => {
          const a = -135 + (t / 100) * 270;
          const inner = radius - 8;
          const outer = radius + 2;
          return (
            <line key={t}
              x1={cx + inner * Math.cos(toRad(a))} y1={cy + inner * Math.sin(toRad(a))}
              x2={cx + outer * Math.cos(toRad(a))} y2={cy + outer * Math.sin(toRad(a))}
              stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          );
        })}
        {/* Needle */}
        <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y}
          stroke={color.needle} strokeWidth="2.5" strokeLinecap="round"
          filter={`url(#glow-${label})`}
          style={{ transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)', transformOrigin: `${cx}px ${cy}px` }} />
        {/* Center pivot */}
        <circle cx={cx} cy={cy} r={5} fill="#1c1f26" stroke={color.needle} strokeWidth="2" />
        {/* Value text */}
        <text x={cx} y={cy + 28} textAnchor="middle" fontSize={size === 'sm' ? 13 : 16}
          fontFamily="JetBrains Mono, monospace" fontWeight="600" fill={color.arc}>
          {value}{unit}
        </text>
      </svg>
      <p className="skeuo-label text-center">{label}</p>
    </div>
  );
};
