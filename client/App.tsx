import React from 'react';
import Hero from './components/Hero';
import Resume from './components/Resume';
import Projects from './components/Projects';
import Services from './components/Services';
import Contact from './components/Contact';
import AIChat from './components/AIChat';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { Globe } from 'lucide-react';

const AppContent: React.FC = () => {
  const { content, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pl' : 'en');
  };

  return (
    <div className="relative bg-darker min-h-screen text-slate-300 selection:bg-primary selection:text-darker overflow-x-hidden">

      {/* Global Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Moving Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-secondary/5 rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[40vw] h-[40vw] bg-blue-900/5 rounded-full blur-[100px] animate-pulse-slow" />

        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* Global Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-darker/80 border-b border-slate-800 h-16 flex items-center justify-between px-6 lg:px-24 transition-all duration-300">
        <span className="font-mono font-bold text-xl text-white tracking-tighter">ks-infra<span className="text-primary">.dev</span></span>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <a href="#home" className="hover:text-primary transition-colors">{content.nav.home}</a>
            <a href="#resume" className="hover:text-primary transition-colors">{content.nav.resume}</a>
            <a href="#projects" className="hover:text-primary transition-colors">{content.nav.projects}</a>
            <a href="#services" className="hover:text-primary transition-colors">{content.nav.services}</a>
            <a href="#contact" className="hover:text-primary transition-colors">{content.nav.contact}</a>
          </div>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-white hover:border-primary transition-all hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          >
            <Globe size={14} className="text-primary" />
            <span>{language === 'en' ? 'EN' : 'PL'}</span>
          </button>
        </div>
      </nav>

      <main className="relative z-10">
        <Hero />
        <Resume />
        <Projects />
        <Services />
        <Contact />
      </main>

      <footer className="relative z-10 py-8 text-center text-slate-600 text-sm border-t border-slate-900 bg-darker/80 backdrop-blur-sm">
        <p>&copy; {new Date().getFullYear()} {content.footer}</p>
      </footer>

      <AIChat />
    </div>
  );
};

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

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