export type NavModule = 'crm' | 'sales' | 'supply' | 'logistics' | 'wms' | 'reports' | 'products';
export type PairTone = 'ok' | 'wait' | 'warn' | 'idle';
export type SourceTone = 'ai' | 'confirmed' | 'decision' | 'muted' | 'manual';
export type MailMark = 'linked' | 'active' | 'missing';
export type RunTone = 'done' | 'open' | 'partial';

export interface CaseShellText {
    mobileTitle: string;
    initials: string;
}

export interface CaseWindowText {
    label: string;
    crumb: string[];
    tabs: string[];
    activeTab: number;
}

export interface CameraTile {
    label: string;
    view: 'front' | 'rear';
    weight: string;
    plate: string;
    tone: PairTone;
    stamp: string;
    hint?: string[];
    fix?: string;
    add: string;
}

export interface WeighingRow {
    id: string;
    plate: string;
    delivery: string;
    party: string;
    weightIn: string;
    weightOut: string;
    net: string;
    complete: boolean;
    manual?: boolean;
    created: string;
    fresh?: boolean;
}

export interface WeighbridgeText extends CaseWindowText {
    title: string;
    live: string;
    presets: string[];
    activePreset: number;
    controls: { pause: string; photo: string; fit: string };
    cameras: [CameraTile, CameraTile];
    history: {
        title: string;
        total: string;
        search: string;
        dates: string;
        status: string;
        add: string;
        columns: { id: string; plate: string; delivery: string; weightIn: string; weightOut: string; net: string; status: string; created: string };
        statuses: { complete: string; pending: string; manual: string };
        rows: WeighingRow[];
    };
}

export interface ProposalRow {
    kind: 'position' | 'line' | 'candidate';
    lp?: string;
    name: string;
    nameTone?: 'ai' | 'decision' | 'muted';
    nameAction?: string;
    source: string;
    quote?: boolean;
    detail?: string;
    sourceTone: SourceTone;
    sourceAction?: string;
    confidence?: string;
    qty?: string;
    unit?: string;
    available?: string;
    price?: string;
    vat?: string;
    net?: string;
    gross?: string;
}

export interface MailSegment {
    text: string;
    mark?: MailMark;
}

export interface MailOrdersText extends CaseWindowText {
    back: string;
    counter: string;
    doc: { prefix: string; auto: string; number: string; year: string; title: string };
    header: { label: string; value: string }[];
    client: { label: string; value: string; ai: string };
    billing: { label: string; value: string };
    delivery: { label: string; value: string };
    logistics: string;
    columns: { name: string; source: string; qty: string; unit: string; available: string; price: string; vat: string; net: string; gross: string };
    rows: ProposalRow[];
    totals: { label: string; value: string }[];
    mailButton: string;
    attachments: string;
    mail: {
        from: string;
        subject: string;
        toggle: string;
        part: string;
        segments: MailSegment[];
        missing: string;
        attachment: string;
    };
    footer: { issuerLabel: string; issuer: string; status: string; reject: string; save: string; create: string };
}

export interface UpsellRow {
    lp: string;
    client: string;
    badge?: string;
    flags?: string;
    buys: { category: string; share: string }[];
    gaps: string;
    peers: string;
    proposal: string;
    turnover: string;
    selected?: boolean;
}

export interface OfferLine {
    product: string;
    qty: string;
    unit: string;
    price: string;
    value: string;
    ai?: boolean;
    why?: string;
}

export interface OffersText extends CaseWindowText {
    title: string;
    salesman: string;
    period: string;
    variants: { letter: string; label: string }[];
    activeVariant: number;
    runs: {
        title: string;
        items: { letter: string; label: string; state: string; tone: RunTone; who: string; when: string; selected?: boolean }[];
    };
    meta: { label: string; value: string }[];
    section: string;
    sectionNote: string;
    columns: { lp: string; client: string; buys: string; gaps: string; proposal: string; turnover: string };
    rows: UpsellRow[];
    draft: {
        title: string;
        client: string;
        ai: string;
        note: string;
        columns: { product: string; qty: string; unit: string; price: string; value: string };
        lines: OfferLine[];
        totalLabel: string;
        total: string;
        letter: string;
        insert: string;
        discard: string;
    };
    footer: string;
}

