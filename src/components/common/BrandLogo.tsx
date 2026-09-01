import React from 'react';
import { motion } from 'framer-motion';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { box: 'w-8 h-8', svg: 24, text: 'text-sm' },
  md: { box: 'w-10 h-10', svg: 32, text: 'text-base' },
  lg: { box: 'w-16 h-16', svg: 48, text: 'text-2xl' },
  xl: { box: 'w-20 h-20', svg: 64, text: 'text-3xl' },
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', animated = true, className = '' }) => {
  const s = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center ${s.box} ${className}`}>
      {/* Outer ambient glow */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-skeuo-goldDark via-skeuo-gold to-amber-200 opacity-30 blur-sm pointer-events-none" />

      {/* 3D Skeuomorphic Box Container */}
      <motion.div
        animate={animated ? { rotateY: [0, 8, 0, -8, 0], y: [0, -2, 0] } : undefined}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ perspective: 600, transformStyle: 'preserve-3d' }}
        className="relative w-full h-full rounded-xl bg-gradient-to-b from-[#2a2e39] to-[#151820] border border-skeuo-gold/40 shadow-skeuo-panel flex items-center justify-center overflow-hidden"
      >
        {/* Top specular highlight */}
        <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* 3D Isometric Inventory Box SVG */}
        <svg
          width={s.svg}
          height={s.svg}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
        >
          <defs>
            {/* Gold Top Face */}
            <linearGradient id="topFace" x1="24" y1="6" x2="24" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fced96" />
              <stop offset="100%" stopColor="#d4af37" />
            </linearGradient>

            {/* Left Dark Gold Face */}
            <linearGradient id="leftFace" x1="8" y1="18" x2="24" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c59b27" />
              <stop offset="100%" stopColor="#7a580c" />
            </linearGradient>

            {/* Right Chrome/Gold Face */}
            <linearGradient id="rightFace" x1="24" y1="18" x2="40" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e5c158" />
              <stop offset="100%" stopColor="#997312" />
            </linearGradient>

            {/* Inner Core Glow */}
            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Isometric Cube Top Face */}
          <polygon
            points="24,6 39,14.5 24,23 9,14.5"
            fill="url(#topFace)"
            stroke="#fff"
            strokeWidth="0.75"
            strokeOpacity="0.4"
          />

          {/* Cube Left Face */}
          <polygon
            points="9,14.5 24,23 24,40 9,31.5"
            fill="url(#leftFace)"
            stroke="#000"
            strokeWidth="0.5"
            strokeOpacity="0.5"
          />

          {/* Cube Right Face */}
          <polygon
            points="24,23 39,14.5 39,31.5 24,40"
            fill="url(#rightFace)"
            stroke="#000"
            strokeWidth="0.5"
            strokeOpacity="0.5"
          />

          {/* Inventory Box Seams / Straps */}
          <line x1="24" y1="6" x2="24" y2="23" stroke="#543c06" strokeWidth="1.2" strokeOpacity="0.6" />
          <line x1="9" y1="23" x2="24" y2="31.5" stroke="#543c06" strokeWidth="1.2" strokeOpacity="0.6" />
          <line x1="24" y1="31.5" x2="39" y2="23" stroke="#543c06" strokeWidth="1.2" strokeOpacity="0.6" />

          {/* Center Brand Monogram / Diamond badge */}
          <polygon points="24,18 28,23 24,28 20,23" fill="#0f1218" stroke="#d4af37" strokeWidth="1" />
          <circle cx="24" cy="23" r="1.5" fill="#fef08a" />
        </svg>

        {/* Bottom edge shadow */}
        <span className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-black/60 to-transparent" />
      </motion.div>
    </div>
  );
};
