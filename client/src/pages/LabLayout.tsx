import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../../core/auth/AuthContext';

const LabLayout: React.FC = () => {
    return (
        <AuthProvider>
            <Suspense fallback={<div className="min-h-screen bg-darker flex items-center justify-center text-primary">Loading Lab...</div>}>
                <Outlet />
            </Suspense>
        </AuthProvider>
    );
};

export default LabLayout;
