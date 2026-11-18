/**
 * Where a visitor came from, sent with the enquiry form so a lead from a video or a post can be credited.
 *
 * Read once on page load from `utm_*` / `ref` in the address, or else from the referrer of another site.
 * Kept in memory for this page view; carried across pages (sessionStorage) only after the visitor agreed to
 * statistics in the cookie bar, so nothing is stored on the device without consent.
 */
export interface Attribution {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    landing?: string;
    referrer?: string;
}

const STORAGE_KEY = 'lead-attribution';
const CONSENT_KEY = 'analytics-consent';
const MAX = 200;

let current: Attribution = {};

const clip = (value: string | null | undefined): string | undefined => {
    const text = value?.trim();
    return text ? text.slice(0, MAX) : undefined;
};

const consented = (): boolean => {
    try {
        return localStorage.getItem(CONSENT_KEY) === 'granted';
    } catch {
        return false;
    }
};

const readStored = (): Attribution | null => {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Attribution) : null;
    } catch {
        return null;
    }
};

/** Saves the current attribution for the rest of the visit; call after consent is granted. */
export const persistAttribution = (): void => {
    if (!consented() || !current.source) return;
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
        /* storage blocked: the attribution still goes with a form sent from this page */
    }
};

/** Reads the source of this visit. The first tagged source of the visit wins over later ones. */
export const captureAttribution = (): void => {
    const query = new URLSearchParams(window.location.search);
    const source = clip(query.get('utm_source') ?? query.get('ref'));
    let referrer: string | undefined;
    try {
        const host = document.referrer ? new URL(document.referrer).hostname : '';
        referrer = host && host !== window.location.hostname ? clip(host) : undefined;
    } catch {
        referrer = undefined;
    }
    const landing = clip(window.location.pathname);
    const fresh: Attribution = source
        ? { source, medium: clip(query.get('utm_medium')), campaign: clip(query.get('utm_campaign')), content: clip(query.get('utm_content')), landing, referrer }
        : referrer
            ? { source: referrer, medium: 'referral', landing, referrer }
            : { landing };
    const stored = readStored();
    current = stored?.source ? stored : fresh;
    persistAttribution();
};

/** The attribution to send with a lead, without empty fields. */
export const getAttribution = (): Attribution =>
    Object.fromEntries(Object.entries(current).filter(([, value]) => value)) as Attribution;

/**
 * A link to another page of the site that keeps the source of a tagged visit in the address,
 * so the source reaches the form on the next page without storing anything on the device.
 */
export const withSource = (href: string): string => {
    if (!current.source) return href;
    const params = new URLSearchParams();
    params.set('utm_source', current.source);
    for (const [key, value] of [['utm_medium', current.medium], ['utm_campaign', current.campaign], ['utm_content', current.content]] as const) {
        if (value) params.set(key, value);
    }
    const [path, hash] = href.split('#');
    return `${path}?${params.toString()}${hash ? `#${hash}` : ''}`;
};
