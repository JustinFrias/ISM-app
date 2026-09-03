import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignUp, useUser } from '@clerk/clerk-react';
import {
  User, Mail, Lock, Eye, EyeOff, Shield, CheckCircle2,
  ArrowRight, RotateCcw, KeyRound, ShieldAlert, Check,
  Boxes, Settings, ArrowLeft
} from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo';
import { useAuthStore } from '../../store/useAuthStore';

/* ─── OTP digit input ─────────────────────────────────────────── */
const OtpInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const currentDigits = [...digits];
      if (currentDigits[i]) {
        currentDigits[i] = '';
        onChange(currentDigits.join(''));
      } else if (i > 0) {
        currentDigits[i - 1] = '';
        onChange(currentDigits.join(''));
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < 5) {
      refs.current[i + 1]?.focus();
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const currentDigits = [...digits];
    currentDigits[i] = char;
    onChange(currentDigits.join(''));
    if (char && i < 5) {
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    onChange(pasted);
    const nextFocusIndex = Math.min(pasted.length, 5);
    refs.current[nextFocusIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          className={`
            w-11 h-14 text-center text-xl font-bold rounded-xl border transition-all outline-none
            bg-black/40 text-white
            ${d ? 'border-skeuo-gold shadow-[0_0_12px_rgba(212,175,55,0.3)]' : 'border-white/10'}
            focus:border-skeuo-gold focus:shadow-[0_0_16px_rgba(212,175,55,0.4)]
            disabled:opacity-40
          `}
          style={{ caretColor: '#d4af37' }}
        />
      ))}
    </div>
  );
};

