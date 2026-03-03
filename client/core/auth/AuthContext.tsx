import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInAnonymously, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.error('Anonymous auth failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Store user's browser language preference in Firestore ephemeral_users collection
 * Called after successful authentication
 */
export const storeUserLanguagePreference = async (
  userId: string, 
  language: 'en' | 'pl'
): Promise<void> => {
  try {
    const userRef = doc(db, 'ephemeral_users', userId);
    await setDoc(userRef, {
      uid: userId,
      preferredLanguage: language,
      role: 'demo',
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000), // 24h from now
    }, { merge: true });
  } catch (error) {
    console.error('Failed to store language preference:', error);
    // Don't throw - this is a non-critical operation
  }
};
