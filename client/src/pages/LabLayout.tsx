import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth, storeUserLanguagePreference } from '../core/auth/AuthContext';
import { useLanguage as useGlobalLanguage } from '../LanguageContext';
import { LanguageProvider as LabLanguageProvider } from '../LanguageContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const MAX_AUTH_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Requests a session token from the backend (IP-based deterministic UID).
 * Falls back to signInAnonymously if the endpoint fails.
 */
async function fetchSessionToken(): Promise<string> {
    const res = await fetch(`${API_BASE_URL}/lab/session`, { method: 'POST' });
    if (!res.ok) {
        throw new Error(`Session endpoint returned ${res.status}`);
    }
    const data = await res.json();
    return data.token;
}

const LabLayoutInner: React.FC = () => {
    const { user, loading, login, loginWithToken } = useAuth();
    const { language } = useGlobalLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const tokenHandled = useRef(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const retryCount = useRef(0);

    const attemptLogin = async () => {
        try {
            setAuthError(null);

            // Primary: get IP-based session token from backend
            try {
                const token = await fetchSessionToken();
                const newUser = await loginWithToken(token);
                if (newUser) {
                    storeUserLanguagePreference(newUser.uid, language).catch(console.error);
                }
                return;
            } catch (sessionErr) {
                console.warn('IP-based session failed, falling back to anonymous auth:', sessionErr);
            }

            // Fallback: anonymous auth (may be blocked by ad-blockers on mobile)
            const newUser = await login();
            if (newUser) {
                storeUserLanguagePreference(newUser.uid, language).catch(console.error);
            }
        } catch (err) {
            console.error('Auth failed:', err);
            retryCount.current++;
            if (retryCount.current < MAX_AUTH_RETRIES) {
                setTimeout(attemptLogin, RETRY_DELAY_MS);
            } else {
                setAuthError(
                    language === 'pl'
                        ? 'Nie udało się zainicjalizować sesji. Sprawdź połączenie z internetem i upewnij się, że blokery reklam nie blokują usług Google (identitytoolkit.googleapis.com).'
                        : 'Failed to initialize session. Check your internet connection and make sure ad blockers are not blocking Google services (identitytoolkit.googleapis.com).'
                );
            }
        }
    };

    useEffect(() => {
        if (loading) return;

        const sessionToken = searchParams.get('sessionToken');

        if (sessionToken && !tokenHandled.current) {
            tokenHandled.current = true;
            loginWithToken(sessionToken).then(newUser => {
                const cleaned = new URLSearchParams(searchParams);
                cleaned.delete('sessionToken');
                setSearchParams(cleaned, { replace: true });
                if (newUser) {
                    storeUserLanguagePreference(newUser.uid, language).catch(console.error);
                }
            }).catch(err => {
                console.error('Session token login failed, falling back:', err);
                const cleaned = new URLSearchParams(searchParams);
                cleaned.delete('sessionToken');
                setSearchParams(cleaned, { replace: true });
                if (!user) {
                    retryCount.current = 0;
                    attemptLogin();
                }
            });
            return;
        } else if (!user) {
            retryCount.current = 0;
            attemptLogin();
        } else {
            storeUserLanguagePreference(user.uid, language).catch(console.error);
        }
    }, [user, loading, login, loginWithToken, language, searchParams, setSearchParams]);

    if (authError) {
        return (
            <div className="min-h-screen bg-darker flex items-center justify-center px-4">
                <div className="max-w-md text-center space-y-4">
                    <p className="text-red-400 text-sm">{authError}</p>
                    <button
                        onClick={() => { retryCount.current = 0; attemptLogin(); }}
                        className="px-4 py-2 bg-primary/20 text-primary border border-primary/40 rounded-sm hover:bg-primary/30 transition-colors text-sm"
                    >
                        {language === 'pl' ? 'Spróbuj ponownie' : 'Try again'}
                    </button>
                </div>
            </div>
        );
    }

    if (loading || !user) {
        return <div className="min-h-screen bg-darker flex items-center justify-center text-primary">Authenticating Lab Session...</div>;
    }

    return (
        <Suspense fallback={<div className="min-h-screen bg-darker flex items-center justify-center text-primary">Loading Lab...</div>}>
            <Outlet />
        </Suspense>
    );
};

const LabLayout: React.FC = () => {
    return (
        <AuthProvider>
            <LabLanguageProvider>
                <LabLayoutInner />
            </LabLanguageProvider>
        </AuthProvider>
    );
};

export default LabLayout;
