import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignUp } from '@clerk/clerk-react';
import {
  User, Mail, Lock, Eye, EyeOff, Shield, CheckCircle2,
  ArrowRight, RotateCcw, KeyRound
} from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo';
import { useAuthStore } from '../../store/useAuthStore';

/* ─── 6-Digit OTP Box Component ─────────────────────────────────────────── */
const OtpInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Array of exactly 6 slots
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  useEffect(() => {
    // Auto focus first empty input on mount
    const firstEmptyIndex = digits.findIndex(d => !d);
    const targetIdx = firstEmptyIndex === -1 ? 5 : firstEmptyIndex;
    inputRefs.current[targetIdx]?.focus();
  }, []);

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const currentDigits = [...digits];
      if (currentDigits[index]) {
        currentDigits[index] = '';
        onChange(currentDigits.join(''));
      } else if (index > 0) {
        currentDigits[index - 1] = '';
        onChange(currentDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      const currentDigits = [...digits];
      currentDigits[index] = '';
      onChange(currentDigits.join(''));
      return;
    }

    const lastChar = rawVal.slice(-1);
    const currentDigits = [...digits];
    currentDigits[index] = lastChar;
    const newCode = currentDigits.join('');
    onChange(newCode);

    // Auto move to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      onChange(pastedData);
      const nextFocus = Math.min(pastedData.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={e => handleInputChange(i, e)}
            onKeyDown={e => handleKeyDown(i, e)}
            autoFocus={i === 0}
            className={`
              w-11 h-14 sm:w-12 sm:h-15 text-center text-2xl font-mono font-bold rounded-xl border-2 transition-all outline-none
              bg-[#0e1117] text-white shadow-inner
              ${digit
                ? 'border-skeuo-gold bg-[#161a22] text-skeuo-gold shadow-[0_0_14px_rgba(212,175,55,0.4)]'
                : 'border-white/20 hover:border-white/40'
              }
              focus:border-skeuo-gold focus:bg-[#161a22] focus:shadow-[0_0_16px_rgba(212,175,55,0.5)]
              disabled:opacity-40 disabled:cursor-not-allowed
            `}
            style={{ caretColor: '#d4af37' }}
          />
        ))}
      </div>
      <p className="text-[11px] text-gray-500 font-mono mt-1">
        Type or paste the 6-digit code sent to your inbox
      </p>
    </div>
  );
};

