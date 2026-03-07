import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInAnonymously, signInWithCustomToken, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    login: () => Promise<User>;
    loginWithToken: (token: string) => Promise<User>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    login: async () => { throw new Error('AuthContext not initialized'); },
    loginWithToken: async () => { throw new Error('AuthContext not initialized'); },
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

    const loginWithToken = async (token: string) => {
        try {
            const result = await signInWithCustomToken(auth, token);
            return result.user;
        } catch (error) {
            console.error('Custom token auth failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        await firebaseSignOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, login, loginWithToken, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const storeUserLanguagePreference = async (
    userId: string,
    language: 'en' | 'pl'
): Promise<void> => {
    try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        await fetch('/api/lab/language', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept-Language': language,
            },
            body: JSON.stringify({ language }),
        });
    } catch (error) {
        console.error('Failed to store language preference:', error);
    }
};