export interface CaseMockupText {
    shell: CaseShellText;
    weighbridge: WeighbridgeText;
    mailOrders: MailOrdersText;
    offers: OffersText;
}

const pl: CaseMockupText = {
    shell: { mobileTitle: 'ERP', initials: 'JK' },
    weighbridge: {
        label: 'Ekran ERP Wagi samochodowe: obraz z kamer ANPR na wjeździe i wyjeździe z odczytaną tablicą DEMO 1234 i masą 24 380 kg, pod nim historia ważeń z rejestracjami przypisanymi do dostaw',
        crumb: ['ERP', 'Sprzedaż', 'Wagi samochodowe'],
        tabs: ['Zamówienia', 'Wszyscy klienci', 'Faktury', 'Wagi', 'Zapytania B2B'],
        activeTab: 3,
        title: 'Wagi samochodowe',
        live: 'Na żywo',
        presets: ['Kamery', '50-50', 'Tabela', 'Pełna tabela'],
        activePreset: 1,
        controls: { pause: 'Zatrzymaj', photo: 'Zdjęcie', fit: 'Dopasuj' },
        cameras: [
            {
                label: 'Wjazd',
                view: 'front',
                weight: '24 380',
                plate: 'DEMO 1234',
                tone: 'ok',
                stamp: '2026-11-17 09:42:06',
                hint: ['Zbieram wagę, wpis powstanie sam', 'Waga połączona', 'Odczyt tablicy: 09:41:58', 'Odczyt wagi: 09:42:06'],
                add: 'Dodaj wagę wjazdu',
            },
            {
                label: 'Wyjazd',
                view: 'rear',
                weight: '11 120',
                plate: 'XX 00000',
                tone: 'ok',
                stamp: '2026-11-17 09:38:51',
                fix: 'Popraw wpis 4126',
                add: 'Dodaj wagę wyjazdu',
            },
        ],
        history: {
            title: 'Historia ważeń',
            total: '128',
            search: 'Szukaj rejestracji',
            dates: 'Zakres dat',
            status: 'Wszystkie statusy',
            add: 'Dodaj wagę',
            columns: { id: 'ID', plate: 'Rejestracja', delivery: 'Dostawa', weightIn: 'Wjazd', weightOut: 'Wyjazd', net: 'Netto', status: 'Status', created: 'Utworzono' },
            statuses: { complete: 'Kompletne', pending: 'Oczekuje na wyjazd', manual: 'ręcznie' },
            rows: [
                { id: '4127', plate: 'DEMO 1234', delivery: 'ZT 214/2026', party: 'Hurtownia Przykładowa', weightIn: '24 380 kg', weightOut: '0 kg', net: '-', complete: false, created: '17.11.2026, 09:42', fresh: true },
                { id: '4126', plate: 'XX 00000', delivery: 'ZT 213/2026', party: 'Firma Wzorcowa', weightIn: '27 940 kg', weightOut: '11 120 kg', net: '16 820 kg', complete: true, created: '17.11.2026, 08:57' },
                { id: '4125', plate: 'DEMO 5678', delivery: 'ZT 211/2026', party: 'Sklep Testowy', weightIn: '18 610 kg', weightOut: '9 450 kg', net: '9 160 kg', complete: true, manual: true, created: '17.11.2026, 08:14' },
                { id: '4124', plate: 'XY 12345', delivery: 'ZT 210/2026', party: 'Hurtownia Przykładowa', weightIn: '31 200 kg', weightOut: '14 870 kg', net: '16 330 kg', complete: true, created: '17.11.2026, 07:31' },
            ],
        },
    },
    mailOrders: {
        label: 'Ekran ERP Propozycja zamówienia z maila: formularz ZK wypełniony przez AI, pozycje z cytatem z maila i źródłem dopasowania, pewność modelu w dymku, rozwinięty mail klienta i przycisk Utwórz ZK, który zostaje po stronie handlowca',
        crumb: ['ERP', 'Sprzedaż', 'Propozycja ZK'],
        tabs: ['Zamówienia', 'Wszyscy klienci', 'Faktury', 'Wagi', 'Zapytania B2B'],
        activeTab: 0,
        back: 'Zamówienia',
        counter: '2 z 6',
        doc: { prefix: 'ZK', auto: '(auto)', number: 'Brak', year: '2026', title: 'Zamówienie z maila' },
        header: [
            { label: 'Cena', value: 'Cena hurtowa' },
            { label: 'Waluta', value: 'PLN' },
            { label: 'Kurs NBP', value: '1,0000' },
            { label: 'Wycena', value: 'Brak' },
            { label: 'Rezerwacja', value: 'Brak' },
            { label: 'Data', value: '17.11.2026' },
        ],
        client: { label: 'Firma', value: 'Hurtownia Przykładowa sp. z o.o.', ai: 'AI' },
        billing: { label: 'Adres do rozliczeń', value: 'ul. Przykładowa 1, 00-001 Demo' },
        delivery: { label: 'Adres dostawy', value: 'Magazyn, ul. Testowa 5, Demo' },
        logistics: 'Logistyka',
        columns: { name: 'Nazwa produktu', source: 'Z maila', qty: 'Ilość', unit: 'J.m.', available: 'Dostępne', price: 'Cena netto', vat: 'VAT', net: 'Wartość netto', gross: 'Wartość brutto' },
        rows: [
            { kind: 'position', lp: '1', name: 'Profil zamknięty 40x40x2 ocynk 6 m', nameTone: 'ai', source: '„profil 40x40x2 ocynk 20 szt”', quote: true, detail: 'historia klienta', sourceTone: 'ai', sourceAction: '⋯', confidence: 'L1: pewność modelu 94% - pomocniczo', qty: '20', unit: 'szt', available: '312', price: '68,40', vat: '23%', net: '1 368,00', gross: '1 682,64' },
            { kind: 'position', lp: '2', name: 'Kątownik 50x50x5 6 m', nameTone: 'ai', source: '„kątownik 50/50/5 - 15 szt”', quote: true, detail: 'słownik klienta', sourceTone: 'ai', sourceAction: '⋯', qty: '15', unit: 'szt', available: '96', price: '112,90', vat: '23%', net: '1 693,50', gross: '2 083,01' },
            { kind: 'position', lp: '3', name: 'Płaskownik 40x5 6 m', source: '„płaskownik 40x5 6m 30 szt”', quote: true, detail: 'potwierdzone przez handlowca (3×)', sourceTone: 'confirmed', sourceAction: '⋯', qty: '30', unit: 'szt', available: '240', price: '41,20', vat: '23%', net: '1 236,00', gross: '1 520,28' },
            { kind: 'line', lp: '4', name: 'wybierz produkt', nameTone: 'decision', nameAction: 'Szukaj', source: '„rura fi 40 ocynk 10szt”', quote: true, sourceTone: 'decision', sourceAction: '⋯', qty: '10', unit: 'szt' },
            { kind: 'candidate', name: 'Rura okrągła 40x2 ocynk 6 m', source: 'historia klienta · ZK 118/2026', sourceTone: 'muted', sourceAction: 'Wybierz', unit: 'szt' },
            { kind: 'candidate', name: 'Rura okrągła 42,4x2 ocynk 6 m', source: 'katalog', sourceTone: 'muted', sourceAction: 'Wybierz', unit: 'szt' },
        ],
        totals: [
            { label: 'Waga*', value: '412,80 kg' },
            { label: 'Netto', value: '4 297,50 zł' },
            { label: 'Brutto', value: '5 285,93 zł' },
        ],
        mailButton: 'Mail',
        attachments: '1',
        mail: {
            from: 'zakupy@hurtownia-przykladowa.example',
            subject: 'Zamówienie na przyszły tydzień',
            toggle: 'zwiń',
            part: 'Treść maila',
            segments: [
                { text: 'Dzień dobry, prosimy o:\n' },
                { text: 'profil 40x40x2 ocynk 20 szt', mark: 'active' },
                { text: '\n' },
                { text: 'kątownik 50/50/5 - 15 szt', mark: 'linked' },
                { text: '\n' },
                { text: 'płaskownik 40x5 6m 30 szt', mark: 'linked' },
                { text: '\n' },
                { text: 'rura fi 40 ocynk 10szt', mark: 'missing' },
                { text: '\nDostawa jak zwykle na magazyn. Pozdrawiam, Jan Kowalski' },
            ],
            missing: 'nie ma w ZK',
            attachment: 'zamowienie-demo.pdf',
        },
        footer: { issuerLabel: 'Wystawił(a):', issuer: 'Anna Nowak', status: 'Linie do wyboru: 1', reject: 'Odrzuć', save: 'Zapisz poprawki', create: 'Utwórz ZK' },
    },
    offers: {
        label: 'Ekran ERP Raport handlowca, wariant Dosprzedaż: klienci z tym, co kupują, czego nie kupują a kupują podobni, propozycją modelu i obrotem, pod spodem szkic oferty dla wybranego klienta do sprawdzenia przez handlowca',
        crumb: ['ERP', 'Raporty', 'Raport handlowca'],
        tabs: ['Raport sprzedaży', 'Raport handlowca', 'Sprzedaż wg klientów', 'Kilometry'],
        activeTab: 1,
        title: 'Raport handlowca',
        salesman: 'Kowalski Jan',
        period: '01.08.2026 - 31.10.2026',
        variants: [
            { letter: 'A', label: 'Szybki przegląd' },
            { letter: 'B', label: 'Lista robocza' },
            { letter: 'C', label: 'Pełny miesięczny' },
            { letter: 'E', label: 'Dosprzedaż' },
        ],
        activeVariant: 3,
        runs: {
            title: 'Moje raporty',
            items: [
                { letter: 'E', label: 'Dosprzedaż', state: 'Gotowy', tone: 'done', who: 'Jan Kowalski', when: '01.08.2026 - 31.10.2026 · 17.11, 09:12', selected: true },
                { letter: 'B', label: 'Lista robocza', state: 'Gotowy', tone: 'done', who: 'Jan Kowalski', when: '01.08.2026 - 31.10.2026 · 16.11, 15:40' },
                { letter: 'A', label: 'Szybki przegląd', state: 'Bez komentarza AI', tone: 'partial', who: 'Anna Nowak', when: '01.08.2026 - 31.10.2026 · 14.11, 08:05' },
            ],
        },
        meta: [
            { label: 'Handlowiec', value: 'Jan Kowalski' },
            { label: 'Okres', value: '01.08.2026 - 31.10.2026' },
            { label: 'Uruchomiono', value: '17.11.2026, 09:12' },
        ],
        section: 'Dosprzedaż - czego klienci nie kupują, a kupują podobni',
        sectionNote: '(pierwszych 3 z 14)',
        columns: { lp: 'Lp.', client: 'Klient', buys: 'Co kupuje', gaps: 'Czego nie kupuje, a kupują podobni', proposal: 'Propozycja', turnover: 'Obrót 12 mies.' },
        rows: [
            {
                lp: '1',
                client: 'Hurtownia Przykładowa sp. z o.o.',
                buys: [{ category: 'Profile zamknięte', share: '62%' }, { category: 'Kątowniki', share: '21%' }],
                gaps: 'Blachy (68% podobnych), Rury (54% podobnych)',
                peers: 'Podobni: hurtownie stali, 9 firm',
                proposal: 'Przy najbliższym zamówieniu profili dołożyć blachę 3 mm i rury ocynk 40x2 - kupują je razem podobne hurtownie.',
                turnover: '412 300 zł',
                selected: true,
            },
            {
                lp: '2',
                client: 'Sklep Testowy',
                badge: 'Monoproduktowy',
                buys: [{ category: 'Pręty żebrowane', share: '88%' }],
                gaps: 'Siatki zbrojeniowe (61% podobnych)',
                peers: 'Podobni: składy budowlane, 14 firm',
                proposal: 'Do kolejnej dostawy prętów zaproponować siatkę zbrojeniową w tym samym transporcie.',
                turnover: '38 900 zł',
            },
            {
                lp: '3',
                client: 'Firma Wzorcowa',
                flags: '2 po terminie · 4 120 zł · do 18 dni',
                buys: [{ category: 'Blachy', share: '54%' }, { category: 'Płaskowniki', share: '30%' }],
                gaps: 'Kątowniki (57% podobnych)',
                peers: 'Podobni: zakłady ślusarskie, 11 firm',
                proposal: 'Najpierw wyjaśnić zaległe faktury, potem przy zamówieniu blach zaproponować kątowniki.',
                turnover: '96 450 zł',
            },
        ],
        draft: {
            title: 'Szkic oferty',
            client: 'Hurtownia Przykładowa sp. z o.o.',
            ai: 'AI',
            note: 'Model na serwerze firmy, na podstawie zakupów z 12 miesięcy. Sprawdź przed wysłaniem.',
            columns: { product: 'Produkt', qty: 'Ilość', unit: 'J.m.', price: 'Cena netto', value: 'Wartość' },
            lines: [
                { product: 'Profil zamknięty 40x40x2 ocynk 6 m', qty: '40', unit: 'szt', price: '68,40 zł', value: '2 736,00 zł' },
                { product: 'Blacha gładka 3 mm 1250x2500', qty: '6', unit: 'szt', price: '412,00 zł', value: '2 472,00 zł', ai: true, why: 'kupują podobni' },
                { product: 'Rura okrągła 40x2 ocynk 6 m', qty: '20', unit: 'szt', price: '74,90 zł', value: '1 498,00 zł', ai: true, why: 'kupują podobni' },
            ],
            totalLabel: 'Razem',
            total: '6 706,00 zł netto',
            letter: 'Dzień dobry, przesyłam ofertę na profile. Dołożyłem blachę 3 mm i rury ocynk, które zwykle idą do tych samych realizacji.',
            insert: 'Wstaw ofertę',
            discard: 'Odrzuć',
        },
        footer: 'Raport wygenerowany dla Jan Kowalski. Pracownik jest zobowiązany do zachowania poufności informacji uzyskanych w ramach wykonywania obowiązków służbowych.',
    },
};

