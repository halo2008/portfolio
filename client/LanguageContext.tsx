import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, PortfolioContent } from './types';
import { TRANSLATIONS } from './constants';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  content: PortfolioContent;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const value = {
    language,
    setLanguage,
    content: TRANSLATIONS[language]
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