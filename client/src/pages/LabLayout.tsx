import React, { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider, useAuth, storeUserLanguagePreference } from '../core/auth/AuthContext';
import { useLanguage as useGlobalLanguage } from '../../LanguageContext';
import { LanguageProvider as LabLanguageProvider } from '../LanguageContext';

const LabLayoutInner: React.FC = () => {
    const { user, loading, login } = useAuth();
    const { language } = useGlobalLanguage();

    useEffect(() => {
        if (!loading && !user) {
            login().then(newUser => {
                if (newUser) {
                    storeUserLanguagePreference(newUser.uid, language).catch(console.error);
                }
            }).catch(console.error);
        } else if (user) {
            storeUserLanguagePreference(user.uid, language).catch(console.error);
        }
    }, [user, loading, login, language]);

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