const en: CaseMockupText = {
    shell: { mobileTitle: 'ERP', initials: 'JK' },
    weighbridge: {
        label: 'ERP truck scales screen: ANPR camera feeds at the entry and exit with the read plate DEMO 1234 and a weight of 24,380 kg, and below them the weighing history with plates matched to deliveries',
        crumb: ['ERP', 'Sales', 'Truck scales'],
        tabs: ['Orders', 'All customers', 'Invoices', 'Scales', 'B2B inquiries'],
        activeTab: 3,
        title: 'Truck scales',
        live: 'Live',
        presets: ['Cameras', '50-50', 'Table', 'Full table'],
        activePreset: 1,
        controls: { pause: 'Pause', photo: 'Photo', fit: 'Fit' },
        cameras: [
            {
                label: 'Entry',
                view: 'front',
                weight: '24,380',
                plate: 'DEMO 1234',
                tone: 'ok',
                stamp: '2026-11-17 09:42:06',
                hint: ['Collecting the weight, the entry will be saved on its own', 'Scale connected', 'Plate read: 09:41:58', 'Weight read: 09:42:06'],
                add: 'Add entry weight',
            },
            {
                label: 'Exit',
                view: 'rear',
                weight: '11,120',
                plate: 'XX 00000',
                tone: 'ok',
                stamp: '2026-11-17 09:38:51',
                fix: 'Fix entry 4126',
                add: 'Add exit weight',
            },
        ],
        history: {
            title: 'Weighing history',
            total: '128',
            search: 'Search plate',
            dates: 'Date range',
            status: 'All statuses',
            add: 'Add weight',
            columns: { id: 'ID', plate: 'Plate', delivery: 'Delivery', weightIn: 'Entry', weightOut: 'Exit', net: 'Net', status: 'Status', created: 'Created' },
            statuses: { complete: 'Complete', pending: 'Waiting for exit', manual: 'manual' },
            rows: [
                { id: '4127', plate: 'DEMO 1234', delivery: 'ZT 214/2026', party: 'Example Wholesale', weightIn: '24,380 kg', weightOut: '0 kg', net: '-', complete: false, created: '11/17/2026, 09:42', fresh: true },
                { id: '4126', plate: 'XX 00000', delivery: 'ZT 213/2026', party: 'Sample Company', weightIn: '27,940 kg', weightOut: '11,120 kg', net: '16,820 kg', complete: true, created: '11/17/2026, 08:57' },
                { id: '4125', plate: 'DEMO 5678', delivery: 'ZT 211/2026', party: 'Test Shop', weightIn: '18,610 kg', weightOut: '9,450 kg', net: '9,160 kg', complete: true, manual: true, created: '11/17/2026, 08:14' },
                { id: '4124', plate: 'XY 12345', delivery: 'ZT 210/2026', party: 'Example Wholesale', weightIn: '31,200 kg', weightOut: '14,870 kg', net: '16,330 kg', complete: true, created: '11/17/2026, 07:31' },
            ],
        },
    },
    mailOrders: {
        label: 'ERP screen Order proposal from an email: a sales order form prefilled by AI, lines with the quote from the email and the match source, model confidence in a tooltip, the customer email expanded and a Create order button that stays with the salesperson',
        crumb: ['ERP', 'Sales', 'Order proposal'],
        tabs: ['Orders', 'All customers', 'Invoices', 'Scales', 'B2B inquiries'],
        activeTab: 0,
        back: 'Orders',
        counter: '2 of 6',
        doc: { prefix: 'SO', auto: '(auto)', number: 'None', year: '2026', title: 'Order from email' },
        header: [
            { label: 'Price', value: 'Wholesale price' },
            { label: 'Currency', value: 'PLN' },
            { label: 'NBP rate', value: '1.0000' },
            { label: 'Pricing', value: 'None' },
            { label: 'Reservation', value: 'None' },
            { label: 'Date', value: '11/17/2026' },
        ],
        client: { label: 'Company', value: 'Example Wholesale Ltd.', ai: 'AI' },
        billing: { label: 'Billing address', value: '1 Example St, 00-001 Demo' },
        delivery: { label: 'Delivery address', value: 'Warehouse, 5 Test St, Demo' },
        logistics: 'Logistics',
        columns: { name: 'Product name', source: 'From email', qty: 'Qty', unit: 'Unit', available: 'In stock', price: 'Net price', vat: 'VAT', net: 'Net value', gross: 'Gross value' },
        rows: [
            { kind: 'position', lp: '1', name: 'Square tube 40x40x2 galvanised 6 m', nameTone: 'ai', source: '“tube 40x40x2 galv 20 pcs”', quote: true, detail: 'customer history', sourceTone: 'ai', sourceAction: '⋯', confidence: 'L1: model confidence 94% - for reference', qty: '20', unit: 'pcs', available: '312', price: '68.40', vat: '23%', net: '1,368.00', gross: '1,682.64' },
            { kind: 'position', lp: '2', name: 'Angle 50x50x5 6 m', nameTone: 'ai', source: '“angle 50/50/5 - 15 pcs”', quote: true, detail: 'customer dictionary', sourceTone: 'ai', sourceAction: '⋯', qty: '15', unit: 'pcs', available: '96', price: '112.90', vat: '23%', net: '1,693.50', gross: '2,083.01' },
            { kind: 'position', lp: '3', name: 'Flat bar 40x5 6 m', source: '“flat bar 40x5 6m 30 pcs”', quote: true, detail: 'confirmed by salesperson (3×)', sourceTone: 'confirmed', sourceAction: '⋯', qty: '30', unit: 'pcs', available: '240', price: '41.20', vat: '23%', net: '1,236.00', gross: '1,520.28' },
            { kind: 'line', lp: '4', name: 'choose a product', nameTone: 'decision', nameAction: 'Search', source: '“round tube 40 galv 10pcs”', quote: true, sourceTone: 'decision', sourceAction: '⋯', qty: '10', unit: 'pcs' },
            { kind: 'candidate', name: 'Round tube 40x2 galvanised 6 m', source: 'customer history · SO 118/2026', sourceTone: 'muted', sourceAction: 'Choose', unit: 'pcs' },
            { kind: 'candidate', name: 'Round tube 42.4x2 galvanised 6 m', source: 'catalogue', sourceTone: 'muted', sourceAction: 'Choose', unit: 'pcs' },
        ],
        totals: [
            { label: 'Weight*', value: '412.80 kg' },
            { label: 'Net', value: 'PLN 4,297.50' },
            { label: 'Gross', value: 'PLN 5,285.93' },
        ],
        mailButton: 'Email',
        attachments: '1',
        mail: {
            from: 'purchasing@example-wholesale.example',
            subject: 'Order for next week',
            toggle: 'collapse',
            part: 'Email body',
            segments: [
                { text: 'Hello, please send:\n' },
                { text: 'tube 40x40x2 galv 20 pcs', mark: 'active' },
                { text: '\n' },
                { text: 'angle 50/50/5 - 15 pcs', mark: 'linked' },
                { text: '\n' },
                { text: 'flat bar 40x5 6m 30 pcs', mark: 'linked' },
                { text: '\n' },
                { text: 'round tube 40 galv 10pcs', mark: 'missing' },
                { text: '\nDelivery to the warehouse as usual. Regards, Jan Kowalski' },
            ],
            missing: 'not in the order',
            attachment: 'order-demo.pdf',
        },
        footer: { issuerLabel: 'Issued by:', issuer: 'Anna Nowak', status: 'Lines to choose: 1', reject: 'Reject', save: 'Save changes', create: 'Create order' },
    },
    offers: {
        label: 'ERP screen Salesperson report, Upsell variant: customers with what they buy, what similar customers buy and they do not, the model proposal and turnover, and below an offer draft for the selected customer for the salesperson to check',
        crumb: ['ERP', 'Reports', 'Salesperson report'],
        tabs: ['Sales report', 'Salesperson report', 'Sales by customer', 'Mileage'],
        activeTab: 1,
        title: 'Salesperson report',
        salesman: 'Kowalski Jan',
        period: '08/01/2026 - 10/31/2026',
        variants: [
            { letter: 'A', label: 'Quick overview' },
            { letter: 'B', label: 'Work list' },
            { letter: 'C', label: 'Full monthly' },
            { letter: 'E', label: 'Upsell' },
        ],
        activeVariant: 3,
        runs: {
            title: 'My reports',
            items: [
                { letter: 'E', label: 'Upsell', state: 'Ready', tone: 'done', who: 'Jan Kowalski', when: '08/01 - 10/31/2026 · 11/17, 09:12', selected: true },
                { letter: 'B', label: 'Work list', state: 'Ready', tone: 'done', who: 'Jan Kowalski', when: '08/01 - 10/31/2026 · 11/16, 15:40' },
                { letter: 'A', label: 'Quick overview', state: 'No AI comment', tone: 'partial', who: 'Anna Nowak', when: '08/01 - 10/31/2026 · 11/14, 08:05' },
            ],
        },
        meta: [
            { label: 'Salesperson', value: 'Jan Kowalski' },
            { label: 'Period', value: '08/01/2026 - 10/31/2026' },
            { label: 'Run', value: '11/17/2026, 09:12' },
        ],
        section: 'Upsell - what customers do not buy, but similar customers do',
        sectionNote: '(first 3 of 14)',
        columns: { lp: 'No.', client: 'Customer', buys: 'Buys', gaps: 'Does not buy, similar customers do', proposal: 'Proposal', turnover: '12-month turnover' },
        rows: [
            {
                lp: '1',
                client: 'Example Wholesale Ltd.',
                buys: [{ category: 'Hollow sections', share: '62%' }, { category: 'Angles', share: '21%' }],
                gaps: 'Sheets (68% of similar), Tubes (54% of similar)',
                peers: 'Similar: steel wholesalers, 9 firms',
                proposal: 'With the next hollow section order, add 3 mm sheet and 40x2 galvanised tube - similar wholesalers buy them together.',
                turnover: 'PLN 412,300',
                selected: true,
            },
            {
                lp: '2',
                client: 'Test Shop',
                badge: 'Single product',
                buys: [{ category: 'Rebar', share: '88%' }],
                gaps: 'Reinforcing mesh (61% of similar)',
                peers: 'Similar: builders merchants, 14 firms',
                proposal: 'Offer reinforcing mesh on the same truck as the next rebar delivery.',
                turnover: 'PLN 38,900',
            },
            {
                lp: '3',
                client: 'Sample Company',
                flags: '2 overdue · PLN 4,120 · up to 18 days',
                buys: [{ category: 'Sheets', share: '54%' }, { category: 'Flat bars', share: '30%' }],
                gaps: 'Angles (57% of similar)',
                peers: 'Similar: metal workshops, 11 firms',
                proposal: 'Settle the overdue invoices first, then offer angles with the next sheet order.',
                turnover: 'PLN 96,450',
            },
        ],
        draft: {
            title: 'Offer draft',
            client: 'Example Wholesale Ltd.',
            ai: 'AI',
            note: 'Model on the company server, based on 12 months of purchases. Check before sending.',
            columns: { product: 'Product', qty: 'Qty', unit: 'Unit', price: 'Net price', value: 'Value' },
            lines: [
                { product: 'Square tube 40x40x2 galvanised 6 m', qty: '40', unit: 'pcs', price: 'PLN 68.40', value: 'PLN 2,736.00' },
                { product: 'Plain sheet 3 mm 1250x2500', qty: '6', unit: 'pcs', price: 'PLN 412.00', value: 'PLN 2,472.00', ai: true, why: 'similar customers buy it' },
                { product: 'Round tube 40x2 galvanised 6 m', qty: '20', unit: 'pcs', price: 'PLN 74.90', value: 'PLN 1,498.00', ai: true, why: 'similar customers buy it' },
            ],
            totalLabel: 'Total',
            total: 'PLN 6,706.00 net',
            letter: 'Hello, here is our offer for the hollow sections. I added 3 mm sheet and galvanised tubes, which usually go into the same jobs.',
            insert: 'Insert offer',
            discard: 'Discard',
        },
        footer: 'Report generated for Jan Kowalski. Employees must keep information obtained in the course of their duties confidential.',
    },
};

export const CASE_MOCKUP: { pl: CaseMockupText; en: CaseMockupText } = { pl, en };
