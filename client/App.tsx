import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// Pages
import LandingPage from './pages/LandingPage';
import CVPage from './pages/CVPage';

const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cv" element={<CVPage />} />
        <Route path="/profile" element={<Navigate to="/cv" replace />} />
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