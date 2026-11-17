export type NavKey = 'hr' | 'calendar' | 'crm' | 'sales' | 'products' | 'logistics' | 'wms' | 'communicator' | 'lemy';
export type ColumnTone = 'info' | 'primary' | 'warning' | 'success' | 'default';
export type CardType = 'OPPORTUNITY' | 'OFFER' | 'ORDER';
export type Temperature = 'HOT' | 'WARM' | 'COLD';
export type QueueStatus = 'progress' | 'neutral' | 'warning';

export interface ErpShellText {
    brand: string;
    nav: Record<NavKey, string>;
    help: string;
    user: { name: string; initials: string };
    menu: string;
}

export interface WindowText {
    label: string;
    crumb: string[];
    tabs: string[];
    activeTab: number;
}

export interface Segment {
    label: string;
    options: string[];
    active: number;
}

export interface PipelineCard {
    type: CardType;
    party: string;
    title: string;
    reference?: string;
    value: string;
    owner: string;
    temperature: Temperature;
    idleDays?: number;
    highlighted?: boolean;
}

export interface PipelineColumn {
    title: string;
    probability: number;
    tone: ColumnTone;
    cards: PipelineCard[];
}

export interface PipelineText extends WindowText {
    title: string;
    pipeline: string;
    create: string;
    refresh: string;
    mentions: string;
    today: { label: string; count: number };
    closed: { label: string; count: number };
    filters: string;
    axis: Segment;
    owner: Segment;
    stats: { label: string; value: string }[];
    types: Record<CardType, string>;
    temperatures: Record<Temperature, string>;
    columns: PipelineColumn[];
}

export interface QueueItem {
    reference: string;
    warehouse: string;
    group: string;
    assignee: string;
    positions: string;
    status: string;
    tone: QueueStatus;
    selected?: boolean;
    suggested?: boolean;
}

export interface PickLine {
    symbol: string;
    name: string;
    location: string;
    lot: string;
    expiration: string;
    quantity: string;
    checked?: boolean;
}

export interface PickProgressRow {
    symbol: string;
    detail: string;
    toPick: number;
    confirmed: number;
}

export interface PickingText extends WindowText {
    title: string;
    subtitle: string;
    warehouse: string;
    queue: {
        title: string;
        search: string;
        claimNext: string;
        suggested: string;
        sections: { title: string; items: QueueItem[] }[];
    };
    task: {
        type: string;
        reference: string;
        status: string;
        meta: { label: string; value: string }[];
    };
    progress: {
        title: string;
        notice: string;
        columns: [string, string, string, string];
        rows: PickProgressRow[];
    };
    lines: {
        columns: [string, string, string, string, string];
        shortPick: string;
        rows: PickLine[];
    };
    summary: string;
    confirmScan: string;
    pack: string;
}

export interface ChatSession {
    title: string;
    time: string;
    active?: boolean;
}

export interface AssistantText extends WindowText {
    newConversation: string;
    search: string;
    history: { group: string; sessions: ChatSession[] }[];
    name: string;
    status: string;
    wizard: string;
    download: string;
    question: { text: string; time: string };
    answer: { intro: string; items: string[]; outro: string; time: string };
    command: { text: string; time: string };
    proposal: {
        intro: string;
        title: string;
        target: string;
        changesLabel: string;
        field: string;
        beforeLabel: string;
        before: string;
        afterLabel: string;
        after: string;
        effectsLabel: string;
        effects: string[];
        confirm: string;
        cancel: string;
        expires: string;
        sends: string;
        time: string;
    };
    placeholder: string;
}

export type MarkerState = 'FRESH' | 'STALE' | 'STOPPED' | 'UNKNOWN';

export interface TrackedDriver {
    name: string;
    short: string;
    age: string;
    details: string;
    state: MarkerState;
    selected?: boolean;
}

export interface TrackingText extends WindowText {
    search: string;
    count: string;
    active: string;
    stale: string;
    drivers: TrackedDriver[];
    details: { label: string; value: string; sub?: string }[];
    showOnMap: string;
    openTrip: string;
    showAll: string;
    legend: { title: string; states: Record<MarkerState, string>; lowAccuracy: string; route: string };
    route: { title: string; distance: string; note: string };
    popup: {
        name: string;
        plate: string;
        subject: string;
        state: string;
        age: string;
        session: string;
        status: string;
        recorded: string;
        accuracy: string;
        speed: string;
    };
}

