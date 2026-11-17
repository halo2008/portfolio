import type { Photo } from '../types';

const photo = (name: string, alt: string, width = 1280, height = 853): Photo => ({
    src: `/assets/img/${name}.webp`,
    small: `/assets/img/${name}-500.webp`,
    medium: `/assets/img/${name}-960.webp`,
    alt,
    width,
    height
});

/** Copy of the /nakladka-subiekt-gt/ page (Polish only: Subiekt GT is sold in Poland). */
export const SUBIEKT_PAGE = {
    path: '/nakladka-subiekt-gt/',
    meta: {
        title: 'Nakładka na Subiekt GT: magazyn, transport i KSeF | Konrad Sędkowski',
        description: 'Nakładka na Subiekt GT działająca na serwerze firmy: zamówienia, magazyn z wagami, planowanie transportów i KSeF obok Subiekta, bez zmiany programu. System powstał i działa w Ulamexie.'
    },
    home: 'Strona główna',
    hero: {
        title: 'Nakładka na Subiekt GT dla hurtowni',
        lead: 'Subiekt dalej prowadzi dokumenty, a obok dochodzą zamówienia, magazyn z wagami, transporty i KSeF. Baza stoi na Waszym serwerze. System powstał w Ulamexie, gdzie obsługuje zespół 120 osób.',
        primary: 'Umów bezpłatną rozmowę',
        secondary: 'Zobacz wymagania',
        photo: photo('ai-weighbridge', 'Ciężarówka z naczepą na wadze samochodowej, kamera ANPR na słupie, szlaban i budka wagowa')
    },
    sync: {
        title: 'Jak nakładka pracuje z Subiektem GT',
        lead: 'Zamówienia, kontrahenci i towary przechodzą w obie strony przez Sferę. Zmiany w Subiekcie trafiają do nakładki same, bez eksportów.',
        diagram: {
            layout: 'sync',
            alt: 'Subiekt GT i nakładka ERP wymieniają zamówienia, kontrahentów i towary w obie strony przez Sferę.',
            ground: 'none',
            left: { label: 'Subiekt GT', icon: 'ui:database', meta: 'Sfera', rows: [{ label: 'Zamówienia', meta: 'ZK' }, { label: 'Kontrahenci', meta: '' }, { label: 'Towary', meta: '' }] },
            link: { label: 'W obie strony', icon: 'ui:refresh-cw' },
            right: { label: 'Nakładka ERP', icon: 'ui:warehouse', meta: 'Wasz serwer', rows: [{ label: 'Zamówienia', meta: '' }, { label: 'Kontrahenci', meta: '' }, { label: 'Towary', meta: '' }] }
        }
    },
    modules: {
        title: 'Co dochodzi do Subiekta GT',
        lead: 'Moduły włączamy po kolei, od tego, co zabiera najwięcej ręcznej pracy. Do tego katalog B2B i zamówienia z maili, które korzystają z modelu Gemini w chmurze Google.',
        photo: photo('photo-f192577777', 'Panel dotykowy sterowania zamontowany na stalowej szafie maszyny', 1280, 852),
        items: [
            { title: 'Magazyn i kompletacja', text: 'Przyjęcia, wydania i stany w jednym miejscu.' },
            { title: 'Waga i kamery przy bramie', text: 'Masa i numer auta zapisują się przy dostawie, bez kwitów.' },
            { title: 'Planowanie transportów', text: 'Załadunki, wyjazdy i koszty w jednym widoku.' },
            { title: 'KSeF', text: 'Wysyłka faktur do KSeF prosto z systemu.' }
        ]
    },
    requirements: {
        title: 'Wymagania i pierwsze kroki',
        lead: 'Sprawdzam to na bezpłatnej analizie, zanim cokolwiek wycenię.',
        items: [
            { title: 'Subiekt GT z dodatkiem Sfera', text: 'Synchronizacja korzysta ze Sfery. Subiekt nexo nie jest obsługiwany.' },
            { title: 'Komputer z Windowsem przy Subiekcie', text: 'Na nim działa usługa synchronizacji.' },
            { title: 'Serwer w firmie', text: 'Własny serwer albo maszyna wirtualna, na której działa nakładka.' },
            { title: 'Umowa i licencja', text: 'Umowę i fakturę VAT wystawia letmework.ai sp. z o.o. Wdrożenie i utrzymanie prowadzę osobiście.' }
        ],
        cta: 'Umów bezpłatną analizę',
        photo: photo('photo-f37336988', 'Niebieskie kable sieciowe wpięte w przełącznik w szafie serwerowej', 1280, 720)
    },
    footer: 'Umowy i faktury VAT wystawia letmework.ai sp. z o.o.'
};
