import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { X, Mail, User, ShieldCheck, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginModal() {
  const { loginOpen, setLoginOpen, signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!loginOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
                {isSignUp ? 'Create an Account' : 'Welcome Back'}
              </h2>
              <p className="text-sm text-gray-400">
                {isSignUp ? 'Sign up to get started' : 'Sign in to continue enjoying all features.'}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
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
                    required={isSignUp}
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
              <span>{loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Secure Login')}</span>
            </button>
          </form>
          
          <div className="mt-6 text-sm text-center text-gray-400">
            {isSignUp ? (
              <span>
                Already have an account?{' '}
                <button type="button" onClick={() => setIsSignUp(false)} className="text-white hover:underline focus:outline-none">
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button type="button" onClick={() => setIsSignUp(true)} className="text-white hover:underline focus:outline-none">
                  Sign Up
                </button>
              </span>
            )}
          </div>

          <p className="mt-6 text-xs text-center text-gray-600">
            By proceeding, you agree to our Terms of Service & Privacy Policy. Secured by Supabase.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
