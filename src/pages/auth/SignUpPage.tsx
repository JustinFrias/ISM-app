import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield } from 'lucide-react';
import { SignUp } from '@clerk/clerk-react';
import { skeuoClerkAppearance } from '../../services/clerk';

export const SignUpPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-skeuo-bg relative overflow-hidden p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-skeuo-gold/04 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-skeuo-neonBlue/04 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -inset-2 rounded-[28px] bg-metallic-gold opacity-20 blur-sm" />
        <div className="relative skeuo-panel border border-skeuo-gold/20 rounded-3xl overflow-hidden shadow-skeuo-vault p-6">
          <div className="text-center mb-6">
            <h1 className="font-display font-black text-2xl text-skeuo-chrome">SkeuoVault</h1>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Create Your Account</p>
          </div>
          <div className="flex justify-center">
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/login"
              fallbackRedirectUrl="/admin"
              appearance={skeuoClerkAppearance}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
