import React, { useEffect, useState } from 'react';
import AIChat from '../components/AIChat';
import CookieConsent from '../components/CookieConsent';
import LeadForm from '../components/LeadForm';
import OrderInbox from '../components/OrderInbox';
import WorkPreview, { PREVIEW_KEYS, hasPreview } from '../components/WorkPreview';
import { ErpAssistant, ErpPicking, ErpPipeline, ErpTracking } from '../components/mockups/ErpMockups';
import { ERP_MOCKUP } from '../components/mockups/erpMockupData';
import TrackerPhone from '../components/mockups/TrackerMockups';
import { TRACKER_MOCKUP } from '../components/mockups/trackerMockupData';
import { useLanguage } from '../LanguageContext';
import { withSource } from '../lib/attribution';
import { Photo, PhotoRow } from '../types';

const KIT_SCRIPTS = ['/assets/system.js', '/assets/motion/motion.js', '/assets/layout/layout.js'];
const SERVICE_IDS = ['automation', 'assistant', 'cloud', 'devices'];
const HALF_SIZES = '(max-width: 1023px) 100vw, 640px';
const SERVICE_SIZES = '(max-width: 639px) 300vw, (max-width: 1023px) 100vw, 640px';
const PHONE_TWO_SCREENS = { '--hm': 2 } as React.CSSProperties;
const TWO_SCREENS = { '--h': 2, '--hm': 2 } as React.CSSProperties;
const INBOX_FIT = { '--fit-max': '600px' } as React.CSSProperties;
const ERP_SCREENS = [ErpPipeline, ErpPicking, ErpTracking, ErpAssistant];
const PHONE_SCREENS = ['lemyConfirm', 'calls'] as const;
const THIRD_SIZES = '(max-width: 1023px) 100vw, (min-width: 1280px) 720px, 420px';

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

const Arrow: React.FC = () => (
    <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
        <path className="m-arrow__stem" d="M1 6h8" />
        <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
    </svg>
);

const Logo: React.FC<{ name: string }> = ({ name }) => (
    <a className="nav__logo" href="#top">
        <span className="mark mark--initial" aria-hidden="true">{name.charAt(0)}</span>{name}
    </a>
);

const Picture: React.FC<{ photo: Photo; sizes: string; eager?: boolean; hidden?: boolean; className?: string; peekFor?: string }> = ({ photo, sizes, eager, hidden, className = 'frame__img', peekFor }) => (
    <img
        className={className}
        src={photo.src}
        srcSet={`${photo.small} 500w, ${photo.medium} 960w, ${photo.src} ${photo.width}w`}
        sizes={sizes}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        loading={eager ? undefined : 'lazy'}
        decoding="async"
        hidden={hidden}
        data-peek-for={peekFor}
        data-source="stand-in"
        data-subject="stand-in"
    />
);

const WorkCards: React.FC<{ items: PhotoRow[]; offset: number; open: string; onOpen: (index: number) => void }> = ({ items, offset, open, onOpen }) => (
    <div className="grid">
        {items.map((item, index) => {
            const key = PREVIEW_KEYS[offset + index];
            const clickable = hasPreview(key);
            return (
                <article className={clickable ? 'card card--row card--preview span-4' : 'card card--row m-nolift span-4'} key={item.title} onClick={clickable ? () => onOpen(offset + index) : undefined}>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    {clickable && <button className="link card__open" type="button" aria-haspopup="dialog" onClick={event => { event.stopPropagation(); onOpen(offset + index); }}>{open}<Arrow /></button>}
                    <div className="panel"><Picture photo={item.photo} sizes={THIRD_SIZES} /></div>
                </article>
            );
        })}
    </div>
);

const selectTopic = (topic: string) => {
    const select = document.getElementById('lead-service') as HTMLSelectElement | null;
    if (select) select.value = topic;
};

