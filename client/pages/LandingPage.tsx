import React from 'react';
import ProductHero from '../components/ProductHero';
import HowItWorks from '../components/HowItWorks';
import SecuritySection from '../components/SecuritySection';
import CreatorSection from '../components/CreatorSection';
import AIChat from '../components/AIChat';
import { useLanguage } from '../LanguageContext';
import { Globe } from 'lucide-react';

const LandingPage: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'pl' : 'en');
    };

    return (
        <div className="bg-darker min-h-screen text-slate-300 selection:bg-primary selection:text-darker overflow-x-hidden">

            {/* Simple Product Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-darker/80 border-b border-slate-800 h-16 flex items-center justify-between px-6 lg:px-24">
                <span className="font-mono font-bold text-xl text-white tracking-tighter">ks-infra<span className="text-primary">.dev</span></span>

                <div className="flex items-center gap-6">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        <Globe size={14} />
                        {language === 'en' ? 'EN' : 'PL'}
                    </button>
                    <a href="/cv" className="text-sm font-medium text-slate-400 hover:text-primary transition-colors">
                        Example Link to CV
                    </a>
                </div>
            </nav>

            <main>
                <ProductHero />
                <HowItWorks />
                <SecuritySection />
                <CreatorSection />
            </main>

            <footer className="py-8 text-center text-slate-600 text-sm bg-darker border-t border-slate-900">
                <p>&copy; {new Date().getFullYear()} ks-infra.dev</p>
                <div className="mt-2">
                    <a href="/cv" className="hover:text-primary transition-colors">Looking for a DevOps Consultant? Check my CV</a>
                </div>
            </footer>

            <AIChat />
        </div>
    );
};

export default LandingPage;
