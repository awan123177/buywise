import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export interface BuyWiseUser extends User {
  isPremium?: boolean;
  premiumPlan?: string;
  premiumStatus?: string;
}

interface AuthContextType {
  user: BuyWiseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<BuyWiseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubPremium: () => void;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Listen for premium status from premium_requests
        const reqRef = doc(db, 'premium_requests', firebaseUser.uid);
        unsubPremium = onSnapshot(reqRef, (docSnap) => {
           if (docSnap.exists()) {
              const data = docSnap.data();
              setUser(prev => prev ? ({ 
                 ...prev, 
                 isPremium: data.status === 'approved',
                 premiumPlan: data.plan,
                 premiumStatus: data.status
              } as BuyWiseUser) : prev);
           } else {
              setUser(prev => prev ? ({ ...prev, isPremium: false } as BuyWiseUser) : prev);
           }
        });
      } else {
        setUser(null);
        if (unsubPremium) unsubPremium();
      }
      setLoading(false);
    });

    return () => {
       unsubscribe();
       if (unsubPremium) unsubPremium();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