export interface ErpMockupText {
    shell: ErpShellText;
    pipeline: PipelineText;
    picking: PickingText;
    assistant: AssistantText;
    tracking: TrackingText;
}

const pl: ErpMockupText = {
    shell: {
        brand: 'letmework.ai',
        nav: {
            hr: 'HR',
            calendar: 'Kalendarz',
            crm: 'CRM',
            sales: 'Sprzedaż',
            products: 'Towary i usługi',
            logistics: 'Logistyka',
            wms: 'WMS',
            communicator: 'Komunikator',
            lemy: 'Lemy',
        },
        help: 'Pomoc',
        user: { name: 'Jan Kowalski', initials: 'JK' },
        menu: 'Otwórz menu',
    },
    pipeline: {
        label: 'Podgląd systemu letmework.ai: tablica sprzedaży CRM z szansami w pięciu etapach lejka, wartością, temperaturą i opiekunem każdej szansy oraz paskiem wskaźników.',
        crumb: ['letmework.ai', 'CRM', 'Kanban'],
        tabs: ['Kanban', 'Wszyscy klienci', 'Potencjalni klienci', 'Adresy', 'Kontakty', 'Bufor', 'Raporty'],
        activeTab: 0,
        title: 'Kanban',
        pipeline: 'Lejek B2B',
        create: 'Nowa szansa',
        refresh: 'Odśwież',
        mentions: 'Wzmianki',
        today: { label: 'Na dziś', count: 4 },
        closed: { label: 'Zamknięte', count: 6 },
        filters: 'Filtry',
        axis: { label: 'Kolumny', options: ['Stan akcji', 'Etapy lejka'], active: 1 },
        owner: { label: 'Tablica', options: ['Moja', 'Zespół', 'Pracownik'], active: 1 },
        stats: [
            { label: 'Wartość szans', value: '486 300 zł' },
            { label: 'Skuteczność', value: '38%' },
            { label: 'Zaległe', value: '3' },
            { label: 'Do działania', value: '5' },
        ],
        types: { OPPORTUNITY: 'Szansa', OFFER: 'Oferta', ORDER: 'Zamówienie' },
        temperatures: { HOT: 'Gorący', WARM: 'Ciepły', COLD: 'Zimny' },
        columns: [
            {
                title: 'Do kontaktu',
                probability: 10,
                tone: 'info',
                cards: [
                    { type: 'OPPORTUNITY', party: 'Sklep Testowy', title: 'Wyposażenie nowego punktu', value: '24 000 zł', owner: 'Anna Nowak', temperature: 'WARM', idleDays: 2, highlighted: true },
                    { type: 'OPPORTUNITY', party: 'Piekarnia Przykładowa', title: 'Opakowania na sezon', value: '8 500 zł', owner: 'Jan Kowalski', temperature: 'COLD', idleDays: 9 },
                ],
            },
            {
                title: 'Rozpoznanie potrzeb',
                probability: 25,
                tone: 'info',
                cards: [
                    { type: 'OPPORTUNITY', party: 'Firma Demo sp. z o.o.', title: 'Regały do magazynu', value: '62 000 zł', owner: 'Piotr Wiśniewski', temperature: 'HOT', idleDays: 1, highlighted: true },
                    { type: 'OPPORTUNITY', party: 'Auto-Serwis Testowy', title: 'Dostawy części co miesiąc', value: '15 800 zł', owner: 'Anna Nowak', temperature: 'WARM', idleDays: 5 },
                ],
            },
            {
                title: 'Oferta',
                probability: 50,
                tone: 'primary',
                cards: [
                    { type: 'OFFER', party: 'Hurtownia Przykładowa', title: 'Chemia gospodarcza Q1', reference: 'OF/2026/11/014', value: '128 400 zł', owner: 'Jan Kowalski', temperature: 'HOT', idleDays: 3, highlighted: true },
                    { type: 'OFFER', party: 'Drukarnia Przykład', title: 'Papier i tonery', reference: 'OF/2026/11/017', value: '19 900 zł', owner: 'Ewa Zielińska', temperature: 'WARM', idleDays: 6, highlighted: true },
                    { type: 'OFFER', party: 'Biuro Testowe', title: 'Meble biurowe', reference: 'OF/2026/11/009', value: '11 200 zł', owner: 'Anna Nowak', temperature: 'COLD', idleDays: 12 },
                ],
            },
            {
                title: 'Negocjacje',
                probability: 75,
                tone: 'warning',
                cards: [
                    { type: 'OFFER', party: 'Budmat Demo', title: 'Materiały na budowę hali', reference: 'OF/2026/10/221', value: '174 000 zł', owner: 'Piotr Wiśniewski', temperature: 'HOT', idleDays: 4, highlighted: true },
                ],
            },
            {
                title: 'Zamknięcie',
                probability: 90,
                tone: 'success',
                cards: [
                    { type: 'ORDER', party: 'Sklep Testowy', title: 'Zamówienie ramowe 2027', reference: 'ZK/2026/11/0087', value: '42 500 zł', owner: 'Ewa Zielińska', temperature: 'HOT', idleDays: 1, highlighted: true },
                ],
            },
        ],
    },
    picking: {
        label: 'Podgląd systemu letmework.ai: kokpit magazyniera z kolejką pracy i otwartym zadaniem kompletacji, lokalizacjami, partiami i postępem potwierdzeń.',
        crumb: ['letmework.ai', 'WMS', 'Magazynier'],
        tabs: ['Panel', 'Operacje', 'Magazynier', 'Struktura magazynu', 'Dokumenty', 'Stany magazynowe', 'Inwentaryzacja'],
        activeTab: 2,
        title: 'Kokpit magazyniera',
        subtitle: 'Twoja kolejka pracy — kompletacje, przyjęcia PZ i zadania dodatkowe.',
        warehouse: 'Magazyn Centralny (MC1)',
        queue: {
            title: 'Kolejka pracy',
            search: 'Szukaj po numerze lub statusie',
            claimNext: 'Pobierz następne',
            suggested: 'Sugerowane',
            sections: [
                {
                    title: 'Moje zadania',
                    items: [
                        { reference: 'ZK/2026/11/0087', warehouse: 'MC1', group: 'Strefa A', assignee: 'Jan Kowalski', positions: '4 poz.', status: 'W kompletacji', tone: 'progress', selected: true },
                    ],
                },
                {
                    title: 'Do wzięcia',
                    items: [
                        { reference: 'ZK/2026/11/0091', warehouse: 'MC1', group: 'Strefa A', assignee: 'Nieprzypisane', positions: '7 poz.', status: 'Otwarte', tone: 'neutral', suggested: true },
                        { reference: 'ZK/2026/11/0094', warehouse: 'MC1', group: 'Strefa B', assignee: 'Nieprzypisane', positions: '2 poz.', status: 'Otwarte', tone: 'neutral' },
                    ],
                },
                {
                    title: 'Przyjęcia PZ',
                    items: [
                        { reference: 'PZ/2026/11/0033', warehouse: 'MC1', group: 'Rampa 2', assignee: 'Nieprzypisane', positions: '12 poz.', status: 'Oczekuje', tone: 'warning' },
                    ],
                },
            ],
        },
        task: {
            type: 'Kompletacja',
            reference: 'ZK/2026/11/0087',
            status: 'W kompletacji',
            meta: [
                { label: 'Magazyn', value: 'Magazyn Centralny' },
                { label: 'Grupa kompletacji', value: 'Strefa A' },
                { label: 'Pozycje', value: '4' },
            ],
        },
        progress: {
            title: 'Postęp potwierdzeń',
            notice: 'Brak kompletu potwierdzeń — spakować da się po doskanowaniu brakujących sztuk albo zgłoszeniu braku',
            columns: ['Linia', 'Do pobrania', 'Potwierdzone', 'Zostało'],
            rows: [
                { symbol: 'DEMO-1001', detail: 'P-2026-114 · A-01-02-B', toPick: 12, confirmed: 12 },
                { symbol: 'DEMO-3112', detail: 'P-2026-121 · A-04-03-C', toPick: 24, confirmed: 10 },
                { symbol: 'DEMO-2040', detail: 'P-2026-098 · A-03-01-A', toPick: 6, confirmed: 6 },
                { symbol: 'DEMO-0457', detail: 'P-2026-087 · A-06-01-A', toPick: 3, confirmed: 0 },
            ],
        },
        lines: {
            columns: ['Produkt', 'Partia', 'Ważność', 'Do pobrania', 'Sprawdzone'],
            shortPick: 'Zgłoś brak',
            rows: [
                { symbol: 'DEMO-1001', name: 'Rękawice robocze, rozm. L', location: 'A-01-02-B', lot: 'P-2026-114', expiration: '31.03.2028', quantity: '12 szt.', checked: true },
                { symbol: 'DEMO-3112', name: 'Płyn do mycia podłóg 5 l', location: 'A-04-03-C', lot: 'P-2026-121', expiration: '30.09.2027', quantity: '24 szt.' },
                { symbol: 'DEMO-2040', name: 'Taśma pakowa 48 mm', location: 'A-03-01-A', lot: 'P-2026-098', expiration: '—', quantity: '6 szt.', checked: true },
                { symbol: 'DEMO-0457', name: 'Folia stretch 23 µm', location: 'A-06-01-A', lot: 'P-2026-087', expiration: '—', quantity: '3 szt.' },
            ],
        },
        summary: 'Skompletowano 2/4 · braki: 0',
        confirmScan: 'Potwierdź skan',
        pack: 'Spakuj zadanie',
    },
    assistant: {
        label: 'Podgląd systemu letmework.ai: rozmowa z asystentem Lemy, który znajduje wnioski urlopowe i proponuje zatwierdzenie jednego z nich z przyciskami Potwierdź zmianę i Anuluj.',
        crumb: ['letmework.ai', 'Lemy', 'Czat AI'],
        tabs: ['Czat AI', 'Baza wiedzy', 'Zadania automatyczne'],
        activeTab: 0,
        newConversation: 'Nowa rozmowa',
        search: 'Szukaj w rozmowach…',
        history: [
            {
                group: 'Dziś',
                sessions: [
                    { title: 'Wnioski urlopowe zespołu', time: '09:12', active: true },
                    { title: 'Stany rękawic w MC1', time: '08:40' },
                ],
            },
            {
                group: 'Wczoraj',
                sessions: [
                    { title: 'Oferta dla Hurtowni Przykładowej', time: '16:05' },
                    { title: 'Faktury po terminie', time: '11:22' },
                ],
            },
            {
                group: 'Ten tydzień',
                sessions: [{ title: 'Plan transportów na piątek', time: 'pon.' }],
            },
        ],
        name: 'Lemy',
        status: 'Online · gotowy do pomocy',
        wizard: 'Kreator konfiguracji',
        download: 'Pobierz rozmowę',
        question: { text: 'Kto z mojego zespołu czeka na decyzję w sprawie urlopu?', time: '09:12' },
        answer: {
            intro: 'Na Twoją decyzję czekają 2 wnioski urlopowe:',
            items: [
                'Jan Kowalski — urlop wypoczynkowy, 24–28.11.2026 (5 dni), saldo po urlopie: 9 dni',
                'Anna Nowak — urlop na żądanie, 21.11.2026 (1 dzień), saldo po urlopie: 3 dni',
            ],
            outro: 'W terminie urlopu Jana nikt inny z działu nie ma wolnego.',
            time: '09:12',
        },
        command: { text: 'Zatwierdź urlop Jana.', time: '09:13' },
        proposal: {
            intro: 'Przygotowałem zmianę. Sprawdź podgląd i potwierdź:',
            title: 'Potwierdzenie zmiany',
            target: 'Wniosek urlopowy · Jan Kowalski · 24–28.11.2026',
            changesLabel: 'Zmiany',
            field: 'Status',
            beforeLabel: 'Przed',
            before: 'Oczekujący',
            afterLabel: 'Po',
            after: 'Zatwierdzony',
            effectsLabel: 'Skutki',
            effects: ['Saldo urlopowe Jana Kowalskiego zmniejszy się o 5 dni.', 'Jan Kowalski dostanie powiadomienie o decyzji.'],
            confirm: 'Potwierdź zmianę',
            cancel: 'Anuluj',
            expires: 'Ważne jeszcze 9:41',
            sends: 'Wyśle wiadomość: POTWIERDZAM 482913',
            time: '09:13',
        },
        placeholder: 'Spytaj Lemy o cokolwiek…',
    },
    tracking: {
        label: 'Podgląd systemu letmework.ai: mapa kierowców na żywo. Kierowca z aplikacją na służbowym telefonie wysyła pozycję, a logistyka widzi, gdzie jest, jego trasę, prędkość i czas ostatniego pomiaru.',
        crumb: ['letmework.ai', 'Logistyka', 'Mapa kierowców'],
        tabs: ['Transporty', 'Zlecenia spedycyjne', 'Planer', 'Brama', 'Rozliczenia', 'Przejazdy', 'Mapa kierowców'],
        activeTab: 6,
        search: 'Szukaj: kierowca, rejestracja, przejazd, ZT, zlecenie',
        count: 'Kierowców: 3',
        active: 'Śledzenie aktywne',
        stale: 'Pozycja nieaktualna',
        drivers: [
            { name: 'Anna Nowak', short: 'Anna N.', age: '1 min temu', details: 'DEMO 0377 · Przejazd PRZ/2026/11/017', state: 'FRESH' },
            { name: 'Jan Kowalski', short: 'Jan K.', age: '12 s temu', details: 'DEMO 0214 · Przejazd PRZ/2026/11/014', state: 'FRESH', selected: true },
            { name: 'Piotr Wiśniewski', short: 'Piotr W.', age: '18 min temu', details: 'DEMO 0952 · Przejazd PRZ/2026/11/009', state: 'STALE' },
        ],
        details: [
            { label: 'Ostatni pomiar', value: '17.11, 10:42' },
            { label: 'Dokładność', value: '8 m' },
            { label: 'Prędkość', value: '46 km/h' },
            { label: 'Pomiary', value: 'w ruchu co 15 s', sub: 'na postoju co 120 s, min. 50 m' },
            { label: 'Uruchomiono', value: '17.11, 06:58' },
        ],
        showOnMap: 'Pokaż na mapie',
        openTrip: 'Otwórz przejazd',
        showAll: 'Pokaż wszystkich',
        legend: {
            title: 'Legenda',
            states: { FRESH: 'Aktualna pozycja', STALE: 'Pozycja nieaktualna', STOPPED: 'Śledzenie zatrzymane', UNKNOWN: 'Stan nieznany' },
            lowAccuracy: 'Niska dokładność GPS',
            route: 'Trasa',
        },
        route: { title: 'Trasa: Jan Kowalski', distance: '5,2 km (wstępny, mogą dojść punkty)', note: 'Mogą jeszcze dojść zaległe punkty z telefonu' },
        popup: {
            name: 'Jan Kowalski',
            plate: 'DEMO 0214',
            subject: 'Przejazd PRZ/2026/11/014',
            state: 'Aktualna pozycja',
            age: '12 s temu',
            session: 'Sesja',
            status: 'Śledzenie aktywne',
            recorded: 'Pomiar: 17.11, 10:42',
            accuracy: 'Szacowana dokładność: 8 m',
            speed: 'Prędkość: 46 km/h',
        },
    },
};

