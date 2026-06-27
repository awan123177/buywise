import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { api, triggerDailyCheckIn } from '../lib/api';

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
  signInWithPhone: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  accessToken: null,
  loginOpen: false,
  setLoginOpen: () => {},
  openLogin: () => {},
  signIn: async () => {},
  signInWithPhone: async () => {},
  verifyPhoneOtp: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<BuyWiseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    let unsubPremium: any = null;
    let fallbackInterval: any = null;

    const setupUser = (sessionUser: any, token: string) => {
       setAccessToken(token);
       const baseUser: BuyWiseUser = {
          uid: sessionUser.id,
          email: sessionUser.email || null,
          displayName: sessionUser.user_metadata?.full_name || null,
          photoURL: sessionUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sessionUser.email}`,
          isPremium: false,
       };
       setUser(baseUser);
       
       // Configure Axios default headers for gamification session tracking
       api.defaults.headers.common["x-user-id"] = sessionUser.id;
       api.defaults.headers.common["x-user-email"] = sessionUser.email || "";
       api.defaults.headers.common["x-user-name"] = sessionUser.user_metadata?.full_name || sessionUser.email?.split("@")[0] || "Anonymous User";

       // Trigger daily check-in streak reward
       triggerDailyCheckIn().catch((err) => console.log("Daily check-in skipped:", err.message));
       
       // Check Supabase for premium status dynamically!
       const checkPremium = async () => {
         try {
           const { data } = await supabase.from('premium_requests')
             .select('status')
             .eq('userId', sessionUser.id)
             .eq('status', 'approved');
           
           let hasPremium = false;
           if (data && data.length > 0) {
             hasPremium = true;
           }
           
           setUser(prev => {
             if (prev && prev.isPremium !== hasPremium) {
               return { ...prev, isPremium: hasPremium };
             }
             return prev;
           });
         } catch (e) {
           console.log("Premium check failed:", e);
         }
       };
       
       checkPremium();
       
       // Fallback interval polling in case Supabase real-time is not enabled for the table
       if (fallbackInterval) clearInterval(fallbackInterval);
       fallbackInterval = setInterval(checkPremium, 15000);
       
       if (unsubPremium) supabase.removeChannel(unsubPremium);
       const channelId = Math.random().toString(36).substring(2, 15);
       unsubPremium = supabase.channel(`premium_updates_${sessionUser.id}_${channelId}`)
         .on('postgres_changes', { event: '*', schema: 'public', table: 'premium_requests' }, () => {
            checkPremium();
         })
         .subscribe();
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setupUser(session.user, session.access_token);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setupUser(session.user, session.access_token);
      } else {
        if(unsubPremium) supabase.removeChannel(unsubPremium);
        if (fallbackInterval) clearInterval(fallbackInterval);
        
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
       if(unsubPremium) supabase.removeChannel(unsubPremium);
       if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, []);

  const openLogin = () => setLoginOpen(true);

  const signIn = async (email: string, password?: string, isSignUp?: boolean, name?: string) => {
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password: password || '',
        options: {
          data: { full_name: name || '' }
        }
      });
      if (error) throw error;
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: password || '',
      });
      if (error) throw error;
    }
    setLoginOpen(false);
  };

  const signInWithPhone = async (phone: string) => {
    // Note: If real Supabase SMS is not configured, this might fail. We will fallback to email mock if needed.
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    if (error) {
       // If SMS fails due to config, mock auth via email
       console.warn("SMS OTP Failed, falling back to mock auth", error);
       if (error.message.includes("sms provider")) {
         throw new Error("SMS_NOT_CONFIGURED");
       }
       throw error;
    }
  };

  const verifyPhoneOtp = async (phone: string, token: string, name?: string) => {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });
    if (error) throw error;

    // Update name if provided and we just signed up
    if (name) {
       await supabase.auth.updateUser({
         data: { full_name: name }
       });
    }
    setLoginOpen(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, loginOpen, setLoginOpen, openLogin, signIn, signInWithPhone, verifyPhoneOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
