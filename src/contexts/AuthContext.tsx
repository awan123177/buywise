import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, hasSupabase } from '../lib/supabase';
import { api, triggerDailyCheckIn } from '../lib/api';
import { authInstance, googleProvider } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export interface BuyWiseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isPremium?: boolean;
}

interface AuthContextType {
  user: BuyWiseUser | null;
  loading: boolean;
  accessToken: string | null;
  loginOpen: boolean;
  setLoginOpen: (open: boolean) => void;
  openLogin: () => void;
  signIn: (email: string, password?: string, isSignUp?: boolean, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password?: string, name?: string, isDevTestMode?: boolean) => Promise<{ success: boolean; message: string; isDevTest?: boolean }>;
  resendVerification: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateAvatar: (url: string) => Promise<void>;
  updateProfile: (data: { password?: string; name?: string }) => Promise<void>;
  refreshPremium: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  accessToken: null,
  loginOpen: false,
  setLoginOpen: () => {},
  openLogin: () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signUp: async () => ({ success: false, message: '' }),
  resendVerification: async () => ({ success: false, message: '' }),
  logout: async () => {},
  updateAvatar: async () => {},
  updateProfile: async () => {},
  refreshPremium: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<BuyWiseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  
  const unsubPremiumRef = React.useRef<any>(null);
  const fallbackIntervalRef = React.useRef<any>(null);

