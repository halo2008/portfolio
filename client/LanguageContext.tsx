import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language, PortfolioContent } from './types';
import { PORTFOLIO_DATA } from './data/portfolio';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  content: PortfolioContent;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'pl') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (!saved) {
      fetch('https://api.country.is')
        .then((res) => res.json())
        .then((data) => {
          if (data.country === 'PL') {
            setLanguage('pl');
          }
        })
        .catch((err) => console.error('Geo-IP check failed:', err));
    }
  }, []);

  const value = {
    language,
    setLanguage,
    content: PORTFOLIO_DATA[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};