import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInAnonymously, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    login: () => Promise<User>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    login: async () => { throw new Error('AuthContext not initialized'); },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
            setLoading(true);
            if (currentFirebaseUser) {
                setUser(currentFirebaseUser);
                try {
                    const idTokenResult = await currentFirebaseUser.getIdTokenResult();
                    setIsAdmin(!!idTokenResult.claims.admin);
                } catch (e) {
                    console.error("Error checking admin status:", e);
                    setIsAdmin(false);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
            }
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
        <AuthContext.Provider value={{ user, loading, isAdmin, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

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
    }
};