/* ─── Main SignUp Page ───────────────────────────────────────────────── */
type Step = 'details' | 'verify' | 'done';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, setActive, isLoaded } = useSignUp();
  const setClerkUser = useAuthStore(s => s.setClerkUser);

  // Step state
  const [step, setStep] = useState<Step>('details');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP fields
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Countdown timer (60s)
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = () => {
    setCountdown(60);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  /* ── Helper to Complete Authentication and Redirect ── */
  const completeSessionAndEnter = async (sessionId?: string | null, userId?: string | null) => {
    if (sessionId && setActive) {
      await setActive({ session: sessionId });
    }

    const finalUsername = (username.trim() || email.split('@')[0] || 'admin').toLowerCase();

    // Synchronize immediately to Zustand store so protected routes unlock
    setClerkUser({
      id: userId || 'admin-user',
      username: finalUsername,
      fullName: `${firstName} ${lastName}`.trim() || 'Admin User',
      email: email,
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });

    setStep('done');

    // Direct redirect to ISM dashboard
    setTimeout(() => {
      navigate('/admin', { replace: true });
    }, 1200);
  };

  /* ── Step 1: Submit Details & Request OTP ── */
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setError('');
    setLoading(true);

    try {
      const rawUser = (username.trim() || email.split('@')[0] || 'user')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase()
        .slice(0, 18);
      const safeUsername = rawUser.length >= 4 ? rawUser : (rawUser + '1234').slice(0, 18);

      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        username: safeUsername,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
      startCountdown();
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Verify OTP Code & Handle missing_requirements ── */
  const handleVerify = async () => {
    const cleanOtp = otp.trim();
    if (cleanOtp.length < 6 || verifying || !isLoaded || !signUp) return;

    setOtpError('');
    setVerifying(true);

    try {
      // 1. Attempt verification with the 6-digit code
      let result = await signUp.attemptEmailAddressVerification({ code: cleanOtp });

      // 2. If already complete, log in immediately
      if (result.status === 'complete') {
        await completeSessionAndEnter(result.createdSessionId, result.createdUserId);
        return;
      }

      // 3. If missing_requirements (e.g. Clerk instance requires username or name)
      if (result.status === 'missing_requirements') {
        const missing = (result as any).missingFields || [];

        if (missing.length > 0) {
          const updatePayload: Record<string, string> = {};

          if (missing.includes('username')) {
            const rawUser = (username.trim() || email.split('@')[0] || 'user')
              .replace(/[^a-zA-Z0-9_]/g, '')
              .toLowerCase()
              .slice(0, 18);
            updatePayload.username = rawUser.length >= 4 ? rawUser : (rawUser + '1234').slice(0, 18);
          }

          if (missing.includes('first_name')) updatePayload.firstName = firstName || 'User';
          if (missing.includes('last_name')) updatePayload.lastName = lastName || 'Admin';

          try {
            result = await signUp.update(updatePayload);
          } catch (updateErr: any) {
            // In case username collided, append random suffix
            if (updatePayload.username) {
              updatePayload.username = `${updatePayload.username.slice(0, 12)}_${Math.floor(100 + Math.random() * 900)}`;
              result = await signUp.update(updatePayload);
            }
          }

          if (result.status === 'complete') {
            await completeSessionAndEnter(result.createdSessionId, result.createdUserId);
            return;
          }
        }

        // If session was created despite missing_requirements
        if (result.createdSessionId) {
          await completeSessionAndEnter(result.createdSessionId, result.createdUserId);
          return;
        }

        const remainingMissing = (result as any).missingFields || [];
        setOtpError(`Required fields missing: ${remainingMissing.join(', ') || result.status}`);
      } else {
        setOtpError(`Verification status: ${result.status}`);
      }
    } catch (err: any) {
      setOtpError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Invalid or expired verification code. Please check and try again.');
    } finally {
      setVerifying(false);
    }
  };

  /* ── Resend Code ── */
  const handleResend = async () => {
    if (!canResend || !isLoaded || !signUp) return;
    setOtpError('');
    setOtp('');

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      startCountdown();
    } catch (err: any) {
      setOtpError(err.errors?.[0]?.message || 'Failed to resend verification code.');
    }
  };

  /* ── Auto-submit verification once all 6 digits are entered ── */
  useEffect(() => {
    if (otp.replace(/\D/g, '').length === 6 && step === 'verify' && !verifying) {
      handleVerify();
    }
  }, [otp, step]);

  /* ─── Render UI ───────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-skeuo-bg relative overflow-hidden p-4">
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-skeuo-gold/05 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-skeuo-neonBlue/05 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="relative w-full max-w-md"
      >
        {/* Outer gold rim glow */}
        <div className="absolute -inset-2 rounded-[28px] bg-metallic-gold opacity-20 blur-sm pointer-events-none" />

        <div className="relative skeuo-panel border border-skeuo-gold/25 rounded-3xl overflow-hidden shadow-skeuo-vault">
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-skeuo-gold/50 to-transparent" />

          {/* Header */}
          <div className="px-8 pt-8 pb-5 text-center border-b border-white/06">
            <div className="flex justify-center mb-4">
              <BrandLogo size="xl" />
            </div>
            <h1 className="font-brand font-bold text-[22px] sm:text-2xl text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-300 tracking-[-0.02em] leading-tight">
              Inventory System Management
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-skeuo-gold/10 border border-skeuo-gold/30 text-skeuo-gold text-[10px] font-mono font-semibold uppercase tracking-widest mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-skeuo-gold animate-led-pulse-amber" />
              Create Account
            </div>

            {/* Step progress pills */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {(['details', 'verify', 'done'] as Step[]).map((s, i) => {
                const stepIdx = ['details', 'verify', 'done'].indexOf(step);
                const isPassed = stepIdx > i;
                const isCurrent = step === s;
                return (
                  <React.Fragment key={s}>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                        isCurrent
                          ? 'bg-skeuo-gold border-skeuo-gold text-black shadow-[0_0_10px_rgba(212,175,55,0.5)]'
                          : isPassed
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-white/04 border-white/10 text-gray-500'
                      }`}
                    >
                      {isPassed ? '✓' : i + 1}
                    </div>
                    {i < 2 && (
                      <div
                        className={`h-0.5 w-8 transition-all ${
                          stepIdx > i ? 'bg-emerald-500/60' : 'bg-white/10'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* ── STEP 1: Registration Details ── */}
              {step === 'details' && (
                <motion.form
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleDetailsSubmit}
                  className="space-y-3.5"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="skeuo-label text-[11px]">First Name</label>
                      <div className="relative">
                        <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          placeholder="Juan"
                          required
                          className="w-full pl-8 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-skeuo-gold/70 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="skeuo-label text-[11px]">Last Name</label>
                      <div className="relative">
                        <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          value={lastName}
                          onChange={e => setLastName(e.target.value)}
                          placeholder="Dela Cruz"
                          required
                          className="w-full pl-8 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-skeuo-gold/70 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Username (required by Clerk instance) */}
                  <div className="space-y-1.5">
                    <label className="skeuo-label text-[11px]">Username</label>
                    <div className="relative">
                      <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="juan_delacruz"
                        required
                        className="w-full pl-8 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-skeuo-gold/70 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="skeuo-label text-[11px]">Email Address</label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          if (!username) {
                            setUsername(e.target.value.split('@')[0].replace(/[^a-zA-Z0-9_]/g, ''));
                          }
                        }}
                        placeholder="juan@company.com"
                        required
                        className="w-full pl-8 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-skeuo-gold/70 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="skeuo-label text-[11px]">Password</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        required
                        minLength={8}
                        className="w-full pl-8 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-skeuo-gold/70 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-sm text-black transition-all mt-1
                      bg-gradient-to-r from-[#f5d77f] via-[#d4af37] to-[#997b1e]
                      shadow-[0_4px_16px_rgba(212,175,55,0.35)]
                      hover:shadow-[0_6px_22px_rgba(212,175,55,0.5)] hover:brightness-110
                      disabled:opacity-60 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Sending Verification Code...
                      </>
                    ) : (
                      <>
                        <ArrowRight size={15} /> Continue & Send Code
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400 mt-2">
                    Already have an account?{' '}
                    <Link to="/login" className="text-skeuo-gold hover:text-[#f5d77f] font-semibold transition-colors">
                      Sign In
                    </Link>
                  </p>
                </motion.form>
              )}

              {/* ── STEP 2: 6-Digit Email Verification Code ── */}
              {step === 'verify' && (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="text-center space-y-5"
                >
                  <div className="flex justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-skeuo-gold/10 border border-skeuo-gold/30 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                      <KeyRound size={26} className="text-skeuo-gold animate-bounce" style={{ animationDuration: '2s' }} />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-white font-bold text-lg">Check Your Email</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      We sent a <span className="text-skeuo-gold font-semibold">6-digit code</span> to
                    </p>
                    <p className="text-white font-semibold text-sm mt-0.5 break-all">{email}</p>
                  </div>

                  {/* 6 Digit Input Boxes */}
                  <div className="py-2">
                    <OtpInput value={otp} onChange={setOtp} disabled={verifying} />
                  </div>

                  {otpError && (
                    <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                      {otpError}
                    </div>
                  )}

                  {/* Verify & Enter Dashboard button */}
                  <button
                    onClick={handleVerify}
                    disabled={otp.replace(/\D/g, '').length < 6 || verifying}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-black transition-all
                      bg-gradient-to-r from-[#f5d77f] via-[#d4af37] to-[#997b1e]
                      shadow-[0_4px_16px_rgba(212,175,55,0.35)]
                      hover:shadow-[0_6px_22px_rgba(212,175,55,0.5)] hover:brightness-110
                      disabled:opacity-40 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2"
                  >
                    {verifying ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Verifying & Completing Setup...
                      </>
                    ) : (
                      <>
                        <Shield size={16} /> Verify & Access ISM
                      </>
                    )}
                  </button>

                  {/* 60s Resend Timer */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={handleResend}
                      disabled={!canResend}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-all ${
                        canResend
                          ? 'text-skeuo-gold hover:text-[#f5d77f] cursor-pointer'
                          : 'text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <RotateCcw size={12} />
                      Resend Code
                    </button>
                    {!canResend && (
                      <span className="text-xs text-gray-500">
                        in <span className="text-skeuo-gold font-mono font-bold">{countdown}s</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Verification Success & Redirect ── */}
              {step === 'done' && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="text-center py-6 space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                    className="flex justify-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 size={34} className="text-emerald-400" />
                    </div>
                  </motion.div>
                  <div>
                    <h2 className="text-white font-bold text-xl">Verification Successful!</h2>
                    <p className="text-gray-400 text-sm mt-1">Accessing ISM Vault Dashboard...</p>
                  </div>
                  <div className="flex justify-center pt-2">
                    <span className="w-6 h-6 border-2 border-skeuo-gold/30 border-t-skeuo-gold rounded-full animate-spin" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/05 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
};
