import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, hasSupabase } from '../lib/supabase';
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
  logout: () => Promise<void>;
  updateAvatar: (url: string) => Promise<void>;
  updateProfile: (data: { password?: string; name?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  accessToken: null,
  loginOpen: false,
  setLoginOpen: () => {},
  openLogin: () => {},
  signIn: async () => {},
  logout: async () => {},
  updateAvatar: async () => {},
  updateProfile: async () => {},
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
       
       if (!hasSupabase) return; // Don't check premium if no db

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
           if (sessionUser.email === 'mohammdsaeed24@gmail.com') {
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

  const signIn = async (email: string, password?: string, isSignUp?: boolean, name?: string) => {
    if (hasSupabase) {
      if (email === 'mohammdsaeed24@gmail.com' && password === 'awanwarsi') {
        let { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error && error.message.includes("Invalid login credentials")) {
           const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name || 'Mohammad Saeed' } } });
           if (signUpError) throw signUpError;
        } else if (error) {
           throw error;
        }
      } else if (isSignUp) {
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
    } else {
      // Mock auth flow
      const mockUser = {
        id: 'mock-uuid-1234',
        email,
        displayName: name || email.split('@')[0],
        user_metadata: {
          full_name: name || email.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        }
      };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setAccessToken('mock_token');
      setUser({
        uid: mockUser.id,
        email: mockUser.email,
        displayName: mockUser.displayName,
        photoURL: mockUser.user_metadata.avatar_url,
        isPremium: true // Give mock users premium for demo purposes
      });
      api.defaults.headers.common["x-user-id"] = mockUser.id;
      api.defaults.headers.common["x-user-email"] = mockUser.email;
      api.defaults.headers.common["x-user-name"] = mockUser.displayName;
    }
    setLoginOpen(false);
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

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, loginOpen, setLoginOpen, openLogin, signIn, logout, updateAvatar, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

