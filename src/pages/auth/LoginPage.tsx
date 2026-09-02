import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, Shield, KeyRound } from 'lucide-react';
import { SignIn, useUser } from '@clerk/clerk-react';
import { useAuthStore } from '../../store/useAuthStore';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoInput } from '../../components/skeuomorphic/SkeuoInput';
import { isClerkConfigured, skeuoClerkAppearance } from '../../services/clerk';
import { BrandLogo } from '../../components/common/BrandLogo';

import { FloatingParticles } from '../../components/common/FloatingParticles';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'clerk' | 'demo'>(isClerkConfigured ? 'clerk' : 'demo');

  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(username, password);
    setLoading(false);
    if (result.success) {
      const role = useAuthStore.getState().currentUser?.role;
      navigate(role === 'ADMIN' ? '/admin' : '/staff');
    } else {
      setError(result.error || 'Authentication failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-skeuo-bg relative overflow-hidden p-4">
      {/* Animated Ambient Background & Particles */}
      <FloatingParticles />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ y: -4, transition: { duration: 0.3 } }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Animated Vault outer rim glow */}
        <motion.div
          animate={{ opacity: [0.2, 0.45, 0.2], scale: [0.99, 1.01, 0.99] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-2 rounded-[30px] bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-600/30 blur-md pointer-events-none"
        />

        <div className="relative skeuo-panel border border-skeuo-gold/25 rounded-3xl overflow-hidden shadow-skeuo-vault">
          {/* Animated Sweeping Light Beam on Top Border */}
          <motion.span
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300 to-transparent z-20 pointer-events-none"
          />

          {/* Header */}
          <div className="px-8 pt-8 pb-5 text-center border-b border-white/06">
            {/* Brand 3D Logo */}
            <div className="flex justify-center mb-4">
              <BrandLogo size="xl" />
            </div>

            <h1 className="font-brand font-bold text-[22px] sm:text-2xl text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-300 tracking-[-0.02em] leading-tight">
              Inventory System Management
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-skeuo-gold/10 border border-skeuo-gold/30 text-skeuo-gold text-[10px] font-mono font-semibold uppercase tracking-widest mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-skeuo-gold animate-led-pulse-amber" />
              ISM Enterprise System
            </div>
            <div className="flex items-center justify-center gap-2 mt-3.5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
              <Shield size={11} className="text-gray-500" />
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>

            {/* Auth mode toggle if Clerk is configured */}
            {isClerkConfigured && (
              <div className="flex justify-center mt-4">
                <div className="inline-flex p-1 bg-black/40 rounded-xl border border-white/08">
                  <button
                    type="button"
                    onClick={() => setAuthMode('clerk')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      authMode === 'clerk'
                        ? 'bg-skeuo-gold text-black shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Clerk Sign-In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('demo')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      authMode === 'demo'
                        ? 'bg-skeuo-gold text-black shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Demo Mode
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Form Content */}
          <div className="p-6">
            {isClerkConfigured && authMode === 'clerk' ? (
              <div className="flex justify-center py-2">
                <SignIn
                  routing="path"
                  path="/login"
                  signUpUrl="/sign-up"
                  fallbackRedirectUrl="/admin"
                  appearance={skeuoClerkAppearance}
                />
              </div>
            ) : (
              <form onSubmit={handleDemoLogin} className="space-y-4">
                <SkeuoInput
                  id="username"
                  label="Username"
                  placeholder="Enter username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  prefix={<User size={14} />}
                  required
                  autoComplete="username"
                />
                <SkeuoInput
                  id="password"
                  label="Password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  prefix={<Lock size={14} />}
                  suffix={
                    <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-500 hover:text-gray-300">
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  }
                  required
                  autoComplete="current-password"
                  error={error}
                />

                <SkeuoButton
                  type="submit"
                  variant="gold"
                  size="lg"
                  isLoading={loading}
                  ledStatus={loading ? 'amber' : 'green'}
                  className="w-full mt-2"
                >
                  {loading ? 'Authenticating...' : 'Access Vault'}
                </SkeuoButton>

                {/* Demo credentials */}
                <div className="rounded-xl bg-black/40 border border-white/08 p-3.5 space-y-2 mt-4 backdrop-blur-md">
                  <p className="skeuo-label text-center mb-1.5 flex items-center justify-center gap-1.5 text-amber-400/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Demo Credentials (Click to Auto-fill)
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <motion.button
                      whileHover={{ scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => { setUsername('admin'); setPassword('admin1234'); }}
                      className="bg-white/04 rounded-xl p-2.5 border border-skeuo-gold/20 text-left transition-all shadow-sm hover:shadow-skeuo-led-amber"
                    >
                      <p className="text-skeuo-gold font-semibold mb-0.5 flex items-center gap-1">
                        <span>⚡</span> Admin
                      </p>
                      <p className="text-gray-400 font-mono text-[11px]">admin / admin1234</p>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => { setUsername('staff01'); setPassword('staff1234'); }}
                      className="bg-white/04 rounded-xl p-2.5 border border-emerald-500/20 text-left transition-all shadow-sm hover:shadow-skeuo-led-green"
                    >
                      <p className="text-emerald-400 font-semibold mb-0.5 flex items-center gap-1">
                        <span>📦</span> Staff
                      </p>
                      <p className="text-gray-400 font-mono text-[11px]">staff01 / staff1234</p>
                    </motion.button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Bottom specular */}
          <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/05 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
};
