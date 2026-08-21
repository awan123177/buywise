import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { X, Mail, User, ShieldCheck, Lock, Eye, EyeOff, ArrowLeft, Sparkles, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase, hasSupabase } from '../lib/supabase';
import PasswordStrengthMeter from './PasswordStrengthMeter';

type AuthMode = 'email-login' | 'email-signup' | 'forgot-password';

export default function LoginModal() {
  const { loginOpen, setLoginOpen, signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>('email-login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rateLimitCooldown, setRateLimitCooldown] = useState<number>(0);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [devTestMode, setDevTestMode] = useState<boolean>(true); // Safe default for dev environment

  // Debouncing & double-click concurrency lock
  const isSubmittingRef = useRef<boolean>(false);
  const lastSubmitTimeRef = useRef<number>(0);

  // Cooldown countdown timer
  useEffect(() => {
    let interval: any;
    if (rateLimitCooldown > 0) {
      interval = setInterval(() => {
        setRateLimitCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rateLimitCooldown]);

  if (!loginOpen) return null;

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSignUp = mode === 'email-signup';

    // 1. Double click / Rapid submit throttle
    const now = Date.now();
    if (isSubmittingRef.current || now - lastSubmitTimeRef.current < 1200) {
      return;
    }

    if (rateLimitCooldown > 0) {
      toast.error(`Please wait ${rateLimitCooldown}s before retrying.`);
      return;
    }

    if (!email || !password || (isSignUp && !name)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    isSubmittingRef.current = true;
    lastSubmitTimeRef.current = now;
    setLoading(true);
    setRateLimitError(null);

    try {
      if (isSignUp) {
        const result = await signUp(email, password, name, devTestMode);
        toast.success(result.message || `Account created! Check your email to confirm.`);
        setEmail('');
        setPassword('');
        setName('');
        setRateLimitError(null);
        setRateLimitCooldown(0);
      } else {
        await signIn(email, password, false);
        toast.success(`Successfully logged in!`);
        setEmail('');
        setPassword('');
        setName('');
        setRateLimitError(null);
      }
    } catch (error: any) {
      const errMsg = error.message || '';
      const isRateLimit =
        error.status === 429 ||
        error.code === 'RATE_LIMIT_EXCEEDED' ||
        errMsg.toLowerCase().includes('rate limit') ||
        errMsg.toLowerCase().includes('over_email_send_rate_limit') ||
        errMsg.toLowerCase().includes('too many');

      if (isRateLimit) {
        const cooldownSecs = error.retryAfter || 180;
        setRateLimitCooldown(cooldownSecs);
        setRateLimitError("Too many email requests. Please wait a few minutes and try again.");
        toast.error("Too many email requests. Please wait a few minutes and try again.");
      } else {
        toast.error(errMsg || 'Authentication failed');
      }
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }

    const now = Date.now();
    if (isSubmittingRef.current || now - lastSubmitTimeRef.current < 1200) {
      return;
    }

    if (rateLimitCooldown > 0) {
      toast.error(`Please wait ${rateLimitCooldown}s before requesting another reset email.`);
      return;
    }

    isSubmittingRef.current = true;
    lastSubmitTimeRef.current = now;
    setLoading(true);
    setRateLimitError(null);

    try {
      if (hasSupabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (error) throw error;
      } else {
        // Simulate in mock mode
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      toast.success("Password reset email sent! Check your inbox.");
      setMode('email-login');
    } catch (error: any) {
      const errMsg = error.message || '';
      if (error.status === 429 || errMsg.toLowerCase().includes('rate limit')) {
        setRateLimitCooldown(180);
        setRateLimitError("Too many email requests. Please wait a few minutes and try again.");
        toast.error("Too many email requests. Please wait a few minutes and try again.");
      } else {
        toast.error(errMsg || "Failed to send reset password email");
      }
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Successfully logged in with Google!");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  // Pre-generate background floating particles
  const particles = [
    { id: 1, x: 10, y: 80, size: 3, delay: 0, duration: 14 },
    { id: 2, x: 25, y: 60, size: 4, delay: 2, duration: 18 },
    { id: 3, x: 45, y: 90, size: 2, delay: 4, duration: 12 },
    { id: 4, x: 70, y: 75, size: 3, delay: 1, duration: 16 },
    { id: 5, x: 85, y: 40, size: 5, delay: 3, duration: 20 },
    { id: 6, x: 15, y: 25, size: 2, delay: 5, duration: 15 },
    { id: 7, x: 60, y: 15, size: 4, delay: 0.5, duration: 17 },
    { id: 8, x: 90, y: 85, size: 3, delay: 2.5, duration: 13 },
    { id: 9, x: 50, y: 50, size: 2, delay: 1.5, duration: 19 },
    { id: 10, x: 35, y: 30, size: 3.5, delay: 3.5, duration: 16 },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        {/* Immersive Dark Background with Glowing Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Deep blue radial gradient at top-left */}
          <div className="absolute top-10 left-10 w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[130px] animate-pulse" style={{ animationDuration: '10s' }} />
          {/* Deep gold radial gradient at bottom-right */}
          <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-yellow-500/5 blur-[130px] animate-pulse" style={{ animationDuration: '15s', animationDelay: '2s' }} />
          
          {/* Custom Floating Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute bg-blue-400/20 rounded-full blur-[0.5px]"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
              }}
              animate={{
                y: [0, -120, 0],
                x: [0, 20, 0],
                opacity: [0.15, 0.7, 0.15],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Outer container to support smooth vertical scroll on small devices */}
        <div className="relative w-full max-w-md my-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.15 }}
            className="relative w-full overflow-hidden border border-white/10 rounded-[28px] bg-[#0A0A0C]/75 backdrop-blur-3xl p-8 md:p-10 shadow-[0_0_80px_rgba(59,130,246,0.25),inset_0_1px_1px_rgba(255,255,255,0.05)]"
          >
            {/* Top Close Button */}
            <button
              onClick={() => setLoginOpen(false)}
              className="absolute top-5 right-5 p-2 text-gray-400/80 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full border border-white/5 active:scale-95 cursor-pointer z-10"
              title="Close Portal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Logo Shield Emblem at top */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-black/50 border border-white/10 shadow-[0_0_35px_rgba(59,130,246,0.2)] p-1 group">
                {/* Revolving cyber gradient ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 via-yellow-500/10 to-blue-600/30 animate-spin" style={{ animationDuration: '10s' }}></div>
                
                {/* Inner central ring with BuyWise logo structure */}
                <div className="absolute inset-1.5 rounded-full bg-[#070709] border border-white/15 flex items-center justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.15, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-10 h-10 relative cursor-pointer"
                  >
                    <div className="absolute top-0 left-0 w-6 h-6 bg-[#FF3B30] border border-white/5 mix-blend-screen shadow-[0_0_15px_rgba(255,59,48,0.5)] rounded" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-transparent border border-white/20 backdrop-blur-sm rounded" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white z-10 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                  </motion.div>
                </div>
              </div>

              {/* Title Section */}
              <div className="text-center mt-5">
                <h2 className="text-3xl font-extrabold tracking-tight text-white font-display bg-gradient-to-r from-white via-white to-blue-200 bg-clip-text text-transparent">
                  {mode === 'email-login' && 'Sign In'}
                  {mode === 'email-signup' && 'Create Account'}
                  {mode === 'forgot-password' && 'Reset Access'}
                </h2>
                <p className="text-xs text-gray-400 mt-1.5 font-medium">
                  {mode === 'email-login' && 'Welcome back to BuyWise'}
                  {mode === 'email-signup' && 'Join the premium smart shopping network'}
                  {mode === 'forgot-password' && 'Enter email to receive reset link'}
                </p>
              </div>
            </div>

            {/* Main Interactive View Form */}
            <AnimatePresence mode="wait">
              {mode === 'email-login' && (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleSubmitEmail}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within/input:text-blue-400 transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full py-3.5 pl-12 pr-4 text-sm text-white transition-all duration-300 bg-black/50 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder-white/25 group-hover/input:border-white/20 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.6)]"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Password</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within/input:text-blue-400 transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full py-3.5 pl-12 pr-11 text-sm text-white transition-all duration-300 bg-black/50 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder-white/25 group-hover/input:border-white/20 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.6)]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center space-x-2 text-xs text-gray-400 hover:text-gray-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-white/10 bg-black/50 text-blue-500 focus:ring-blue-500/30 focus:ring-offset-0 focus:outline-none cursor-pointer"
                        />
                        <span>Remember Me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot-password')}
                        className="text-xs text-blue-400/90 hover:text-blue-300 hover:underline transition-colors focus:outline-none font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(59,130,246,0.5)" }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center w-full py-4 mt-8 space-x-2.5 font-extrabold text-sm tracking-widest uppercase text-white transition-all bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Secure Login</span>
                      </>
                    )}
                  </motion.button>

                  <div className="mt-6 flex items-center gap-3 before:flex-1 before:h-px before:bg-white/10 after:flex-1 after:h-px after:bg-white/10">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Or continue with</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full mt-4 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-orange-500/50 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 group cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.78 15.75 17.55V20.29H19.32C21.41 18.36 22.56 15.56 22.56 12.25Z" fill="#4285F4"/>
                      <path d="M12 23C14.97 23 17.46 22.02 19.32 20.29L15.75 17.55C14.74 18.23 13.48 18.63 12 18.63C9.13 18.63 6.7 16.69 5.82 14.07H2.15V16.92C3.96 20.52 7.69 23 12 23Z" fill="#34A853"/>
                      <path d="M5.82 14.07C5.59 13.4 5.47 12.71 5.47 12C5.47 11.29 5.59 10.6 5.82 9.93V7.08H2.15C1.41 8.56 1 10.23 1 12C1 13.77 1.41 15.44 2.15 16.92L5.82 14.07Z" fill="#FBBC05"/>
                      <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.03L19.4 3.84C17.45 2.01 14.97 1 12 1C7.69 1 3.96 3.48 2.15 7.08L5.82 9.93C6.7 7.31 9.13 5.38 12 5.38Z" fill="#EA4335"/>
                    </svg>
                    <span className="text-xs font-black uppercase tracking-widest text-white/90 group-hover:text-white transition-colors">Continue with Google</span>
                  </button>
                </motion.form>
              )}

              {mode === 'email-signup' && (
                <motion.form
                  key="signup-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleSubmitEmail}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Display Name</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within/input:text-blue-400 transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Satoshi"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full py-3.5 pl-12 pr-4 text-sm text-white transition-all duration-300 bg-black/50 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder-white/25 group-hover/input:border-white/20 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.6)]"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within/input:text-blue-400 transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full py-3.5 pl-12 pr-4 text-sm text-white transition-all duration-300 bg-black/50 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder-white/25 group-hover/input:border-white/20 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.6)]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Password</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within/input:text-blue-400 transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full py-3.5 pl-12 pr-11 text-sm text-white transition-all duration-300 bg-black/50 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder-white/25 group-hover/input:border-white/20 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.6)]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PasswordStrengthMeter password={password} />
                  </div>

                  {/* Rate Limit Warning Banner */}
                  {rateLimitCooldown > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-2 shadow-[0_4px_16px_rgba(245,158,11,0.15)]"
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-300">
                            {rateLimitError || "Too many email requests. Please wait a few minutes and try again."}
                          </p>
                          <p className="text-[11px] text-amber-200/80 mt-1">
                            Cooldown active: You can retry registration in <strong className="font-mono text-amber-300">{rateLimitCooldown}s</strong>.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Dev Safe Test Mode Indicator */}
                  <div className="flex items-center justify-between p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="text-[11px] text-blue-200 font-medium">Safe Test Mode (Email Limit Bypass)</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={devTestMode}
                        onChange={(e) => setDevTestMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading || rateLimitCooldown > 0}
                    whileHover={rateLimitCooldown === 0 ? { scale: 1.02, boxShadow: "0 0 30px rgba(59,130,246,0.5)" } : {}}
                    whileTap={rateLimitCooldown === 0 ? { scale: 0.98 } : {}}
                    className={`flex items-center justify-center w-full py-4 mt-6 space-x-2.5 font-extrabold text-sm tracking-widest uppercase text-white transition-all rounded-xl cursor-pointer ${
                      rateLimitCooldown > 0
                        ? "bg-amber-900/40 border border-amber-500/40 text-amber-300/80 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
                    }`}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : rateLimitCooldown > 0 ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Wait {rateLimitCooldown}s to Retry</span>
                      </div>
                    ) : rateLimitError ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry Create Account</span>
                      </div>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Create Account</span>
                      </>
                    )}
                  </motion.button>

                  <div className="mt-6 flex items-center gap-3 before:flex-1 before:h-px before:bg-white/10 after:flex-1 after:h-px after:bg-white/10">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Or continue with</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full mt-4 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-orange-500/50 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 group cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.78 15.75 17.55V20.29H19.32C21.41 18.36 22.56 15.56 22.56 12.25Z" fill="#4285F4"/>
                      <path d="M12 23C14.97 23 17.46 22.02 19.32 20.29L15.75 17.55C14.74 18.23 13.48 18.63 12 18.63C9.13 18.63 6.7 16.69 5.82 14.07H2.15V16.92C3.96 20.52 7.69 23 12 23Z" fill="#34A853"/>
                      <path d="M5.82 14.07C5.59 13.4 5.47 12.71 5.47 12C5.47 11.29 5.59 10.6 5.82 9.93V7.08H2.15C1.41 8.56 1 10.23 1 12C1 13.77 1.41 15.44 2.15 16.92L5.82 14.07Z" fill="#FBBC05"/>
                      <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.03L19.4 3.84C17.45 2.01 14.97 1 12 1C7.69 1 3.96 3.48 2.15 7.08L5.82 9.93C6.7 7.31 9.13 5.38 12 5.38Z" fill="#EA4335"/>
                    </svg>
                    <span className="text-xs font-black uppercase tracking-widest text-white/90 group-hover:text-white transition-colors">Continue with Google</span>
                  </button>
                </motion.form>
              )}

              {mode === 'forgot-password' && (
                <motion.form
                  key="forgot-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleForgotPassword}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within/input:text-blue-400 transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full py-3.5 pl-12 pr-4 text-sm text-white transition-all duration-300 bg-black/50 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder-white/25 group-hover/input:border-white/20 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.6)]"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      type="button"
                      onClick={() => setMode('email-login')}
                      className="flex items-center justify-center w-1/3 py-3.5 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white text-gray-400 transition-colors cursor-pointer text-xs font-semibold uppercase tracking-wider"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      <span>Back</span>
                    </button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(59,130,246,0.5)" }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center flex-1 py-3.5 font-bold text-xs tracking-wider uppercase text-white transition-all bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Send Link</span>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer Bottom link to toggle */}
            <div className="mt-8 text-center text-xs text-gray-400">
              {mode === 'email-signup' ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('email-login')}
                    className="text-blue-400 hover:text-blue-300 font-bold transition-colors hover:underline focus:outline-none"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                mode === 'email-login' && (
                  <span>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('email-signup')}
                      className="text-blue-400 hover:text-blue-300 font-bold transition-colors hover:underline focus:outline-none"
                    >
                      Create Account
                    </button>
                  </span>
                )
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
