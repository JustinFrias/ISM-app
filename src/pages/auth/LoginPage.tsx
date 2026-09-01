import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoInput } from '../../components/skeuomorphic/SkeuoInput';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
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
    <div className="min-h-screen flex items-center justify-center bg-skeuo-bg relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-skeuo-gold/04 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-skeuo-neonBlue/04 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="relative w-full max-w-md"
      >
        {/* Vault door outer rim */}
        <div className="absolute -inset-2 rounded-[28px] bg-metallic-gold opacity-20 blur-sm" />

        <div className="relative skeuo-panel border border-skeuo-gold/20 rounded-3xl overflow-hidden">
          {/* Top specular */}
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-skeuo-gold/40 to-transparent" />

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-white/06">
            {/* Vault dial visual */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="mx-auto mb-4 w-20 h-20 rounded-full bg-metallic-gold flex items-center justify-center shadow-skeuo-vault relative"
            >
              {/* Dial notches */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="absolute w-1 h-3 bg-black/40 rounded-full origin-center"
                  style={{ transform: `rotate(${i * 30}deg) translateY(-32px)` }} />
              ))}
              <Lock size={28} className="text-black relative z-10" strokeWidth={2.5} />
            </motion.div>

            <h1 className="font-display font-black text-2xl text-skeuo-chrome">SkeuoVault</h1>
            <p className="text-sm text-gray-500 mt-1 tracking-wider">INVENTORY MANAGEMENT SYSTEM</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-skeuo-gold/30" />
              <Shield size={12} className="text-skeuo-gold" />
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-skeuo-gold/30" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="px-8 py-7 space-y-5">
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
              className="w-full"
            >
              {loading ? 'Authenticating...' : 'Access Vault'}
            </SkeuoButton>

            {/* Demo credentials */}
            <div className="rounded-xl bg-black/30 border border-white/06 p-4 space-y-2">
              <p className="skeuo-label text-center mb-2">Demo Credentials</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/04 rounded-lg p-2.5 border border-white/06">
                  <p className="text-skeuo-gold font-semibold mb-1">Admin</p>
                  <p className="text-gray-400 font-mono">admin / admin1234</p>
                </div>
                <div className="bg-white/04 rounded-lg p-2.5 border border-white/06">
                  <p className="text-emerald-400 font-semibold mb-1">Staff</p>
                  <p className="text-gray-400 font-mono">staff01 / staff1234</p>
                </div>
              </div>
            </div>
          </form>

          {/* Bottom specular */}
          <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/05 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
};
