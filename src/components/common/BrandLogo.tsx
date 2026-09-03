import React from 'react';
import { motion } from 'framer-motion';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  showScanLine?: boolean;
}

const sizeMap = {
  sm: { box: 'w-8 h-8', svg: 26 },
  md: { box: 'w-10 h-10', svg: 34 },
  lg: { box: 'w-16 h-16', svg: 52 },
  xl: { box: 'w-20 h-20', svg: 68 },
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  animated = true,
  className = '',
  showScanLine = true,
}) => {
  const s = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center ${s.box} ${className}`}>
      {/* Dynamic Cyber Ambient Glow */}
      <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-skeuo-gold/20 via-blue-500/15 to-amber-400/20 blur-md pointer-events-none" />

      {/* 3D Skeuomorphic Chassis Container */}
      <motion.div
        animate={animated ? { y: [0, -3, 0], rotateY: [0, 6, 0, -6, 0] } : undefined}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ perspective: 700, transformStyle: 'preserve-3d' }}
        className="relative w-full h-full rounded-2xl bg-gradient-to-b from-[#252932] via-[#1a1d24] to-[#101217] border border-white/15 shadow-[0_12px_24px_-6px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_0_1px_rgba(212,175,55,0.3)] flex items-center justify-center overflow-hidden"
      >
        {/* Top Metallic Specular Edge */}
        <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        {/* Animated Holographic Laser Scan Line */}
        {showScanLine && (
          <motion.div
            animate={{ top: ['-20%', '120%'] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-75 shadow-[0_0_8px_#f59e0b] pointer-events-none z-20"
          />
        )}

        {/* Tech-Inventory Vector Emblem */}
        <svg
          width={s.svg}
          height={s.svg}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]"
        >
          <defs>
            {/* Top Roof Face (Brushed Titanium Gold) */}
            <linearGradient id="techTop" x1="32" y1="8" x2="32" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fae588" />
              <stop offset="60%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#96771e" />
            </linearGradient>

            {/* Left Industrial Armor Plate */}
            <linearGradient id="techLeft" x1="10" y1="21" x2="32" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b4252" />
              <stop offset="45%" stopColor="#252a35" />
              <stop offset="100%" stopColor="#14171e" />
            </linearGradient>

            {/* Right Industrial Armor Plate */}
            <linearGradient id="techRight" x1="32" y1="21" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2e3442" />
              <stop offset="45%" stopColor="#1c202a" />
              <stop offset="100%" stopColor="#0e1015" />
            </linearGradient>

            {/* Circuit Line Glow Filter */}
            <filter id="circuitGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ================= 3D SMART INVENTORY CRATE ================= */}
          {/* Base Shadow */}
          <polygon points="12,46 32,58 52,46 32,36" fill="#050608" opacity="0.6" />

          {/* Top Isometric Face */}
          <polygon
            points="32,8 54,20 32,32 10,20"
            fill="url(#techTop)"
            stroke="#fff"
            strokeWidth="0.8"
            strokeOpacity="0.6"
          />

          {/* Left Isometric Face */}
          <polygon
            points="10,20 32,32 32,54 10,42"
            fill="url(#techLeft)"
            stroke="rgba(212,175,55,0.4)"
            strokeWidth="0.8"
          />

          {/* Right Isometric Face */}
          <polygon
            points="32,32 54,20 54,42 32,54"
            fill="url(#techRight)"
            stroke="rgba(212,175,55,0.4)"
            strokeWidth="0.8"
          />

          {/* Logistics Storage Structural Reinforcement Bands */}
          <line x1="32" y1="8" x2="32" y2="32" stroke="#473708" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="10" y1="31" x2="32" y2="43" stroke="#d4af37" strokeWidth="1" strokeOpacity="0.5" />
          <line x1="32" y1="43" x2="54" y2="31" stroke="#d4af37" strokeWidth="1" strokeOpacity="0.5" />

          {/* ================= TECH CIRCUITRY & SENSORS ================= */}
          {/* Top Face Circuit Node Traces */}
          <path
            d="M24,15 L32,19 L40,15"
            stroke="#ffffff"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.85"
          />
          <circle cx="32" cy="19" r="1.5" fill="#ffffff" filter="url(#circuitGlow)" />

          {/* Left Face Digital Inventory Level Bars */}
          <rect x="15" y="27" width="2" height="8" rx="1" fill="#38bdf8" opacity="0.9" />
          <rect x="19" y="29" width="2" height="8" rx="1" fill="#38bdf8" opacity="0.9" />
          <rect x="23" y="31" width="2" height="8" rx="1" fill="#38bdf8" opacity="0.9" />

          {/* Right Face RFID Micro-Chip Traces */}
          <path
            d="M44,28 L38,32 M47,32 L41,36 M44,38 L38,42"
            stroke="#d4af37"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Center Digital Core / Smart Hex Diamond */}
          <polygon
            points="32,26 37,32 32,38 27,32"
            fill="#090b10"
            stroke="#f59e0b"
            strokeWidth="1.2"
            filter="url(#circuitGlow)"
          />
          <circle cx="32" cy="32" r="1.8" fill="#fef08a" />
        </svg>

        {/* Bottom Ambient Occlusion Shadow */}
        <span className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-black/80 to-transparent" />
      </motion.div>
    </div>
  );
};
