import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { persistAttribution } from '../lib/attribution';

const STORAGE_KEY = 'analytics-consent';

type Decision = 'granted' | 'denied';

const readDecision = (): Decision | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'granted' || stored === 'denied' ? stored : null;
    } catch {
        return null;
    }
};

const persistDecision = (decision: Decision): boolean => {
    try {
        localStorage.setItem(STORAGE_KEY, decision);
        return true;
    } catch {
        return false;
    }
};

const applyDecision = (decision: Decision) =>
    window.gtag?.('consent', 'update', { analytics_storage: decision });

const CookieConsent: React.FC = () => {
    const { consent } = useLanguage().content.home;
    const [decision, setDecision] = useState<Decision | null>(readDecision);
    const barRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (decision) applyDecision(decision);
    }, [decision]);

    useEffect(() => {
        const bar = barRef.current;
        if (!bar) return;
        const root = document.documentElement;
        const observer = new ResizeObserver(() =>
            root.style.setProperty('--bar', getComputedStyle(bar).position === 'fixed' ? `${bar.offsetHeight}px` : '0px'));
        observer.observe(bar);
        return () => { observer.disconnect(); root.style.removeProperty('--bar'); };
    }, [decision]);

    if (decision) return null;

    const decide = (next: Decision) => {
        persistDecision(next);
        if (next === 'granted') persistAttribution();
        setDecision(next);
    };

    return (
        <aside className="consent" ref={barRef} aria-label={consent.label}>
            <div className="wrap">
                <p>{consent.text}</p>
                <div className="btn-row">
                    <button className="btn btn--secondary" type="button" onClick={() => decide('denied')}>{consent.reject}</button>
                    <button className="btn btn--secondary" type="button" onClick={() => decide('granted')}>{consent.accept}</button>
                </div>
            </div>
        </aside>
    );
};

export default CookieConsent;
