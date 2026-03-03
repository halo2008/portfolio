import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';
import { AuthProvider } from './core/auth/AuthContext';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// Pages
import HomePage from './pages/HomePage';
import Lab from './src/pages/Lab';
import LabChat from './src/pages/LabChat';

const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/lab/chat" element={<LabChat />} />
        <Route path="/cv" element={<Navigate to="/" replace />} />
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
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </GoogleReCaptchaProvider>
  );
}

export default App;
