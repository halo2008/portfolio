import React, { Suspense, useEffect, useRef } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth, storeUserLanguagePreference } from '../core/auth/AuthContext';
import { useLanguage as useGlobalLanguage } from '../LanguageContext';
import { LanguageProvider as LabLanguageProvider } from '../LanguageContext';

const LabLayoutInner: React.FC = () => {
    const { user, loading, login, loginWithToken } = useAuth();
    const { language } = useGlobalLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const tokenHandled = useRef(false);

    useEffect(() => {
        if (loading) return;

        const sessionToken = searchParams.get('sessionToken');

        if (sessionToken && !tokenHandled.current) {
            tokenHandled.current = true;
            // Sign out current user first (if any) to switch to shared session
            loginWithToken(sessionToken).then(newUser => {
                // Remove token from URL for cleanliness
                const cleaned = new URLSearchParams(searchParams);
                cleaned.delete('sessionToken');
                setSearchParams(cleaned, { replace: true });
                if (newUser) {
                    storeUserLanguagePreference(newUser.uid, language).catch(console.error);
                }
            }).catch(err => {
                console.error('Session token login failed, falling back to anonymous:', err);
                const cleaned = new URLSearchParams(searchParams);
                cleaned.delete('sessionToken');
                setSearchParams(cleaned, { replace: true });
                if (!user) {
                    login().then(newUser => {
                        if (newUser) storeUserLanguagePreference(newUser.uid, language).catch(console.error);
                    }).catch(console.error);
                }
            });
            return; // Wait for token login to complete
        } else if (!user) {
            login().then(newUser => {
                if (newUser) {
                    storeUserLanguagePreference(newUser.uid, language).catch(console.error);
                }
            }).catch(console.error);
        } else {
            storeUserLanguagePreference(user.uid, language).catch(console.error);
        }
    }, [user, loading, login, loginWithToken, language, searchParams, setSearchParams]);

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