const HomePage: React.FC = () => {
    const { content, language } = useLanguage();
    const { home, contact, name } = content;
    const { nav, hero, services, product, statement, process, work, faq, about, call, close, footer } = home;
    const [preview, setPreview] = useState<number | null>(null);
    const mailto = `mailto:${contact.emailUrl}`;
    const linkedin = `https://${contact.linkedinUrl}`;

    useEffect(() => {
        document.documentElement.lang = language;
        document.title = home.meta.title;
        loadKit();
    }, [language, home.meta.title]);

    return (
        <>
            <header className="nav">
                <div className="wrap nav__bar">
                    <a className="skip-link" href="#top">{home.meta.skip}</a>
                    <Logo name={name} />
                    <nav className="nav__links" aria-label={home.meta.navLabel}>
                        <div className="nav__item">
                            <a className="nav__link" href="#services">
                                {nav.services}{' '}
                                <svg className="chev" viewBox="0 0 12 12" aria-hidden="true">
                                    <path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </a>
                            <div className="nav__menu">
                                <div className="wrap grid">
                                    {nav.groups.map((group, groupIndex) => (
                                        <div className="menu-col span-4" key={group}>
                                            <p className="t-label">{group}</p>
                                            {services.items.slice(groupIndex * 2, groupIndex * 2 + 2).map((item, index) => (
                                                <a href={`#${SERVICE_IDS[groupIndex * 2 + index]}`} key={item.title}>
                                                    {item.title}<span>{nav.hints[groupIndex * 2 + index]}</span>
                                                </a>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="nav__item"><a className="nav__link" href="#work">{nav.work}</a></div>
                        <div className="nav__item"><a className="nav__link" href="#about">{nav.about}</a></div>
                        <div className="nav__item"><a className="nav__link" href="#questions">{nav.questions}</a></div>
                        <div className="nav__item"><a className="nav__link" href="#erp">{nav.product}</a></div>
                    </nav>
                    <div className="nav__actions">
                        <a className="nav__link" href={nav.language.code === 'en' ? '/en/' : '/'} lang={nav.language.code} hrefLang={nav.language.code}>{nav.language.label}</a>
                        <a className="btn btn--primary" href="#call">{hero.primary}</a>
                    </div>
                    <button className="nav__toggle" type="button" aria-expanded="false" aria-label={home.meta.menu}>
                        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                            <path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </header>

            <main id="top">
                <section className="hero hero--split bg-dots" data-enter="" aria-labelledby="hero-h">
                    <div className="wrap">
                        <div className="hero-text grid hero__grid">
                            <div className="hero__text span-5">
                                <h1 id="hero-h">{hero.title}</h1>
                                <p className="hero__lead">{hero.lead}</p>
                                <div className="btn-row">
                                    <a className="btn btn--primary" href="#call">{hero.primary}</a>
                                    <a className="btn btn--secondary" href="#work">{hero.secondary}</a>
                                </div>
                            </div>
                            <div className="hero__media hero__inbox span-6 start-7">
                                <div className="stage stage--fade-b">
                                    <div className="at-corner fit" style={INBOX_FIT}>
                                        <OrderInbox inbox={hero.inbox} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section ground-surface" id="services" style={PHONE_TWO_SCREENS} aria-labelledby="services-h">
                    <div className="wrap">
                        <div className="section-head">
                            <h2 id="services-h">{services.title}</h2>
                            <p>{services.lead}</p>
                        </div>
                        <div className="grid grid--top fill" data-peek="">
                            <ul className="rows span-6">
                                {services.items.map((item, index) => (
                                    <li key={item.title} id={SERVICE_IDS[index]} data-peek-to={SERVICE_IDS[index]} tabIndex={0}>
                                        <span className="rows__name">{item.title}</span>
                                        <p>{item.text}</p>
                                    </li>
                                ))}
                            </ul>
                            <div className="frame frame--photo frame--fill span-6 start-7">
                                {services.items.map((item, index) => (
                                    <Picture key={item.title} photo={item.photo} sizes={SERVICE_SIZES} eager hidden={index > 0} peekFor={SERVICE_IDS[index]} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section ground-surface" id="work" style={PHONE_TWO_SCREENS} aria-labelledby="work-h">
                    <div className="wrap">
                        <div className="section-head">
                            <h2 id="work-h">{work.title}</h2>
                            <p>{work.lead}</p>
                        </div>
                        <WorkCards items={work.items.slice(0, 3)} offset={0} open={work.open} onOpen={setPreview} />
                    </div>
                </section>

                <section className="section ground-surface" id="work-apps" style={PHONE_TWO_SCREENS} aria-labelledby="work-apps-h">
                    <div className="wrap">
                        <div className="section-head">
                            <h2 id="work-apps-h">{work.appsTitle}</h2>
                        </div>
                        <WorkCards items={work.items.slice(3)} offset={3} open={work.open} onOpen={setPreview} />
                    </div>
                </section>

                <section className="section statement" id="experience" aria-label={statement.label}>
                    <div className="wrap">
                        <p className="t-label">{statement.label}</p>
                        <p className="statement__text">{statement.before}<strong>{statement.strong}</strong>{statement.after}</p>
                        <div className="facts grid" data-moment="counter-rolls">
                            {statement.facts.map(fact => (
                                <div className="span-4" key={fact.value}>
                                    <p className="t-stat">{fact.value}</p>
                                    <p>{fact.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="section" id="about" aria-labelledby="about-h">
                    <div className="wrap grid grid--top">
                        <div className="span-6">
                            <div className="section-head">
                                <h2 id="about-h">{about.title}</h2>
                                {about.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                            </div>
                            <div className="btn-row">
                                <a className="link" href={linkedin} target="_blank" rel="noopener noreferrer">{contact.buttons.linkedin}</a>
                                <a className="link" href={contact.githubUrl} target="_blank" rel="noopener noreferrer">{contact.buttons.github}</a>
                            </div>
                        </div>
                        <figure className="develop span-6 start-7">
                            <img src={content.hero.profileImage} alt={about.portraitAlt} width={862} height={1024} loading="lazy" data-source="client" data-subject="portrait" />
                        </figure>
                    </div>
                </section>

                <section className="section" id="erp" style={TWO_SCREENS} aria-labelledby="erp-h">
                    <div className="wrap">
                        <div className="erp-head">
                            <div className="section-head">
                                <h2 id="erp-h">{product.title}</h2>
                                <p>{product.lead}</p>
                                <a className="link" href={withSource('/nakladka-subiekt-gt/')}>{product.subiekt}</a>
                            </div>
                            <div className="tabs" role="tablist" aria-label={product.title}>
                                {product.tabs.map((tab, index) => (
                                    <button className="tab" type="button" role="tab" id={`erp-tab-${index}`} aria-controls={`erp-screen-${index}`} aria-selected={index === 0} key={tab}>{tab}</button>
                                ))}
                            </div>
                        </div>
                        {ERP_SCREENS.map((Screen, index) => (
                            <div className="erp-screen" role="tabpanel" id={`erp-screen-${index}`} aria-labelledby={`erp-tab-${index}`} hidden={index > 0} key={index}>
                                <Screen data={ERP_MOCKUP[language]} />
                            </div>
                        ))}
                        <div className="erp-mobile grid grid--top">
                            <div className="span-6">
                                <h3>{product.trackerTitle}</h3>
                                <p>{product.trackerText}</p>
                                <div className="btn-row">
                                    <a className="btn btn--primary" href="#call" onClick={() => selectTopic(product.topic)}>{product.cta}</a>
                                </div>
                            </div>
                            {PHONE_SCREENS.map(screen => (
                                <div className="erp-phone span-3" key={screen}>
                                    <TrackerPhone screen={screen} data={TRACKER_MOCKUP[language]} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="section" id="questions" aria-labelledby="questions-h">
                    <div className="wrap grid grid--top">
                        <div className="span-6">
                            <div className="section-head">
                                <h2 id="questions-h">{faq.title}</h2>
                            </div>
                            <a className="link" href={mailto}>{faq.link}</a>
                        </div>
                        <div className="faq span-6 start-7">
                            {faq.items.map(item => (
                                <div className="faq__item" key={item.question}>
                                    <h3>{item.question}</h3>
                                    <p>{item.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="section" id="call" style={PHONE_TWO_SCREENS} aria-labelledby="call-h">
                    <div className="wrap grid grid--top">
                        <div className="span-6">
                            <div className="section-head">
                                <h2 id="call-h">{call.title}</h2>
                                <p>{call.lead}</p>
                            </div>
                            <p className="t-label">{process.title}</p>
                            <ol className="steps">
                                {process.steps.map((step, index) => (
                                    <li key={step.title}>
                                        <span className="step-num">{index + 1}</span>
                                        <p><b>{step.title}.</b> {step.text}</p>
                                    </li>
                                ))}
                            </ol>
                            <a className="link" href={mailto}>{contact.emailUrl}</a>
                        </div>
                        <div className="lead-form span-6 start-7">
                            <LeadForm />
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer closing footer--dark ground-inverse" id="contact">
                <div className="wrap">
                    <div className="grid footer__top">
                        <div className="span-4 footer__brand">
                            <h2 className="footer__mark">{name}</h2>
                            <p className="footer__lede">{footer.lede}</p>
                        </div>
                        <div className="span-2 footer__col">
                            <h3 className="footer__heading">{footer.columns[0]}</h3>
                            <ul>
                                <li><a href="#services">{nav.services}</a></li>
                                <li><a href="#work">{nav.work}</a></li>
                                <li><a href={withSource('/nakladka-subiekt-gt/')}>{product.subiekt}</a></li>
                            </ul>
                        </div>
                        <div className="span-2 footer__col">
                            <h3 className="footer__heading">{footer.columns[1]}</h3>
                            <ul>
                                <li><a href="#questions">{nav.questions}</a></li>
                                <li><a href="#about">{nav.about}</a></li>
                            </ul>
                        </div>
                        <div className="span-2 footer__col">
                            <h3 className="footer__heading">{footer.columns[2]}</h3>
                            <ul>
                                <li><a href={linkedin} target="_blank" rel="noopener noreferrer">{contact.buttons.linkedin}</a></li>
                                <li><a href={contact.githubUrl} target="_blank" rel="noopener noreferrer">{contact.buttons.github}</a></li>
                            </ul>
                        </div>
                        <div className="span-2 footer__col">
                            <h3 className="footer__heading">{footer.columns[3]}</h3>
                            <ul>
                                <li><a href="/lab">{footer.lab}</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer__legal">
                        <span>&copy; {new Date().getFullYear()} {name}</span>
                        <a className="credits" href="/credits.html">{footer.credits}</a>
                    </div>
                </div>
            </footer>

            <WorkPreview
                previewKey={preview === null ? null : PREVIEW_KEYS[preview]}
                title={preview === null ? '' : work.items[preview].title}
                closeLabel={work.close}
                language={language}
                onClose={() => setPreview(null)}
            />
            <AIChat />
            <CookieConsent />
        </>
    );
};

export default HomePage;
