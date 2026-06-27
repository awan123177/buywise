import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { X, Mail, User, ShieldCheck, Lock, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

type AuthMode = 'email-login' | 'email-signup' | 'phone-login' | 'phone-verify';

export default function LoginModal() {
  const { loginOpen, setLoginOpen, signIn, signInWithPhone, verifyPhoneOtp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('phone-login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return toast.error("Please enter your phone number");
    setLoading(true);
    try {
      await signInWithPhone(phone);
      toast.success("OTP Sent! Please check your messages.");
      setMode('phone-verify');
    } catch (error: any) {
      if (error.message === "SMS_NOT_CONFIGURED") {
        toast.error("SMS auth not configured in backend, falling back to email");
        setMode('email-login');
      } else {
        toast.error(error.message || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter the OTP");
    setLoading(true);
    try {
      await verifyPhoneOtp(phone, otp, name);
      toast.success("Securely verified!");
      setOtp('');
      setPhone('');
      setName('');
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md p-8 overflow-hidden border bg-[#0A0A0A] border-white/10 rounded-3xl"
        >
          {/* Header section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                {mode === 'email-signup' ? 'Create an Account' : mode === 'phone-verify' ? 'Verify OTP' : 'Welcome Back'}
              </h2>
              <p className="text-sm text-gray-400">
                {mode === 'email-signup' ? 'Sign up to get started' : mode === 'phone-verify' ? `Sent to ${phone}` : 'Sign in to continue enjoying all features.'}
              </p>
            </div>
            <button
              onClick={() => setLoginOpen(false)}
              className="p-2 text-gray-400 transition-colors rounded-full hover:bg-white/10 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          {mode === 'phone-login' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Phone Number (with country code)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full py-3 pl-10 pr-4 text-white transition-colors bg-white/5 border border-white/10 rounded-xl focus:border-[#FF3B30] focus:outline-none focus:ring-1 focus:ring-[#FF3B30]/50"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center w-full py-3.5 mt-6 space-x-2 font-medium text-white transition-opacity bg-[#FF3B30] rounded-xl hover:opacity-90 disabled:opacity-50"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
              </button>
              
              <div className="mt-4 text-center">
                <button type="button" onClick={() => setMode('email-login')} className="text-sm text-gray-400 hover:text-white transition-colors">
                  Or login with Email
                </button>
              </div>
            </form>
          )}

          {mode === 'phone-verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Enter OTP</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full py-3 pl-10 pr-4 text-white transition-colors bg-white/5 border border-white/10 rounded-xl focus:border-[#FF3B30] focus:outline-none focus:ring-1 focus:ring-[#FF3B30]/50 tracking-widest text-lg"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Your Name (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Satoshi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-3 pl-10 pr-4 text-white transition-colors bg-white/5 border border-white/10 rounded-xl focus:border-[#FF3B30] focus:outline-none focus:ring-1 focus:ring-[#FF3B30]/50"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center w-full py-3.5 mt-6 space-x-2 font-medium text-white transition-opacity bg-[#FF3B30] rounded-xl hover:opacity-90 disabled:opacity-50"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
              </button>
              <div className="mt-4 text-center">
                <button type="button" onClick={() => setMode('phone-login')} className="text-sm text-gray-400 hover:text-white transition-colors">
                  Back to Phone Login
                </button>
              </div>
            </form>
          )}

          {(mode === 'email-login' || mode === 'email-signup') && (
            <form onSubmit={handleSubmitEmail} className="space-y-4">
              {mode === 'email-signup' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Display Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Satoshi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full py-3 pl-10 pr-4 text-white transition-colors bg-white/5 border border-white/10 rounded-xl focus:border-[#FF3B30] focus:outline-none focus:ring-1 focus:ring-[#FF3B30]/50"
                      required={mode === 'email-signup'}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-3 pl-10 pr-4 text-white transition-colors bg-white/5 border border-white/10 rounded-xl focus:border-[#FF3B30] focus:outline-none focus:ring-1 focus:ring-[#FF3B30]/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-3 pl-10 pr-4 text-white transition-colors bg-white/5 border border-white/10 rounded-xl focus:border-[#FF3B30] focus:outline-none focus:ring-1 focus:ring-[#FF3B30]/50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center w-full py-3.5 mt-6 space-x-2 font-medium text-white transition-opacity bg-[#FF3B30] rounded-xl hover:opacity-90 disabled:opacity-50"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{loading ? 'Processing...' : (mode === 'email-signup' ? 'Sign Up' : 'Secure Login')}</span>
              </button>
            </form>
          )}
          
          {(mode === 'email-login' || mode === 'email-signup') && (
            <div className="mt-6 space-y-3 text-sm text-center text-gray-400">
              <div>
                {mode === 'email-signup' ? (
                  <span>
                    Already have an account?{' '}
                    <button type="button" onClick={() => setMode('email-login')} className="text-white hover:underline focus:outline-none">
                      Sign In
                    </button>
                  </span>
                ) : (
                  <span>
                    Don't have an account?{' '}
                    <button type="button" onClick={() => setMode('email-signup')} className="text-white hover:underline focus:outline-none">
                      Sign Up
                    </button>
                  </span>
                )}
              </div>
              <div>
                <button type="button" onClick={() => setMode('phone-login')} className="text-sm text-gray-400 hover:text-white transition-colors">
                  Or login with Phone Number
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
