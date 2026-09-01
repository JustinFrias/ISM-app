import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps { children: React.ReactNode; }

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, rotateY: -8, scale: 0.97, x: 20 }}
        animate={{ opacity: 1, rotateY: 0, scale: 1, x: 0 }}
        exit={{ opacity: 0, rotateY: 8, scale: 0.97, x: -20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.7 }}
        style={{ perspective: 1400, transformStyle: 'preserve-3d' }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
