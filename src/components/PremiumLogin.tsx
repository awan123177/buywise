import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Sparkles, ShieldCheck, Mail, User, Phone, Globe, Chrome, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase, hasSupabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function PremiumLogin() {
  const [step, setStep] = useState<'email' | 'otp' | 'complete_profile'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(30);
  const { user, setUser, setAccessToken } = useAuth() as any;
  const navigate = useNavigate();
  
  // Profile completion fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('India');
  const [referral, setReferral] = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: any;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return toast.error("Please enter a valid email address.");
    setIsLoading(true);
    
    try {
      if (hasSupabase) {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
      } else {
        // Mock sending OTP
        await new Promise(r => setTimeout(r, 1000));
      }
      setStep('otp');
      setCountdown(30);
      toast.success("Verification code sent!");
      
      // Auto focus first OTP input after transition
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 500);
      
    } catch (err: any) {
      toast.error(err.message || "Failed to send verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtpAndProceed = async (otpString: string) => {
    setIsLoading(true);
    try {
      let authUser: any = null;
      let token = null;

      if (hasSupabase) {
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: otpString,
          type: 'email'
        });
        if (error) throw error;
        authUser = data.user;
        token = data.session?.access_token;
      } else {
        // Mock verification
        await new Promise(r => setTimeout(r, 1000));
        authUser = { id: 'mock-uuid-' + Date.now(), email, user_metadata: {} };
        token = 'mock_token';
      }

      // We have authenticated successfully.
      // Now check if profile exists
      if (hasSupabase) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', authUser.id).maybeSingle();
        if (!profile || !profile.full_name) {
          // Profile needs completion
          setStep('complete_profile');
          setIsLoading(false);
          return;
        }
      } else {
        // Mock profile check
        const savedMock = localStorage.getItem('mock_user_' + email);
        if (!savedMock) {
          setStep('complete_profile');
          setIsLoading(false);
          return;
        }
      }

      // Profile exists, finish login
      finishLogin(authUser, token);

    } catch (err: any) {
      toast.error(err.message || "Invalid verification code.");
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last char if pasted
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Check if complete
    const completeOtp = newOtp.join('');
    if (completeOtp.length === 6) {
      verifyOtpAndProceed(completeOtp);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      if (pastedData.length === 6) {
        otpRefs.current[5]?.focus();
        verifyOtpAndProceed(pastedData);
      } else {
        otpRefs.current[pastedData.length]?.focus();
      }
    }
  };

  const finishLogin = (authUser: any, token: string | null) => {
    if (!hasSupabase) {
      const mockUser = {
        id: authUser.id,
        email,
        displayName: authUser.user_metadata?.full_name || email.split('@')[0],
        user_metadata: authUser.user_metadata,
        photoURL: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        isPremium: false
      };
      localStorage.setItem('mock_user_' + email, JSON.stringify(mockUser));
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      
      if (typeof setAccessToken === 'function') setAccessToken('mock_token');
      if (typeof setUser === 'function') setUser(mockUser);
    }
    
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#111] shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-white/10 overflow-hidden`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <Sparkles className="h-10 w-10 text-orange-400 rounded-full" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-black text-white uppercase tracking-widest">Welcome to BuyWise.</p>
              <p className="mt-1 text-xs text-white/50 font-mono">Your Premium Experience Begins.</p>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 3000 });
    
    navigate('/');
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (hasSupabase) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
           const { error: upsertError } = await supabase.from('profiles').upsert({
             id: authUser.id,
             email,
             full_name: fullName,
             phone,
             country,
             referral_code: referral || null
           });
           if (upsertError) throw upsertError;
           
           await supabase.auth.updateUser({ data: { full_name: fullName } });
           finishLogin(authUser, null);
        }
      } else {
        await new Promise(r => setTimeout(r, 1000));
        finishLogin({
          id: 'mock-uuid-' + Date.now(),
          email,
          user_metadata: { full_name: fullName }
        }, 'mock_token');
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create profile.");
      setIsLoading(false);
    }
  };

    const handleGoogleLogin = async () => {
    setErrorMsg('');
    if (hasSupabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) {
         setErrorMsg(error.message);
         toast.error(error.message);
      }
    } else {
      setErrorMsg("Google Auth requires Supabase configuration.");
    }
  };

  const InputField = ({ icon: Icon, type, placeholder, value, onChange, ...props }: any) => (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon size={18} className="text-white/30 group-focus-within:text-orange-400 transition-colors" />
      </div>
      <input
        type={type}
        className="block w-full pl-11 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-transparent focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-white/[0.05] transition-all duration-300 peer"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        {...props}
      />
      <label className="absolute left-11 -top-2.5 bg-[#0a0a0a] px-1 text-[10px] font-black tracking-widest uppercase text-white/40 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-white/30 peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-orange-400">
        {placeholder}
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans selection:bg-orange-500/30">
      {/* Animated Luxury Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        
        {/* Left Side: Premium Benefits */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full lg:w-1/2 space-y-10 hidden lg:block"
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
               <Sparkles className="text-orange-400" size={32} />
               <h1 className="text-4xl font-black text-white tracking-tighter uppercase">BuyWise Premium</h1>
            </div>
            <p className="text-white/40 text-lg font-mono leading-relaxed max-w-md">
              Unlock the Future of Smart Shopping. Join an exclusive ecosystem designed for elite consumers.
            </p>
          </div>

          <div className="space-y-6">
            {[
              "Unlimited Price Tracking",
              "Instant Price Alerts",
              "Premium Shopping Deals",
              "AI Shopping Assistant",
              "Early Access Features",
              "Exclusive Rewards",
              "Premium Support"
            ].map((feature, i) => (
              <motion.div 
                key={feature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-4 group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-orange-500/10 group-hover:border-orange-500/30 transition-colors">
                  <ShieldCheck size={16} className="text-white/40 group-hover:text-orange-400 transition-colors" />
                </div>
                <span className="text-white/70 font-medium tracking-wide group-hover:text-white transition-colors">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Auth Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="w-full lg:w-1/2 max-w-md mx-auto"
        >
          <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/20 blur-[60px] rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              
              <AnimatePresence mode="wait">
                {step === 'email' && (
                  <motion.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <div className="text-center mb-10">
                      <h2 className="text-2xl font-black text-white tracking-tight mb-2">Welcome Back</h2>
                      <p className="text-sm text-white/40">Continue your premium experience.</p>
                    </div>

                    
                    <AnimatePresence>
                      {errorMsg && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col items-center justify-center text-center"
                        >
                          <span className="text-red-400 text-xs font-black uppercase tracking-widest mb-1">Authentication Failed</span>
                          <span className="text-red-400/80 text-[10px] font-mono">{errorMsg}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <form onSubmit={handleSendOtp} className="space-y-5">
                      <InputField icon={Mail} type="email" placeholder="Email Address" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                      
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-orange-400 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(249,115,22,0.3)] disabled:opacity-50 overflow-hidden relative group/btn"
                      >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-400/0 via-white/20 to-orange-400/0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                        {isLoading ? <><Loader2 className="animate-spin" size={16} /> SENDING CODE...</> : <>CONTINUE WITH EMAIL <ChevronRight size={16} /></>}
                      </button>
                    </form>

                    <div className="mt-8 flex items-center gap-4 before:flex-1 before:h-px before:bg-white/10 after:flex-1 after:h-px after:bg-white/10">
                      <span className="text-[10px] font-mono text-white/30 uppercase">Or continue with</span>
                    </div>

                    
                    <div className="mt-6">
                      <button onClick={handleGoogleLogin} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-3 transition-colors group/soc">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.78 15.75 17.55V20.29H19.32C21.41 18.36 22.56 15.56 22.56 12.25Z" fill="#4285F4"/>
                          <path d="M12 23C14.97 23 17.46 22.02 19.32 20.29L15.75 17.55C14.74 18.23 13.48 18.63 12 18.63C9.13 18.63 6.7 16.69 5.82 14.07H2.15V16.92C3.96 20.52 7.69 23 12 23Z" fill="#34A853"/>
                          <path d="M5.82 14.07C5.59 13.4 5.47 12.71 5.47 12C5.47 11.29 5.59 10.6 5.82 9.93V7.08H2.15C1.41 8.56 1 10.23 1 12C1 13.77 1.41 15.44 2.15 16.92L5.82 14.07Z" fill="#FBBC05"/>
                          <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.03L19.4 3.84C17.45 2.01 14.97 1 12 1C7.69 1 3.96 3.48 2.15 7.08L5.82 9.93C6.7 7.31 9.13 5.38 12 5.38Z" fill="#EA4335"/>
                        </svg>
                        <span className="text-xs font-black uppercase tracking-widest text-white/70 group-hover/soc:text-white transition-colors">Continue with Google</span>
                      </button>
                      
                      {(import.meta as any).env.DEV && hasSupabase && (
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                           <p className="text-[9px] font-black uppercase text-blue-400 tracking-widest mb-1">Developer Notice</p>
                           <p className="text-[10px] text-blue-400/70 font-mono">
                             Google OAuth Redirect URI:<br/>
                             <span className="text-white user-select-all">{(import.meta as any).env.VITE_SUPABASE_URL}/auth/v1/callback</span>
                           </p>
                        </div>
                      )}
                    </div>

                  </motion.div>
                )}

                {step === 'otp' && (
                  <motion.div key="otp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <button onClick={() => setStep('email')} className="mb-6 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                      <ArrowLeft size={14} /> Back
                    </button>
                    
                    <div className="mb-10">
                      <h2 className="text-2xl font-black text-white tracking-tight mb-2">Check Your Email</h2>
                      <p className="text-sm text-white/40">We sent a 6-digit code to <span className="text-white">{email}</span></p>
                    </div>

                    <div className="space-y-8" onPaste={handlePaste}>
                      <div className="flex gap-2 justify-between">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={el => { otpRefs.current[index] = el; }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-black bg-white/[0.03] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all focus:bg-white/[0.05]"
                          />
                        ))}
                      </div>

                      <div className="flex flex-col items-center gap-4">
                        {isLoading ? (
                          <div className="flex items-center gap-2 text-orange-400 text-xs font-black uppercase tracking-widest">
                            <Loader2 className="animate-spin" size={16} /> Verifying...
                          </div>
                        ) : (
                          <button
                            onClick={handleSendOtp}
                            disabled={countdown > 0}
                            className="text-xs font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors disabled:opacity-50"
                          >
                            {countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend Code'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 'complete_profile' && (
                  <motion.div key="complete_profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <div className="text-center mb-10">
                      <h2 className="text-2xl font-black text-white tracking-tight mb-2">Create Your Premium Account</h2>
                      <p className="text-sm text-white/40">Join thousands of smart shoppers.</p>
                    </div>

                    <form onSubmit={handleCompleteProfile} className="space-y-5">
                      <InputField icon={User} type="text" placeholder="Full Name" value={fullName} onChange={(e: any) => setFullName(e.target.value)} />
                      <div className="flex gap-4">
                        <InputField icon={Globe} type="text" placeholder="Country" value={country} onChange={(e: any) => setCountry(e.target.value)} />
                        <InputField icon={Phone} type="tel" placeholder="Phone (Optional)" value={phone} onChange={(e: any) => setPhone(e.target.value)} required={false} />
                      </div>
                      <InputField icon={Sparkles} type="text" placeholder="Referral Code (Optional)" value={referral} onChange={(e: any) => setReferral(e.target.value)} required={false} />
                      
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-4 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-orange-400 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(249,115,22,0.3)] disabled:opacity-50"
                      >
                        {isLoading ? <><Loader2 className="animate-spin" size={16} /> CREATING...</> : <>COMPLETE SIGN UP <ChevronRight size={16} /></>}
                      </button>
                    </form>
                  </motion.div>
                )}

              </AnimatePresence>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