  const setupUser = (sessionUser: any, token: string) => {
       // Fire and forget profile sync
       if (hasSupabase) {
         (async () => {
           try {
             const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', sessionUser.id).single();
             if (!existingProfile) {
                await supabase.from('profiles').insert({
                   id: sessionUser.id,
                   email: sessionUser.email,
                   full_name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0],
                   avatar_url: sessionUser.user_metadata?.avatar_url || sessionUser.user_metadata?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sessionUser.email}`,
                   premium: false,
                   buywise_coins: 0,
                   created_at: new Date().toISOString(),
                   last_login: new Date().toISOString()
                });
             } else {
                await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', sessionUser.id);
             }
           } catch(e) { console.log(e); }
         })();
       }
       setAccessToken(token);
       const baseUser: BuyWiseUser = {
          uid: sessionUser.id,
          email: sessionUser.email || null,
          displayName: sessionUser.user_metadata?.full_name || sessionUser.displayName || null,
          photoURL: sessionUser.user_metadata?.avatar_url || sessionUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sessionUser.email}`,
          isPremium: false,
       };
       setUser(baseUser);
       
       // Configure Axios default headers for gamification session tracking
       api.defaults.headers.common["x-user-id"] = sessionUser.id;
       api.defaults.headers.common["x-user-email"] = sessionUser.email || "";
       api.defaults.headers.common["x-user-name"] = sessionUser.user_metadata?.full_name || sessionUser.displayName || sessionUser.email?.split("@")[0] || "Anonymous User";

       // Trigger daily check-in streak reward
       triggerDailyCheckIn().catch((err) => console.log("Daily check-in skipped:", err.message));
       
       // Check for premium status dynamically from backend and database!
       const checkPremium = async () => {
         try {
           let hasPremium = false;

           // 1. Primary Authority: BuyWise Backend Gamification / Subscription Profile
           try {
             const res = await fetch('/api/gamification/profile', {
               headers: {
                 'x-user-id': sessionUser.id,
                 'x-user-email': sessionUser.email || '',
                 'x-user-name': sessionUser.user_metadata?.full_name || sessionUser.displayName || sessionUser.email?.split('@')[0] || 'User'
               }
             });
             if (res.ok) {
               const profileData = await res.json();
               if (profileData) {
                 if (profileData.isPremium) {
                   if (profileData.premiumExpiry) {
                     const expiryTime = new Date(profileData.premiumExpiry).getTime();
                     if (isNaN(expiryTime) || expiryTime > Date.now()) {
                       hasPremium = true;
                     }
                   } else {
                     hasPremium = true;
                   }
                 }
               }
             }
           } catch (apiErr) {
             console.warn("Backend profile check error:", apiErr);
           }

           // 2. Secondary check in Supabase (if available)
           if (hasSupabase && !hasPremium) {
             try {
               const { data } = await supabase.from('premium_requests')
                 .select('status')
                 .eq('userId', sessionUser.id)
                 .eq('status', 'approved');
               
               if (data && data.length > 0) {
                 hasPremium = true;
               }

               const { data: prof } = await supabase.from('profiles')
                 .select('premium')
                 .eq('id', sessionUser.id)
                 .single();
               if (prof?.premium) {
                 hasPremium = true;
               }
             } catch (supErr) {
               // Non-blocking
             }
           }
           
           setUser(prev => {
             if (prev && prev.isPremium !== hasPremium) {
               return { ...prev, isPremium: hasPremium };
             }
             return prev;
           });
           return hasPremium;
         } catch (e) {
           console.log("Premium check failed:", e);
           return false;
         }
       };
       
       checkPremium();
       
       // Fallback interval polling for realtime sync
       if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
       fallbackIntervalRef.current = setInterval(checkPremium, 15000);
       
       if (hasSupabase) {
         if (unsubPremiumRef.current) supabase.removeChannel(unsubPremiumRef.current);
         const channelId = Math.random().toString(36).substring(2, 15);
         unsubPremiumRef.current = supabase.channel(`premium_updates_${sessionUser.id}_${channelId}`)
           .on('postgres_changes', { event: '*', schema: 'public', table: 'premium_requests' }, () => {
              checkPremium();
           })
           .subscribe();
       }
    };

  useEffect(() => {
    

    

    const handleActivatedEvent = () => {
      if (user) {
        fetch('/api/gamification/profile', {
          headers: {
            'x-user-id': user.uid,
            'x-user-email': user.email || '',
            'x-user-name': user.displayName || 'User'
          }
        }).then(r => r.json()).then(p => {
          if (p?.isPremium) {
            setUser(prev => prev ? { ...prev, isPremium: true } : null);
          }
        }).catch(() => {});
      }
    };
    window.addEventListener('buywisePremiumActivated', handleActivatedEvent);

    if (hasSupabase) {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setupUser(session.user, session.access_token);
        }
        setLoading(false);
      }).catch(() => setLoading(false));

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setupUser(session.user, session.access_token);
        } else {
          if(unsubPremiumRef.current) supabase.removeChannel(unsubPremiumRef.current);
          if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
          
          // Clear headers upon logout
          delete api.defaults.headers.common["x-user-id"];
          delete api.defaults.headers.common["x-user-email"];
          delete api.defaults.headers.common["x-user-name"];
          
          setUser(null);
          setAccessToken(null);
        }
        setLoading(false);
      });

      return () => {
         subscription.unsubscribe();
         if(unsubPremiumRef.current) supabase.removeChannel(unsubPremiumRef.current);
         if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
      };
    } else {
      // Mock auth initial state
      const savedUser = localStorage.getItem('mock_user');
      if (savedUser) {
        setupUser(JSON.parse(savedUser), 'mock_token');
      }
      setLoading(false);
    }
  }, []);

  const openLogin = () => setLoginOpen(true);

  const signUp = async (
    email: string,
    password?: string,
    name?: string,
    isDevTestMode?: boolean
  ): Promise<{ success: boolean; message: string; isDevTest?: boolean }> => {
    if (!email || !email.includes('@')) {
      throw new Error("Please enter a valid email address.");
    }
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          name: name?.trim() || '',
          isDevTestMode
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 429 || data.code?.includes('RATE_LIMIT') || data.code === 'EMAIL_RATE_LIMIT_EXCEEDED') {
        const errorObj: any = new Error(data.error || "Too many email requests. Please wait a few minutes and try again.");
        errorObj.status = 429;
        errorObj.code = data.code || 'RATE_LIMIT_EXCEEDED';
        errorObj.retryAfter = data.retryAfter || data.cooldownSeconds || 180;
        throw errorObj;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Registration failed. Please try again.");
      }

      // If development test mode or session returned
      if (data.isDevTest && data.user) {
        setupUser(data.user, 'dev_test_token_' + Date.now());
        setLoginOpen(false);
      }

      return {
        success: true,
        message: data.message || "Account created! Check your email to confirm your account.",
        isDevTest: data.isDevTest
      };

    } catch (err: any) {
      // Direct client-side Supabase fallback only if backend API endpoint was unreachable
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) && hasSupabase) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: { data: { full_name: name || '' } }
          });
          if (error) {
            if (error.status === 429 || error.message?.toLowerCase().includes('rate limit') || error.message?.toLowerCase().includes('over_email_send_rate_limit')) {
              const rateError: any = new Error("Too many email requests. Please wait a few minutes and try again.");
              rateError.status = 429;
              rateError.code = 'RATE_LIMIT_EXCEEDED';
              rateError.retryAfter = 180;
              throw rateError;
            }
            throw error;
          }
          return {
            success: true,
            message: "Account created! Check your email to confirm your account."
          };
        } catch (supErr: any) {
          throw supErr;
        }
      }
      throw err;
    }
  };

  const resendVerification = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!email || !email.includes('@')) {
      throw new Error("Please enter a valid email address.");
    }

    const response = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() })
    });

    const data = await response.json().catch(() => ({}));
    if (response.status === 429 || data.code?.includes('RATE_LIMIT')) {
      const errorObj: any = new Error(data.error || "Too many email requests. Please wait a few minutes and try again.");
      errorObj.status = 429;
      errorObj.code = data.code || 'RATE_LIMIT_EXCEEDED';
      errorObj.retryAfter = data.retryAfter || 180;
      throw errorObj;
    }

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to resend verification email.");
    }

    return { success: true, message: data.message || "Verification email sent! Check your inbox." };
  };

  const signIn = async (email: string, password?: string, isSignUp?: boolean, name?: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (isSignUp) {
      const result = await signUp(normalizedEmail, password, name);
      return;
    }

    if (hasSupabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password || '',
      });
      if (error) throw error;
    } else {
      // Mock auth flow
      const mockUser = {
        id: 'mock-uuid-' + Date.now(),
        email: normalizedEmail,
        displayName: name || normalizedEmail.split('@')[0],
        user_metadata: {
          full_name: name || normalizedEmail.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedEmail}`
        }
      };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setAccessToken('mock_token');
      setUser({
        uid: mockUser.id,
        email: mockUser.email,
        displayName: mockUser.displayName,
        photoURL: mockUser.user_metadata.avatar_url,
        isPremium: false
      });
      api.defaults.headers.common["x-user-id"] = mockUser.id;
      api.defaults.headers.common["x-user-email"] = mockUser.email;
      api.defaults.headers.common["x-user-name"] = mockUser.displayName;
    }
    setLoginOpen(false);
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(authInstance, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken || await result.user.getIdToken();
      
      const sessionUser = {
        id: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        user_metadata: {
          full_name: result.user.displayName,
          avatar_url: result.user.photoURL,
        }
      };

      setupUser(sessionUser, token);
      setLoginOpen(false);
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (hasSupabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('mock_user');
      setUser(null);
      setAccessToken(null);
      delete api.defaults.headers.common["x-user-id"];
      delete api.defaults.headers.common["x-user-email"];
      delete api.defaults.headers.common["x-user-name"];
    }
  };

  const updateAvatar = async (url: string) => {
    if (!user) return;
    
    if (hasSupabase) {
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: url }
      });
      if (!error) {
        setUser({ ...user, photoURL: url });
      }
    } else {
      // Mock auth flow
      const mockUserStr = localStorage.getItem('mock_user');
      if (mockUserStr) {
        const mockUser = JSON.parse(mockUserStr);
        mockUser.user_metadata = mockUser.user_metadata || {};
        mockUser.user_metadata.avatar_url = url;
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
      }
      setUser({ ...user, photoURL: url });
    }
  };

  const updateProfile = async (data: { password?: string; name?: string }) => {
    if (!user) throw new Error("Not authenticated");
    
    if (hasSupabase) {
      const updates: any = {};
      if (data.password) updates.password = data.password;
      if (data.name !== undefined) {
        updates.data = { full_name: data.name };
      }
      
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          displayName: data.name !== undefined ? data.name : prev.displayName,
        };
      });
    } else {
      // Mock auth flow
      const mockUserStr = localStorage.getItem('mock_user');
      if (mockUserStr) {
        const mockUser = JSON.parse(mockUserStr);
        if (data.name !== undefined) {
          mockUser.displayName = data.name;
          mockUser.user_metadata = mockUser.user_metadata || {};
          mockUser.user_metadata.full_name = data.name;
        }
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
      }
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          displayName: data.name !== undefined ? data.name : prev.displayName,
        };
      });
    }
  };

  const refreshPremium = async (): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch('/api/gamification/profile', {
        headers: {
          'x-user-id': user.uid,
          'x-user-email': user.email || '',
          'x-user-name': user.displayName || user.email?.split('@')[0] || 'User'
        }
      });
      if (res.ok) {
        const profile = await res.json();
        let isPrem = false;
        if (profile?.isPremium) {
          if (profile.premiumExpiry) {
            const expiryTime = new Date(profile.premiumExpiry).getTime();
            if (isNaN(expiryTime) || expiryTime > Date.now()) {
              isPrem = true;
            }
          } else {
            isPrem = true;
          }
        }
        setUser(prev => prev ? { ...prev, isPremium: isPrem } : null);
        return isPrem;
      }
    } catch (e) {
      console.error("refreshPremium error:", e);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, loginOpen, setLoginOpen, openLogin, signIn, signInWithGoogle, signUp, resendVerification, logout, updateAvatar, updateProfile, refreshPremium }}>
      {children}
    </AuthContext.Provider>
  );
};

