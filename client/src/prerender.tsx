import React from 'react';
import { renderToString } from 'react-dom/server';
import { LanguageProvider } from './LanguageContext';
import HomePage from './pages/HomePage';
import SubiektPage from './pages/SubiektPage';
import type { Language } from './types';

/** The home page as static HTML, so crawlers that do not run JavaScript read the same text as visitors. */
export const render = (language: Language): string =>
    renderToString(
        <LanguageProvider initialLanguage={language}>
            <HomePage />
        </LanguageProvider>
    );

/** The Polish-only Subiekt GT page. */
export const renderSubiekt = (): string =>
    renderToString(
        <LanguageProvider initialLanguage="pl">
            <SubiektPage />
        </LanguageProvider>
    );

export { SUBIEKT_PAGE } from './data/subiekt';