/* ─── Main Page ───────────────────────────────────────────────── */
type Step = 'details' | 'verify' | 'choose-role' | 'done';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { user } = useUser();
  const setClerkUser = useAuthStore(s => s.setClerkUser);

  // Step
  const [step, setStep] = useState<Step>('details');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Role Selection
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'STAFF'>('STAFF');
  const [savingRole, setSavingRole] = useState(false);

  // Countdown
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

  // If signUp email is already marked as verified, allow proceeding directly
  useEffect(() => {
    if (signUp?.verifications?.emailAddress?.status === 'verified') {
      setStep('choose-role');
    }
  }, [signUp?.verifications?.emailAddress?.status]);

  /* ── Step 1: submit details & send OTP ── */
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError('');
    setLoading(true);
    try {
      await signUp!.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });
      await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
      startCountdown();
    } catch (err: any) {
      const msg = err.errors?.[0]?.message || 'Sign-up failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: verify OTP ── */
  const handleVerify = async () => {
    setOtpError('');
    setVerifying(true);
    try {
      // Check if already completed
      if (signUp?.status === 'complete') {
        if (signUp.createdSessionId) {
          try {
            await setActive!({ session: signUp.createdSessionId });
          } catch {}
        }
        setStep('choose-role');
        return;
      }

      const result = await signUp!.attemptEmailAddressVerification({ code: otp.trim() });
      if (result.status === 'complete') {
        if (result.createdSessionId) {
          await setActive!({ session: result.createdSessionId });
        }
        setStep('choose-role');
      } else {
        setOtpError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      const msg = err.errors?.[0]?.message || err.message || '';
      // If code was already verified, transition smoothly to role selection
      if (
        msg.toLowerCase().includes('already verified') ||
        err.errors?.[0]?.code === 'already_verified'
      ) {
        if (signUp?.createdSessionId) {
          try {
            await setActive!({ session: signUp.createdSessionId });
          } catch {}
        }
        setStep('choose-role');
        return;
      }
      setOtpError(msg || 'Invalid code. Please try again.');
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    if (!canResend) return;
    setOtpError('');
    setOtp('');
    try {
      await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' });
      startCountdown();
    } catch (err: any) {
      setOtpError(err.errors?.[0]?.message || 'Failed to resend code.');
    }
  };

  /* ── Auto-verify when 6 digits filled ── */
  useEffect(() => {
    if (otp.replace(/\s/g, '').length === 6 && step === 'verify') {
      handleVerify();
    }
  }, [otp]);

  /* ── Step 3: Confirm Role & Finalize Account ── */
  const handleConfirmRole = async () => {
    setSavingRole(true);
    const targetEmail = (email || user?.primaryEmailAddress?.emailAddress || signUp?.emailAddress || '').toLowerCase();
    const userId = user?.id || signUp?.createdUserId || `user_${Date.now()}`;

    try {
      // 1. Persist permanently to Clerk User metadata if user instance is ready
      if (user) {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            role: selectedRole,
            roleAssignedAt: new Date().toISOString(),
          },
        });
      }

      // 2. Persist to localStorage by email and userId as permanent anchor
      if (targetEmail) {
        localStorage.setItem(`ism_user_role_${targetEmail}`, selectedRole);
      }
      if (userId) {
        localStorage.setItem(`ism_user_role_${userId}`, selectedRole);
      }

      // 3. Update Zustand auth store
      setClerkUser({
        id: userId,
        username: user?.username || targetEmail.split('@')[0] || (selectedRole === 'ADMIN' ? 'admin' : 'staff'),
        fullName: user?.fullName || `${firstName} ${lastName}`.trim() || 'Authorized User',
        email: targetEmail,
        role: selectedRole,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });

      setStep('done');

      // Navigate to destination dashboard
      setTimeout(() => {
        navigate(selectedRole === 'ADMIN' ? '/admin' : '/staff', { replace: true });
      }, 1500);
    } catch (err: any) {
      console.error('Error saving role:', err);
      // Fallback: still persist locally and navigate
      if (targetEmail) {
        localStorage.setItem(`ism_user_role_${targetEmail}`, selectedRole);
      }
      setStep('done');
      setTimeout(() => {
        navigate(selectedRole === 'ADMIN' ? '/admin' : '/staff', { replace: true });
      }, 1500);
    } finally {
      setSavingRole(false);
    }
  };

  /* ─── UI ───────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-skeuo-bg relative overflow-hidden p-4">
      {/* Ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-skeuo-gold/04 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-skeuo-neonBlue/04 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="relative w-full max-w-lg"
      >
        {/* Gold rim glow */}
        <div className="absolute -inset-2 rounded-[28px] bg-metallic-gold opacity-20 blur-sm" />

        <div className="relative skeuo-panel border border-skeuo-gold/20 rounded-3xl overflow-hidden shadow-skeuo-vault">
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-skeuo-gold/40 to-transparent" />

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
              {step === 'choose-role' ? 'Select Role' : step === 'verify' ? 'Email Verification' : 'Create Account'}
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {[
                { id: 'details', label: '1' },
                { id: 'verify', label: '2' },
                { id: 'choose-role', label: '3' },
              ].map((s, i) => {
                const stepOrder = ['details', 'verify', 'choose-role', 'done'];
                const currentIndex = stepOrder.indexOf(step);
                const isPassed = currentIndex > i;
                const isCurrent = step === s.id;

                return (
                  <React.Fragment key={s.id}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      isCurrent
                        ? 'bg-skeuo-gold border-skeuo-gold text-black shadow-[0_0_10px_rgba(212,175,55,0.5)]'
                        : isPassed
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-white/04 border-white/10 text-gray-500'
                    }`}>
                      {isPassed ? '✓' : s.label}
                    </div>
                    {i < 2 && (
                      <div className={`h-px w-8 transition-all ${
                        isPassed ? 'bg-emerald-500/50' : 'bg-white/10'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-7">
            <AnimatePresence mode="wait">

              {/* ── Step 1: Details ── */}
              {step === 'details' && (
                <motion.form
                  key="details"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleDetailsSubmit}
                  className="space-y-4"
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
                          className="w-full pl-8 pr-3 py-2.5 bg-black/40 border border-white/08 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-skeuo-gold/60 transition-colors"
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
                          className="w-full pl-8 pr-3 py-2.5 bg-black/40 border border-white/08 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-skeuo-gold/60 transition-colors"
                        />
                      </div>
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
                        onChange={e => setEmail(e.target.value)}
                        placeholder="juan@company.com"
                        required
                        className="w-full pl-8 pr-3 py-2.5 bg-black/40 border border-white/08 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-skeuo-gold/60 transition-colors"
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
                        className="w-full pl-8 pr-10 py-2.5 bg-black/40 border border-white/08 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-skeuo-gold/60 transition-colors"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-sm text-black transition-all mt-1
                      bg-gradient-to-r from-[#f5d77f] via-[#d4af37] to-[#997b1e]
                      shadow-[0_4px_16px_rgba(212,175,55,0.35)]
                      hover:shadow-[0_6px_20px_rgba(212,175,55,0.5)] hover:brightness-110
                      disabled:opacity-60 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending Code...</>
                    ) : (
                      <><ArrowRight size={15} /> Continue & Send Code</>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-500 mt-2">
                    Already have an account?{' '}
                    <Link to="/login" className="text-skeuo-gold hover:text-[#f5d77f] font-semibold transition-colors">
                      Sign In
                    </Link>
                  </p>
                </motion.form>
              )}

              {/* ── Step 2: Email OTP Verification ── */}
              {step === 'verify' && (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2 }}
                  className="text-center space-y-5"
                >
                  <div className="flex justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-skeuo-gold/10 border border-skeuo-gold/30 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                      <KeyRound size={24} className="text-skeuo-gold" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-white font-bold text-lg">Check Your Email</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      We sent a <span className="text-skeuo-gold font-semibold">6-digit code</span> to
                    </p>
                    <p className="text-white font-semibold text-sm mt-0.5 break-all">
                      {email || signUp?.emailAddress || 'your email'}
                    </p>
                  </div>

                  <OtpInput value={otp} onChange={setOtp} disabled={verifying} />

                  {otpError && (
                    <div className="space-y-2">
                      <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                        {otpError}
                      </div>
                      {/* If already verified, provide instant gateway button */}
                      {(otpError.toLowerCase().includes('already verified') ||
                        otpError.toLowerCase().includes('verified')) && (
                        <button
                          type="button"
                          onClick={() => setStep('choose-role')}
                          className="w-full py-2.5 px-3 rounded-xl bg-skeuo-gold/20 border border-skeuo-gold text-skeuo-gold text-xs font-bold hover:bg-skeuo-gold/30 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                        >
                          Already Verified? Proceed to Select Role <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Verify button */}
                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="w-full py-3 rounded-xl font-bold text-sm text-black transition-all
                      bg-gradient-to-r from-[#f5d77f] via-[#d4af37] to-[#997b1e]
                      shadow-[0_4px_16px_rgba(212,175,55,0.35)]
                      hover:shadow-[0_6px_20px_rgba(212,175,55,0.5)] hover:brightness-110
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2"
                  >
                    {verifying ? (
                      <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Verifying Code...</>
                    ) : (
                      <><Shield size={15} /> Verify & Access ISM</>
                    )}
                  </button>

                  {/* Resend */}
                  <div className="flex items-center justify-center gap-2">
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

              {/* ── Step 3: Choose Role (Admin or Staff) ── */}
              {step === 'choose-role' && (
                <motion.div
                  key="choose-role"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="text-center">
                    <h2 className="text-white font-bold text-lg sm:text-xl">Piliin ang Iyong Role</h2>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">
                      Pumili ng tungkulin para sa iyong account bago pumasok sa dashboard.
                    </p>
                  </div>

                  {/* Role Option Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Admin Card */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('ADMIN')}
                      className={`relative p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        selectedRole === 'ADMIN'
                          ? 'bg-skeuo-gold/10 border-skeuo-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                          : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/03'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            selectedRole === 'ADMIN'
                              ? 'bg-skeuo-gold/20 text-skeuo-gold'
                              : 'bg-white/06 text-gray-400'
                          }`}>
                            <Shield size={20} />
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            selectedRole === 'ADMIN'
                              ? 'bg-skeuo-gold border-skeuo-gold text-black'
                              : 'border-white/20'
                          }`}>
                            {selectedRole === 'ADMIN' && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>

                        <div className="inline-block px-2 py-0.5 rounded-full bg-skeuo-gold/15 text-skeuo-gold text-[10px] font-bold font-mono uppercase tracking-wider mb-1">
                          Full Control
                        </div>
                        <h3 className="text-white font-bold text-base">Administrator</h3>
                        <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                          Ganap na access sa inventory, financial reports, audit logs, at pamamahala ng mga staff.
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/06 text-[11px] text-gray-400 space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <span className="w-1 h-1 rounded-full bg-skeuo-gold" />
                          <span>Pangasiwaan ang buong sistema</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <span className="w-1 h-1 rounded-full bg-skeuo-gold" />
                          <span>Lahat ng ulat at analytics</span>
                        </div>
                      </div>
                    </button>

                    {/* Staff Card */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('STAFF')}
                      className={`relative p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        selectedRole === 'STAFF'
                          ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                          : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/03'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            selectedRole === 'STAFF'
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-white/06 text-gray-400'
                          }`}>
                            <Boxes size={20} />
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            selectedRole === 'STAFF'
                              ? 'bg-cyan-400 border-cyan-400 text-black'
                              : 'border-white/20'
                          }`}>
                            {selectedRole === 'STAFF' && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>

                        <div className="inline-block px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-bold font-mono uppercase tracking-wider mb-1">
                          Operations
                        </div>
                        <h3 className="text-white font-bold text-base">Staff Member</h3>
                        <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                          Pamamahala ng stock-in / stock-out, pagtanggap ng delivery, at pagsusubaybay sa mga produkto.
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/06 text-[11px] text-gray-400 space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <span className="w-1 h-1 rounded-full bg-cyan-400" />
                          <span>Pang-araw-araw na operasyon</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <span className="w-1 h-1 rounded-full bg-cyan-400" />
                          <span>Delivery & stock monitoring</span>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Permanent Lock Warning Alert */}
                  <div className="p-3 rounded-xl bg-amber-500/08 border border-amber-500/25 flex items-start gap-2.5 text-left">
                    <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      <strong className="text-amber-300 font-semibold">Permanente ang mapipili mong Role:</strong> Ang mapipili mong role ({selectedRole}) ay permanenteng nakatali sa iyong account. Sa bawat susunod na pag-login mo sa ISM, <span className="underline font-semibold">{selectedRole} dashboard lamang</span> ang iyong mabubuksan.
                    </p>
                  </div>

                  {/* Confirm & Proceed Button */}
                  <button
                    type="button"
                    onClick={handleConfirmRole}
                    disabled={savingRole}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm text-black transition-all shadow-lg flex items-center justify-center gap-2 ${
                      selectedRole === 'ADMIN'
                        ? 'bg-gradient-to-r from-[#f5d77f] via-[#d4af37] to-[#997b1e] shadow-[0_4px_18px_rgba(212,175,55,0.4)] hover:brightness-110'
                        : 'bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-500 shadow-[0_4px_18px_rgba(6,182,212,0.4)] hover:brightness-110'
                    }`}
                  >
                    {savingRole ? (
                      <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Kinukumpirma ang Role...</>
                    ) : (
                      <>Kumpirmahin bilang {selectedRole} & Pumasok sa ISM <ArrowRight size={16} /></>
                    )}
                  </button>
                </motion.div>
              )}

              {/* ── Step 4: Done ── */}
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
                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 size={32} className="text-emerald-400" />
                    </div>
                  </motion.div>
                  <div>
                    <h2 className="text-white font-bold text-xl">Account Configured!</h2>
                    <div className="inline-block px-3 py-1 rounded-full bg-white/06 border border-white/10 text-xs font-mono font-semibold text-skeuo-gold mt-2">
                      Role: {selectedRole}
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      Pumapasok na sa iyong {selectedRole} Dashboard...
                    </p>
                  </div>
                  <div className="flex justify-center pt-2">
                    <span className="w-5 h-5 border-2 border-skeuo-gold/30 border-t-skeuo-gold rounded-full animate-spin" />
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
