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
  deleteAccountAndData: () => Promise<void>;
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
  deleteAccountAndData: async () => {},
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
       if (token) {
         localStorage.setItem('buywise_token', token);
         localStorage.setItem('buywise_user_session', JSON.stringify({ user: sessionUser, token }));
       }
       const baseUser: BuyWiseUser = {
          uid: sessionUser.id,
          email: sessionUser.email || null,
          displayName: sessionUser.user_metadata?.full_name || sessionUser.displayName || null,
          photoURL: sessionUser.user_metadata?.avatar_url || sessionUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sessionUser.email}`,
          isPremium: false,
       };
       setUser(baseUser);
       
       // Configure Axios default headers for server-trusted session tracking
       if (token) {
         api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
         api.defaults.headers.common["x-session-token"] = token;
         try {
           document.cookie = `buywise_session=${encodeURIComponent(token)}; path=/; max-age=${14 * 24 * 60 * 60}; SameSite=Lax`;
         } catch (e) {}
       }
       delete api.defaults.headers.common["x-user-id"];
       delete api.defaults.headers.common["x-user-email"];
       delete api.defaults.headers.common["x-user-name"];

       // Trigger daily check-in streak reward
       triggerDailyCheckIn().catch((err) => {
         console.log("Daily check-in skipped:", err.message);
         if (err.response?.status === 401) {
           window.dispatchEvent(new Event("buywise_unauthorized"));
         }
       });
       
       // Check for premium status dynamically from backend and database!
       const checkPremium = async () => {
         try {
           let hasPremium = false;

           // 1. Primary Authority: BuyWise Backend Gamification / Subscription Profile
           try {
             const res = await fetch('/api/gamification/profile', {
               headers: {
                 ...(token ? { 'Authorization': `Bearer ${token}`, 'x-session-token': token } : {})
               }
             });
             if (res.status === 401) {
               window.dispatchEvent(new Event("buywise_unauthorized"));
               return;
             }
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
        const token = accessToken || localStorage.getItem('buywise_token');
        fetch('/api/gamification/profile', {
          headers: token ? {
            'Authorization': `Bearer ${token}`,
            'x-session-token': token
          } : {}
        }).then(r => r.json()).then(p => {
          if (p?.isPremium) {
            setUser(prev => prev ? { ...prev, isPremium: true } : null);
          }
        }).catch(() => {});
      }
    };
    window.addEventListener('buywisePremiumActivated', handleActivatedEvent);

    const handleUnauthorizedEvent = () => {
      logout();
    };
    window.addEventListener('buywise_unauthorized', handleUnauthorizedEvent);

    let supabaseSubscription: any = null;

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
      supabaseSubscription = subscription;
    } else {
      // Non-Supabase initial state
      const savedSession = localStorage.getItem('buywise_user_session');
      const savedToken = localStorage.getItem('buywise_token');
      const savedUser = localStorage.getItem('mock_user');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed.user && parsed.token) {
            setupUser(parsed.user, parsed.token);
          }
        } catch (e) {}
      } else if (savedUser && savedToken) {
        try {
          setupUser(JSON.parse(savedUser), savedToken);
        } catch (e) {}
      }
      setLoading(false);
    }

    return () => {
      if (supabaseSubscription) {
        try {
          supabaseSubscription.unsubscribe();
        } catch (e) {}
      }
      if (unsubPremiumRef.current) {
        try {
          supabase.removeChannel(unsubPremiumRef.current);
        } catch (e) {}
      }
      if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
      window.removeEventListener('buywisePremiumActivated', handleActivatedEvent);
      window.removeEventListener('buywise_unauthorized', handleUnauthorizedEvent);
    };
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

      // If session returned from registration
      if (data.user && data.token) {
        setupUser(data.user, data.token);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password || '',
      });
      if (error) throw error;
      if (data?.session?.access_token && data?.user) {
        setupUser(data.user, data.session.access_token);
      }
    } else {
      // Server-Authoritative Login: fetch cryptographically signed session token
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed.");
      }
      setupUser(data.user, data.token);
    }
    setLoginOpen(false);
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(authInstance, googleProvider);
      // Retrieve the Firebase ID Token (cryptographically verifiable on the server)
      const token = await result.user.getIdToken();
      
      // Exchange with our server-authoritative Google auth endpoint to get a secure signed session token
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email: result.user.email,
          name: result.user.displayName,
          uid: result.user.uid,
          photo: result.user.photoURL,
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Google authentication failed on server.");
      }

      setupUser(data.sessionUser, data.token);
      setLoginOpen(false);
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
      });
    } catch (e) {}
    if (hasSupabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    localStorage.removeItem('mock_user');
    localStorage.removeItem('buywise_token');
    localStorage.removeItem('buywise_user_session');
    try {
      document.cookie = "buywise_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch (e) {}
    setUser(null);
    setAccessToken(null);
    delete api.defaults.headers.common["Authorization"];
    delete api.defaults.headers.common["x-session-token"];
    delete api.defaults.headers.common["x-user-id"];
    delete api.defaults.headers.common["x-user-email"];
    delete api.defaults.headers.common["x-user-name"];
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
      const token = accessToken || localStorage.getItem('buywise_token');
      const res = await fetch('/api/gamification/profile', {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
          'x-session-token': token
        } : {}
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

  const deleteAccountAndData = async (): Promise<void> => {
    if (!user) throw new Error("Not authenticated");
    const token = accessToken || localStorage.getItem('buywise_token');

    // 1. Call real backend deletion endpoint with server-trusted credential
    const res = await fetch('/api/account/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}`, 'x-session-token': token } : {})
      }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to delete account on server.");
    }

    // 2. Sign out of Supabase if active
    if (hasSupabase) {
      try {
        await supabase.auth.signOut();
      } catch (sbErr) {
        console.warn("Supabase signOut error during deletion:", sbErr);
      }
    }

    // 3. Clear all cached local data
    localStorage.removeItem('mock_user');
    localStorage.removeItem('activeSupportTicketId');
    localStorage.removeItem('guestSupportEmail');
    localStorage.removeItem('buywise_cached_profile');
    localStorage.removeItem('buywise_coins');

    // 4. Reset auth state
    setUser(null);
    setAccessToken(null);
    setLoginOpen(false);

    // 5. Notify global listeners
    window.dispatchEvent(new CustomEvent('buywiseAccountDeleted'));
    window.dispatchEvent(new CustomEvent('buywiseCoinsUpdated', { detail: { coins: 0 } }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, loginOpen, setLoginOpen, openLogin, signIn, signInWithGoogle, signUp, resendVerification, logout, updateAvatar, updateProfile, refreshPremium, deleteAccountAndData }}>
      {children}
    </AuthContext.Provider>
  );
};

