import React, { createContext, useContext, useEffect, useState } from 'react';

export interface BuyWiseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isPremium?: boolean;
  premiumPlan?: string;
  premiumStatus?: string;
}

interface AuthContextType {
  user: BuyWiseUser | null;
  loading: boolean;
  accessToken: string | null;
  signInWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  accessToken: null,
  signInWithGoogle: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<BuyWiseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('demo_user');
      const storedToken = localStorage.getItem('demo_access_token');
      if (storedUser) {
         setUser(JSON.parse(storedUser));
      }
      if (storedToken) {
         setAccessToken(storedToken);
      }
    } catch (e) {
       console.error("Failed to parse user from local storage");
    }
    setLoading(false);
  }, []);

  const signInWithGoogle = () => {
    const demoUser: BuyWiseUser = {
       uid: 'demo_user_123',
       email: 'demo@buywise.app',
       displayName: 'Demo User',
       photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
       isPremium: true,
    };
    const token = 'fake_demo_token_xyz';
    
    setUser(demoUser);
    setAccessToken(token);
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    localStorage.setItem('demo_access_token', token);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('demo_user');
    localStorage.removeItem('demo_access_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

