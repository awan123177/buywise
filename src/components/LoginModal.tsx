import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { X, Mail, User, ShieldCheck, Lock, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase, hasSupabase } from '../lib/supabase';

type AuthMode = 'email-login' | 'email-signup' | 'forgot-password';

export default function LoginModal() {
  const { loginOpen, setLoginOpen, signIn } = useAuth();
  const [mode, setMode] = useState<AuthMode>('email-login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!loginOpen) return null;

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSignUp = mode === 'email-signup';
    if (!email || !password || (isSignUp && !name)) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setLoading(true);
    try {
      await signIn(email, password, isSignUp, name);
      toast.success(isSignUp ? `Account created! Check your email to confirm.` : `Successfully logged in!`);
      setEmail('');
      setPassword('');
      setName('');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    setLoading(true);
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
      toast.error(error.message || "Failed to send reset password email");
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
                        <Sparkles className="w-4 h-4" />
                        <span>Create Account</span>
                      </>
                    )}
                  </motion.button>
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