const en: ErpMockupText = {
    shell: {
        brand: 'letmework.ai',
        nav: {
            hr: 'HR',
            calendar: 'Calendar',
            crm: 'CRM',
            sales: 'Sales',
            products: 'Goods and services',
            logistics: 'Logistics',
            wms: 'WMS',
            communicator: 'Communicator',
            lemy: 'Lemy',
        },
        help: 'Help',
        user: { name: 'Jan Kowalski', initials: 'JK' },
        menu: 'Open menu',
    },
    pipeline: {
        label: 'Preview of the letmework.ai system: CRM sales board with opportunities across five funnel stages, each showing value, temperature and owner, plus a KPI strip.',
        crumb: ['letmework.ai', 'CRM', 'Kanban'],
        tabs: ['Kanban', 'All customers', 'Prospective clients', 'Addresses', 'Contacts', 'Buffer', 'Reports'],
        activeTab: 0,
        title: 'Kanban',
        pipeline: 'B2B funnel',
        create: 'New opportunity',
        refresh: 'Refresh',
        mentions: 'Mentions',
        today: { label: 'Today', count: 4 },
        closed: { label: 'Closed', count: 6 },
        filters: 'Filters',
        axis: { label: 'Columns', options: ['Action state', 'Funnel stages'], active: 1 },
        owner: { label: 'Board', options: ['Mine', 'Team', 'Employee'], active: 1 },
        stats: [
            { label: 'Pipeline value', value: '486 300 zł' },
            { label: 'Win rate', value: '38%' },
            { label: 'Overdue', value: '3' },
            { label: 'To do', value: '5' },
        ],
        types: { OPPORTUNITY: 'Opportunity', OFFER: 'Offer', ORDER: 'Order' },
        temperatures: { HOT: 'Hot', WARM: 'Warm', COLD: 'Cold' },
        columns: [
            {
                title: 'To contact',
                probability: 10,
                tone: 'info',
                cards: [
                    { type: 'OPPORTUNITY', party: 'Sklep Testowy', title: 'Fit-out of a new store', value: '24 000 zł', owner: 'Anna Nowak', temperature: 'WARM', idleDays: 2, highlighted: true },
                    { type: 'OPPORTUNITY', party: 'Piekarnia Przykładowa', title: 'Seasonal packaging', value: '8 500 zł', owner: 'Jan Kowalski', temperature: 'COLD', idleDays: 9 },
                ],
            },
            {
                title: 'Discovery',
                probability: 25,
                tone: 'info',
                cards: [
                    { type: 'OPPORTUNITY', party: 'Firma Demo sp. z o.o.', title: 'Warehouse racking', value: '62 000 zł', owner: 'Piotr Wiśniewski', temperature: 'HOT', idleDays: 1, highlighted: true },
                    { type: 'OPPORTUNITY', party: 'Auto-Serwis Testowy', title: 'Monthly parts delivery', value: '15 800 zł', owner: 'Anna Nowak', temperature: 'WARM', idleDays: 5 },
                ],
            },
            {
                title: 'Offer',
                probability: 50,
                tone: 'primary',
                cards: [
                    { type: 'OFFER', party: 'Hurtownia Przykładowa', title: 'Cleaning supplies Q1', reference: 'OF/2026/11/014', value: '128 400 zł', owner: 'Jan Kowalski', temperature: 'HOT', idleDays: 3, highlighted: true },
                    { type: 'OFFER', party: 'Drukarnia Przykład', title: 'Paper and toners', reference: 'OF/2026/11/017', value: '19 900 zł', owner: 'Ewa Zielińska', temperature: 'WARM', idleDays: 6, highlighted: true },
                    { type: 'OFFER', party: 'Biuro Testowe', title: 'Office furniture', reference: 'OF/2026/11/009', value: '11 200 zł', owner: 'Anna Nowak', temperature: 'COLD', idleDays: 12 },
                ],
            },
            {
                title: 'Negotiation',
                probability: 75,
                tone: 'warning',
                cards: [
                    { type: 'OFFER', party: 'Budmat Demo', title: 'Materials for a new hall', reference: 'OF/2026/10/221', value: '174 000 zł', owner: 'Piotr Wiśniewski', temperature: 'HOT', idleDays: 4, highlighted: true },
                ],
            },
            {
                title: 'Closing',
                probability: 90,
                tone: 'success',
                cards: [
                    { type: 'ORDER', party: 'Sklep Testowy', title: 'Framework order 2027', reference: 'ZK/2026/11/0087', value: '42 500 zł', owner: 'Ewa Zielińska', temperature: 'HOT', idleDays: 1, highlighted: true },
                ],
            },
        ],
    },
    picking: {
        label: 'Preview of the letmework.ai system: warehouse worker cockpit with the work queue and an open picking task showing locations, lots and confirmation progress.',
        crumb: ['letmework.ai', 'WMS', 'Warehouse Worker'],
        tabs: ['Dashboard', 'Operations', 'Warehouse Worker', 'Warehouse structure', 'Documents', 'Stock levels', 'Inventory'],
        activeTab: 2,
        title: 'Warehouse worker cockpit',
        subtitle: 'Your work queue — picking, PZ receipts and additional tasks.',
        warehouse: 'Central Warehouse (MC1)',
        queue: {
            title: 'Work queue',
            search: 'Search by reference or status',
            claimNext: 'Fetch next',
            suggested: 'Suggested',
            sections: [
                {
                    title: 'My tasks',
                    items: [
                        { reference: 'ZK/2026/11/0087', warehouse: 'MC1', group: 'Zone A', assignee: 'Jan Kowalski', positions: '4 items', status: 'Picking', tone: 'progress', selected: true },
                    ],
                },
                {
                    title: 'Available',
                    items: [
                        { reference: 'ZK/2026/11/0091', warehouse: 'MC1', group: 'Zone A', assignee: 'Unassigned', positions: '7 items', status: 'Open', tone: 'neutral', suggested: true },
                        { reference: 'ZK/2026/11/0094', warehouse: 'MC1', group: 'Zone B', assignee: 'Unassigned', positions: '2 items', status: 'Open', tone: 'neutral' },
                    ],
                },
                {
                    title: 'PZ receipts',
                    items: [
                        { reference: 'PZ/2026/11/0033', warehouse: 'MC1', group: 'Dock 2', assignee: 'Unassigned', positions: '12 items', status: 'Pending', tone: 'warning' },
                    ],
                },
            ],
        },
        task: {
            type: 'Picking',
            reference: 'ZK/2026/11/0087',
            status: 'Picking',
            meta: [
                { label: 'Warehouse', value: 'Central Warehouse' },
                { label: 'Picking group', value: 'Zone A' },
                { label: 'Positions', value: '4' },
            ],
        },
        progress: {
            title: 'Confirmation progress',
            notice: 'Not fully confirmed — you can pack after scanning the missing units or reporting a shortage',
            columns: ['Line', 'To pick', 'Confirmed', 'Remaining'],
            rows: [
                { symbol: 'DEMO-1001', detail: 'P-2026-114 · A-01-02-B', toPick: 12, confirmed: 12 },
                { symbol: 'DEMO-3112', detail: 'P-2026-121 · A-04-03-C', toPick: 24, confirmed: 10 },
                { symbol: 'DEMO-2040', detail: 'P-2026-098 · A-03-01-A', toPick: 6, confirmed: 6 },
                { symbol: 'DEMO-0457', detail: 'P-2026-087 · A-06-01-A', toPick: 3, confirmed: 0 },
            ],
        },
        lines: {
            columns: ['Product', 'Lot', 'Expiration', 'To pick', 'Checked'],
            shortPick: 'Report shortage',
            rows: [
                { symbol: 'DEMO-1001', name: 'Work gloves, size L', location: 'A-01-02-B', lot: 'P-2026-114', expiration: '31/03/2028', quantity: '12 pcs', checked: true },
                { symbol: 'DEMO-3112', name: 'Floor cleaner 5 l', location: 'A-04-03-C', lot: 'P-2026-121', expiration: '30/09/2027', quantity: '24 pcs' },
                { symbol: 'DEMO-2040', name: 'Packing tape 48 mm', location: 'A-03-01-A', lot: 'P-2026-098', expiration: '—', quantity: '6 pcs', checked: true },
                { symbol: 'DEMO-0457', name: 'Stretch film 23 µm', location: 'A-06-01-A', lot: 'P-2026-087', expiration: '—', quantity: '3 pcs' },
            ],
        },
        summary: 'Picked 2/4 · short: 0',
        confirmScan: 'Confirm scan',
        pack: 'Pack task',
    },
    assistant: {
        label: 'Preview of the letmework.ai system: a conversation with the Lemy assistant, which finds pending leave requests and proposes approving one, with Confirm change and Cancel buttons.',
        crumb: ['letmework.ai', 'Lemy', 'AI Chat'],
        tabs: ['AI Chat', 'Knowledge base', 'Automated tasks'],
        activeTab: 0,
        newConversation: 'New conversation',
        search: 'Search conversations…',
        history: [
            {
                group: 'Today',
                sessions: [
                    { title: 'Team leave requests', time: '09:12', active: true },
                    { title: 'Glove stock in MC1', time: '08:40' },
                ],
            },
            {
                group: 'Yesterday',
                sessions: [
                    { title: 'Offer for Hurtownia Przykładowa', time: '16:05' },
                    { title: 'Overdue invoices', time: '11:22' },
                ],
            },
            {
                group: 'This week',
                sessions: [{ title: 'Friday transport plan', time: 'Mon' }],
            },
        ],
        name: 'Lemy',
        status: 'Online · ready to help',
        wizard: 'Configuration wizard',
        download: 'Download conversation',
        question: { text: 'Who on my team is waiting for a leave decision?', time: '09:12' },
        answer: {
            intro: 'There are 2 leave requests waiting for your decision:',
            items: [
                'Jan Kowalski — annual leave, 24–28 Nov 2026 (5 days), balance afterwards: 9 days',
                'Anna Nowak — leave on demand, 21 Nov 2026 (1 day), balance afterwards: 3 days',
            ],
            outro: 'Nobody else in the department is off during Jan’s leave.',
            time: '09:12',
        },
        command: { text: 'Approve Jan’s leave.', time: '09:13' },
        proposal: {
            intro: 'I have prepared the change. Review the preview and confirm:',
            title: 'Confirm the change',
            target: 'Leave request · Jan Kowalski · 24–28 Nov 2026',
            changesLabel: 'Changes',
            field: 'Status',
            beforeLabel: 'Before',
            before: 'Waiting',
            afterLabel: 'After',
            after: 'Approved',
            effectsLabel: 'Effects',
            effects: ['Jan Kowalski’s leave balance drops by 5 days.', 'Jan Kowalski is notified of the decision.'],
            confirm: 'Confirm change',
            cancel: 'Cancel',
            expires: 'Valid for 9:41',
            sends: 'Sends the message: CONFIRM 482913',
            time: '09:13',
        },
        placeholder: 'Ask Lemy anything…',
    },
    tracking: {
        label: 'Preview of the letmework.ai system: live driver map. A driver with the app on a company phone sends his position, and logistics sees where he is, his route, speed and the time of the last reading.',
        crumb: ['letmework.ai', 'Logistics', 'Driver map'],
        tabs: ['Shipments', 'Forwarding orders', 'Planner', 'Gate', 'Settlements', 'Trips', 'Driver map'],
        activeTab: 6,
        search: 'Search: driver, license plate, trip, transport order, order',
        count: 'Drivers: 3',
        active: 'Tracking active',
        stale: 'Outdated position',
        drivers: [
            { name: 'Anna Nowak', short: 'Anna N.', age: '1 min ago', details: 'DEMO 0377 · Trip PRZ/2026/11/017', state: 'FRESH' },
            { name: 'Jan Kowalski', short: 'Jan K.', age: '12 s ago', details: 'DEMO 0214 · Trip PRZ/2026/11/014', state: 'FRESH', selected: true },
            { name: 'Piotr Wiśniewski', short: 'Piotr W.', age: '18 min ago', details: 'DEMO 0952 · Trip PRZ/2026/11/009', state: 'STALE' },
        ],
        details: [
            { label: 'Last reading', value: '11/17, 10:42 AM' },
            { label: 'Accuracy', value: '8 m' },
            { label: 'Speed', value: '46 km/h' },
            { label: 'Readings', value: 'moving: every 15 s', sub: 'stationary: every 120 s, min. 50 m' },
            { label: 'Started', value: '11/17, 06:58 AM' },
        ],
        showOnMap: 'Show on map',
        openTrip: 'Open trip',
        showAll: 'Show all',
        legend: {
            title: 'Legend',
            states: { FRESH: 'Current position', STALE: 'Outdated position', STOPPED: 'Tracking stopped', UNKNOWN: 'Unknown state' },
            lowAccuracy: 'Low GPS accuracy',
            route: 'Route',
        },
        route: { title: 'Route: Jan Kowalski', distance: '5.2 km (preliminary, more points may arrive)', note: 'Pending points from the phone may still arrive' },
        popup: {
            name: 'Jan Kowalski',
            plate: 'DEMO 0214',
            subject: 'Trip PRZ/2026/11/014',
            state: 'Current position',
            age: '12 s ago',
            session: 'Session',
            status: 'Tracking active',
            recorded: 'Recorded: 11/17, 10:42 AM',
            accuracy: 'Estimated accuracy: 8 m',
            speed: 'Speed: 46 km/h',
        },
    },
};

export const ERP_MOCKUP: { pl: ErpMockupText; en: ErpMockupText } = { pl, en };
