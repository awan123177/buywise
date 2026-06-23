import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

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
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<BuyWiseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAccessToken(session.access_token);
        setUser({
          uid: session.user.id,
          email: session.user.email || null,
          displayName: session.user.user_metadata?.full_name || null,
          photoURL: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`,
          isPremium: false,
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAccessToken(session.access_token);
        setUser({
          uid: session.user.id,
          email: session.user.email || null,
          displayName: session.user.user_metadata?.full_name || null,
          photoURL: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`,
          isPremium: false,
        });
      } else {
        setUser(null);
        setAccessToken(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, loginOpen, setLoginOpen, openLogin, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
