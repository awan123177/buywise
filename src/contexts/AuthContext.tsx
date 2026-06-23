import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

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
      const storedUser = localStorage.getItem('google_user');
      const storedToken = localStorage.getItem('google_access_token');
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

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setAccessToken(tokenResponse.access_token);
        localStorage.setItem('google_access_token', tokenResponse.access_token);
        
        // Fetch user profile info
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        
        const data = await res.json();
        
        const loggedUser: BuyWiseUser = {
           uid: data.sub,
           email: data.email,
           displayName: data.name,
           photoURL: data.picture,
           isPremium: false,
        };
        
        setUser(loggedUser);
        localStorage.setItem('google_user', JSON.stringify(loggedUser));
      } catch (e) {
        console.error("Failed to fetch Google profile:", e);
      }
    },
    onError: error => console.error('Login Failed:', error)
  });

  const signInWithGoogle = () => {
     login();
  };

  const logout = () => {
    googleLogout();
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('google_user');
    localStorage.removeItem('google_access_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

