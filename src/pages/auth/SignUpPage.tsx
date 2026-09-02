import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, User, Lock, ArrowLeft, ShieldCheck, RefreshCw, Send, Sparkles } from 'lucide-react';
import { useSignUp, useUser } from '@clerk/clerk-react';
import { useAuthStore } from '../../store/useAuthStore';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoInput } from '../../components/skeuomorphic/SkeuoInput';
import { FloatingParticles } from '../../components/common/FloatingParticles';
import { BrandLogo } from '../../components/common/BrandLogo';
import { isClerkConfigured } from '../../services/clerk';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);

  // Clerk hooks (if configured)
  const { isLoaded, signUp, setActive } = isClerkConfigured ? useSignUp() : { isLoaded: true, signUp: null, setActive: null };

  // Form State
  const [step, setStep] = useState<'details' | 'verification'>('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'STAFF'>('STAFF');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP 6-Digit State
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 60-Second Countdown Timer State
  const [timer, setTimer] = useState<number>(60);
  const [isResendDisabled, setIsResendDisabled] = useState<boolean>(true);

  // 60s Countdown Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'verification' && timer > 0) {
      setIsResendDisabled(true);
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Handle Initial Registration (Step 1 -> Step 2)
  const handleStartSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !fullName) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      if (isClerkConfigured && signUp) {
        await signUp.create({
          emailAddress: email,
          password: password,
          firstName: fullName.split(' ')[0] || fullName,
          lastName: fullName.split(' ').slice(1).join(' ') || '',
          unsafeMetadata: { role },
        });

        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      }

      setLoading(false);
      setStep('verification');
      setTimer(60);
      setIsResendDisabled(true);
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    } catch (err: any) {
      setLoading(false);
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Failed to send verification code.';
      setError(msg);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in OTP
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste OTP
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasted)) return;

    const newOtp = pasted.split('');
    setOtp(newOtp);
    inputRefs.current[5]?.focus();
  };

  // Resend Code Action (resets 60s timer)
  const handleResendCode = async () => {
    if (isResendDisabled) return;
    setError('');
    setLoading(true);

    try {
      if (isClerkConfigured && signUp) {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      }
      setLoading(false);
      setTimer(60);
      setIsResendDisabled(true);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setLoading(false);
      setError('Could not resend code. Please try again.');
    }
  };

  // Confirm Verification Code (Step 2 Submit)
  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (isClerkConfigured && signUp && setActive) {
        const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
        if (completeSignUp.status === 'complete') {
          await setActive({ session: completeSignUp.createdSessionId });
          navigate('/admin');
          return;
        }
      }

      // Demo mode fallback authentication
      await new Promise(r => setTimeout(r, 600));
      const username = email.split('@')[0] || 'newuser';
      login(username, password);
      setLoading(false);
      navigate(role === 'ADMIN' ? '/admin' : '/staff');
    } catch (err: any) {
      setLoading(false);
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Invalid verification code. Please check and try again.';
      setError(msg);
    }
  };

  const isOtpComplete = otp.every(d => d !== '');

  return (
    <div className="min-h-screen flex items-center justify-center bg-skeuo-bg relative overflow-hidden p-4">
      {/* Background Animated Particles */}
      <FloatingParticles />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Animated Vault glowing rim */}
        <motion.div
          animate={{ opacity: [0.2, 0.45, 0.2], scale: [0.99, 1.01, 0.99] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-2 rounded-[30px] bg-gradient-to-r from-emerald-500/30 via-amber-400/20 to-emerald-600/30 blur-md pointer-events-none"
        />

        <div className="relative skeuo-panel border border-skeuo-gold/25 rounded-3xl overflow-hidden shadow-skeuo-vault backdrop-blur-xl">
          {/* Animated Sweeping Top Border Light Beam */}
          <motion.span
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-300 to-transparent z-20 pointer-events-none"
          />

          <AnimatePresence mode="wait">
            {step === 'details' ? (
              /* STEP 1: Registration Form */
              <motion.div
                key="step-details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 sm:p-8"
              >
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-3">
                    <BrandLogo size="lg" />
                  </div>
                  <h1 className="font-brand font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-300 tracking-tight">
                    Inventory System Management
                  </h1>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold uppercase tracking-widest mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    CREATE YOUR ACCOUNT
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium text-center">
                    ⚠ {error}
                  </div>
                )}

                <form onSubmit={handleStartSignUp} className="space-y-4">
                  <SkeuoInput
                    label="Full Name"
                    id="su-name"
                    placeholder="e.g. Juan Cruz"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    prefix={<User size={14} />}
                    required
                  />

                  <SkeuoInput
                    label="Email Address"
                    id="su-email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    prefix={<Mail size={14} />}
                    required
                  />

                  <SkeuoInput
                    label="Password"
                    id="su-password"
                    type="password"
                    placeholder="Create strong password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    prefix={<Lock size={14} />}
                    required
                  />

                  <div>
                    <label className="skeuo-label block mb-1.5">Select Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('STAFF')}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          role === 'STAFF'
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-skeuo-led-green'
                            : 'bg-white/04 border-white/08 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        📦 Staff Member
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('ADMIN')}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          role === 'ADMIN'
                            ? 'bg-skeuo-gold/20 border-skeuo-gold/50 text-skeuo-gold shadow-skeuo-led-amber'
                            : 'bg-white/04 border-white/08 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        ⚡ System Admin
                      </button>
                    </div>
                  </div>

                  <SkeuoButton
                    type="submit"
                    variant="gold"
                    size="lg"
                    isLoading={loading}
                    ledStatus="green"
                    className="w-full mt-2"
                  >
                    {loading ? 'Sending Code...' : 'Continue to Verification ➔'}
                  </SkeuoButton>
                </form>

                <div className="mt-6 pt-4 border-t border-white/06 text-center text-xs text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-skeuo-gold font-semibold hover:underline">
                    Sign in
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* STEP 2: Verification Code UI (Matches Pic 2 design) */
              <motion.div
                key="step-verification"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 sm:p-8 text-center"
              >
                {/* Header Graphic Icon matching Pic 2 */}
                <div className="flex justify-center mb-5">
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-b from-[#2a3429] to-[#141a13] border border-emerald-500/40 shadow-[0_12px_28px_rgba(16,185,129,0.25)] flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400"
                    >
                      <Mail size={28} />
                    </motion.div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#161920] flex items-center justify-center text-black font-bold shadow-md">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                </div>

                <h2 className="font-brand font-bold text-2xl text-gray-100 mb-1 tracking-tight">
                  Verification Code
                </h2>
                <p className="text-xs text-gray-400 max-w-xs mx-auto mb-6 leading-relaxed">
                  Please enter the 6-digit verification code sent to{' '}
                  <span className="text-emerald-400 font-semibold">{email || 'your email'}</span>.
                </p>

                {error && (
                  <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
                    ⚠ {error}
                  </div>
                )}

                <form onSubmit={handleConfirmCode} className="space-y-6">
                  {/* 6-Digit OTP Pin Input boxes (Pic 2 Design) */}
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-brand font-bold text-xl sm:text-2xl rounded-xl outline-none transition-all shadow-inner ${
                          digit
                            ? 'bg-emerald-500/15 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                            : 'bg-black/50 border border-white/12 text-gray-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20'
                        }`}
                      />
                    ))}
                    {isOtpComplete && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold ml-1 flex-shrink-0 shadow-md"
                      >
                        <CheckCircle2 size={16} />
                      </motion.div>
                    )}
                  </div>

                  {/* Primary Confirm Button */}
                  <SkeuoButton
                    type="submit"
                    variant="success"
                    size="lg"
                    isLoading={loading}
                    ledStatus="green"
                    className="w-full shadow-lg hover:shadow-skeuo-led-green"
                  >
                    {loading ? 'Verifying Code...' : 'Confirm Code'}
                  </SkeuoButton>

                  {/* Resend Button with 60s Countdown Timer */}
                  <div className="pt-2 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      disabled={isResendDisabled || loading}
                      onClick={handleResendCode}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                        isResendDisabled
                          ? 'bg-white/03 border-white/06 text-gray-500 cursor-not-allowed'
                          : 'bg-sky-500/20 border-sky-500/50 text-sky-300 hover:bg-sky-500/30 hover:border-sky-400 shadow-sm'
                      }`}
                    >
                      <RefreshCw size={13} className={isResendDisabled ? '' : 'animate-spin-slow'} />
                      {isResendDisabled ? (
                        <span>Resend Code in <strong className="font-mono text-amber-400">{timer}s</strong></span>
                      ) : (
                        <span>Resend Code Now</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 mt-1 transition-colors"
                    >
                      <ArrowLeft size={12} /> Change email / details
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card Footer */}
          <div className="px-6 py-3 border-t border-white/06 bg-black/30 text-center text-[10px] text-gray-500">
            Secured by ISM Auth · {isClerkConfigured ? 'Clerk Authentication' : 'Enterprise Sandbox Mode'}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
