import React from 'react';
import { motion } from 'framer-motion';

export const FloatingParticles: React.FC = () => {
  // Generate random particles for tech-cyber atmosphere
  const particles = Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 8,
    delay: Math.random() * 5,
    color: i % 3 === 0 ? 'bg-amber-400' : i % 3 === 1 ? 'bg-blue-400' : 'bg-skeuo-gold',
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Moving Ambient Glowing Orbs */}
      <motion.div
        animate={{
          x: [0, 80, -60, 0],
          y: [0, -60, 80, 0],
          scale: [1, 1.25, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-gradient-to-tr from-amber-500/10 via-yellow-600/08 to-transparent rounded-full blur-[100px]"
      />

      <motion.div
        animate={{
          x: [0, -90, 70, 0],
          y: [0, 70, -50, 0],
          scale: [1, 0.85, 1.2, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-bl from-blue-600/10 via-cyan-500/08 to-transparent rounded-full blur-[100px]"
      />

      {/* Cyber Grid Lines Sweep */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212, 175, 55, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Laser Scanning Beam Across Grid */}
      <motion.div
        animate={{ y: ['-10%', '110%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-amber-500/05 to-transparent pointer-events-none"
      />

      {/* Floating Ambient Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: `${p.x}%`,
            y: `${p.y}%`,
            opacity: 0.2,
          }}
          animate={{
            y: [`${p.y}%`, `${(p.y - 30 + 100) % 100}%`],
            x: [`${p.x}%`, `${(p.x + (p.id % 2 === 0 ? 15 : -15) + 100) % 100}%`],
            opacity: [0.15, 0.85, 0.15],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
          style={{ width: `${p.size}px`, height: `${p.size}px` }}
          className={`absolute rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)] ${p.color}`}
        />
      ))}
    </div>
  );
};
