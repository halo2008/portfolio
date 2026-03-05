import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// Pages
import HomePage from './pages/HomePage';

// Lazy loaded Lab routes
const LabLayout = React.lazy(() => import('./pages/LabLayout'));
const Lab = React.lazy(() => import('./pages/Lab'));

// Lazy loaded Admin
const AdminPageLazy = React.lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminPage })));

// Auth provider for admin route
const AuthProvider = React.lazy(() => import('./core/auth/AuthContext').then(m => ({ default: m.AuthProvider })));

const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Lab Route with AuthProvider isolation */}
        <Route path="/lab" element={
          <Suspense fallback={<div className="min-h-screen bg-darker flex items-center justify-center text-primary">Loading...</div>}>
            <LabLayout />
          </Suspense>
        }>
          <Route index element={<Lab />} />
        </Route>

        {/* Admin Route */}
        <Route path="/admin" element={
          <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-500">Loading...</div>}>
            <AuthProvider>
              <AdminPageLazy />
            </AuthProvider>
          </Suspense>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={import.meta.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "PLACEHOLDER_SITE_KEY"}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: "head",
        nonce: undefined,
      }}
    >
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </GoogleReCaptchaProvider>
  );
}

export default App;
