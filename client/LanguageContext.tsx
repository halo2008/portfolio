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
    console.log('LanguageContext: Initial check. Saved:', saved);
    if (!saved) {
      console.log('LanguageContext: No language saved. Fetching country...');
      fetch('https://get.geojs.io/v1/ip/country.json')
        .then((res) => res.json())
        .then((data) => {
          console.log('LanguageContext: API response:', data);
          if (data.country === 'PL') {
            console.log('LanguageContext: Setting language to PL');
            setLanguage('pl');
          } else {
            console.log('LanguageContext: Country is not PL, staying EN');
          }
        })
        .catch((err) => console.error('Geo-IP check failed:', err));
    } else {
      console.log('LanguageContext: Language already saved:', saved);
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