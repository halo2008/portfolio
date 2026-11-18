import React, { useEffect } from 'react';
import AIChat from '../components/AIChat';
import CookieConsent from '../components/CookieConsent';
import { SUBIEKT_PAGE } from '../data/subiekt';
import { useLanguage } from '../LanguageContext';
import { withSource } from '../lib/attribution';
import type { Photo } from '../types';

const KIT_SCRIPTS = ['/assets/system.js', '/assets/motion/motion.js', '/assets/layout/layout.js'];
const HALF = '(max-width: 1023px) 100vw, 1000px';
// The kit's diagram module is a static file in public/, not part of the bundle.
const DIAGRAM_MODULE = '/assets/diagrams/diagram.js';

const loadKit = () => {
    if (document.querySelector('script[data-kit]')) return;
    KIT_SCRIPTS.forEach(src => {
        const script = document.createElement('script');
        script.type = 'module';
        script.async = false;
        script.src = src;
        script.dataset.kit = '';
        document.body.append(script);
    });
};

const Picture: React.FC<{ photo: Photo; eager?: boolean }> = ({ photo, eager }) => (
    <img
        className="frame__img"
        src={photo.src}
        srcSet={`${photo.small} 500w, ${photo.medium} 960w, ${photo.src} ${photo.width}w`}
        sizes={HALF}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        loading={eager ? undefined : 'lazy'}
        decoding="async"
        data-source="stand-in"
        data-subject="stand-in"
    />
);

const Rows: React.FC<{ items: { title: string; text: string }[] }> = ({ items }) => (
    <ul className="rows">
        {items.map(item => (
            <li key={item.title}>
                <span className="rows__name">{item.title}</span>
                <p>{item.text}</p>
            </li>
        ))}
    </ul>
);

/** /nakladka-subiekt-gt/: the local ERP that works next to Subiekt GT (Polish only). */
const SubiektPage: React.FC = () => {
    const { content } = useLanguage();
    const { name } = content;
    const page = SUBIEKT_PAGE;

    useEffect(() => {
        document.documentElement.lang = 'pl';
        document.title = page.meta.title;
        loadKit();
        import(/* @vite-ignore */ DIAGRAM_MODULE)
            .then((mod: { default: { auto: (root: Document) => void } }) => mod.default.auto(document))
            .catch(() => undefined);
    }, [page.meta.title]);

    return (
        <>
            <header className="nav">
                <div className="wrap nav__bar">
                    <a className="skip-link" href="#top">Przejdź do treści</a>
                    <a className="nav__logo" href={withSource('/')}>
                        <span className="mark mark--initial" aria-hidden="true">{name.charAt(0)}</span>{name}
                    </a>
                    <nav className="nav__links" aria-label="Główna">
                        <div className="nav__item"><a className="nav__link" href={withSource('/')}>{page.home}</a></div>
                        <div className="nav__item"><a className="nav__link" href="#wymagania">{page.hero.secondary}</a></div>
                    </nav>
                    <div className="nav__actions">
                        <a className="btn btn--primary" href={withSource('/#call')}>{page.hero.primary}</a>
                    </div>
                </div>
            </header>

            <main id="top">
                <section className="hero hero--split" data-enter="" aria-labelledby="sub-hero-h">
                    <div className="wrap">
                        <div className="hero-text grid hero__grid">
                            <div className="hero__text span-5">
                                <h1 id="sub-hero-h">{page.hero.title}</h1>
                                <p className="hero__lead">{page.hero.lead}</p>
                                <div className="btn-row">
                                    <a className="btn btn--primary" href={withSource('/#call')}>{page.hero.primary}</a>
                                    <a className="btn btn--secondary" href="#wymagania">{page.hero.secondary}</a>
                                </div>
                            </div>
                            <div className="hero__media span-6 start-7">
                                <div className="frame frame--photo frame--fill"><Picture photo={page.hero.photo} eager /></div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section ground-surface" id="synchronizacja" aria-labelledby="sync-h">
                    <div className="wrap">
                        <div className="section-head">
                            <h2 id="sync-h">{page.sync.title}</h2>
                            <p>{page.sync.lead}</p>
                        </div>
                        <div className="panel"><div className="dg" data-diagram={JSON.stringify(page.sync.diagram)} data-icon-base="/assets/icons" /></div>
                    </div>
                </section>

                <section className="section" id="moduly" aria-labelledby="modules-h">
                    <div className="wrap grid grid--top">
                        <div className="span-6">
                            <div className="section-head">
                                <h2 id="modules-h">{page.modules.title}</h2>
                                <p>{page.modules.lead}</p>
                            </div>
                            <Rows items={page.modules.items} />
                        </div>
                        <div className="frame frame--photo frame--fill span-6 start-7"><Picture photo={page.modules.photo} /></div>
                    </div>
                </section>

                <section className="section ground-surface" id="wymagania" aria-labelledby="req-h">
                    <div className="wrap grid grid--top">
                        <div className="span-6">
                            <div className="section-head">
                                <h2 id="req-h">{page.requirements.title}</h2>
                                <p>{page.requirements.lead}</p>
                            </div>
                            <Rows items={page.requirements.items} />
                            <div className="btn-row">
                                <a className="btn btn--primary" href={withSource('/#call')}>{page.requirements.cta}</a>
                            </div>
                        </div>
                        <div className="frame frame--photo frame--fill span-6 start-7"><Picture photo={page.requirements.photo} /></div>
                    </div>
                </section>
            </main>

            <footer className="footer closing footer--dark ground-inverse" id="contact">
                <div className="wrap">
                    <div className="grid footer__top">
                        <div className="span-6 footer__brand">
                            <h2 className="footer__mark">{name}</h2>
                            <p className="footer__lede">{page.footer}</p>
                        </div>
                    </div>
                    <div className="footer__legal">
                        <span>&copy; {new Date().getFullYear()} {name}</span>
                        <a href={withSource('/')}>{page.home}</a>
                    </div>
                </div>
            </footer>
            <AIChat />
            <CookieConsent />
        </>
    );
};

export default SubiektPage;
