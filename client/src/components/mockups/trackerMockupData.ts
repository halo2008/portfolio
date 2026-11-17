export type TrkScreen = 'dashboard' | 'calls' | 'route' | 'crmClient' | 'printDoc' | 'zebraLabel';

export type TrkIcon =
    | 'home' | 'badge' | 'personSearch' | 'calendar' | 'handshake' | 'inventory' | 'storefront' | 'cart'
    | 'shipping' | 'warehouse' | 'quiz' | 'support' | 'news' | 'inbox' | 'route' | 'more' | 'sparkle'
    | 'person' | 'personAdd' | 'sort' | 'search' | 'call' | 'sms' | 'back' | 'refresh' | 'chevronLeft'
    | 'chevronRight' | 'dropDown' | 'edit' | 'close' | 'add' | 'star' | 'mail' | 'description' | 'download'
    | 'print' | 'lock' | 'map' | 'bluetooth';

export type TrkCallType = 'incoming' | 'outgoing' | 'missed' | 'rejected';

export type TrkTone = 'active' | 'success' | 'plan';

export interface TrkNavItem { icon: TrkIcon; on?: boolean }

export interface TrkTile { label: string; icon: TrkIcon; color: string }

export interface TrkPinned extends TrkTile { module: string }

export interface TrkInteraction { category: 'call' | 'sms'; phone: string; type: TrkCallType; at: string; details: string }

export interface TrkField { label: string; value: string }

export interface TrkOrder { number: string; status: string; tone: TrkTone; customer: string; cargo: string; sell: string }

export interface TrkInteractionLog { kind: 'call' | 'sms'; at: string; phone: string }

export interface TrackerMockupLocale {
    aria: Record<TrkScreen, string>;
    clock: string;
    dashboard: {
        tenant: string;
        gateway: string;
        pinnedTitle: string;
        edit: string;
        allModules: string;
        pinned: TrkPinned[];
        modules: TrkTile[];
        nav: TrkNavItem[];
    };
    calls: {
        title: string;
        description: string;
        search: string;
        categories: Record<TrkInteraction['category'], string>;
        count: string;
        pageSize: string;
        pageOf: string;
        assign: string;
        types: Record<TrkCallType, string>;
        rows: TrkInteraction[];
        nav: TrkNavItem[];
    };
    route: {
        trip: string;
        status: string;
        tracking: {
            title: string;
            refresh: string;
            statusLabel: string;
            statusValue: string;
            lastLabel: string;
            lastValue: string;
            coordinates: string;
            rows: TrkField[];
        };
        executor: { title: string; rows: TrkField[] };
        settlement: { title: string; rows: TrkField[] };
        orders: { title: string; open: string; rows: TrkOrder[] };
        nav: TrkNavItem[];
    };
    crmClient: {
        title: string;
        managers: { title: string; name: string; primary: string; email: string };
        contacts: { title: string; name: string; primary: string; phone: string; email: string };
        lastContact: { title: string; date: string; who: string; withWhom: string; pageOf: string; rows: TrkInteractionLog[] };
        nav: TrkNavItem[];
    };
    printDoc: {
        symbol: string;
        typeLine: string;
        status: string;
        category: string;
        tiles: TrkField[];
        pending: TrkField;
        positions: { title: string; count: string; add: string; empty: string };
        details: TrkField[];
        cancel: string;
        send: string;
        nav: TrkNavItem[];
    };
    zebraLabel: {
        title: string;
        product: string;
        receivedLabel: string;
        received: string;
        printer: { title: string; model: string; statusLabel: string; status: string; mac: string };
        preview: { title: string; name: string; quantity: string; code: string };
        copiesLabel: string;
        copies: string;
        cancel: string;
        print: string;
        nav: TrkNavItem[];
    };
}

const MODULE_COLORS = {
    hr: '#1E40AF',
    recruitment: '#0E7490',
    calendar: '#4F46E5',
    crm: '#7B1FA2',
    assets: '#0E7490',
    catalog: '#0F766E',
    sales: '#D97706',
    logistics: '#C2410C',
    warehouse: '#1E3A8A',
    surveys: '#7C3AED',
    tickets: '#0EA5E9',
    news: '#E11D48'
} as const;

const moduleTiles = (labels: Record<keyof typeof MODULE_COLORS, string>): TrkTile[] => [
    { label: labels.hr, icon: 'badge', color: MODULE_COLORS.hr },
    { label: labels.recruitment, icon: 'personSearch', color: MODULE_COLORS.recruitment },
    { label: labels.calendar, icon: 'calendar', color: MODULE_COLORS.calendar },
    { label: labels.crm, icon: 'handshake', color: MODULE_COLORS.crm },
    { label: labels.assets, icon: 'inventory', color: MODULE_COLORS.assets },
    { label: labels.catalog, icon: 'storefront', color: MODULE_COLORS.catalog },
    { label: labels.sales, icon: 'cart', color: MODULE_COLORS.sales },
    { label: labels.logistics, icon: 'shipping', color: MODULE_COLORS.logistics },
    { label: labels.warehouse, icon: 'warehouse', color: MODULE_COLORS.warehouse },
    { label: labels.surveys, icon: 'quiz', color: MODULE_COLORS.surveys },
    { label: labels.tickets, icon: 'support', color: MODULE_COLORS.tickets },
    { label: labels.news, icon: 'news', color: MODULE_COLORS.news }
];

const DASHBOARD_NAV: TrkNavItem[] = [{ icon: 'home', on: true }, { icon: 'badge' }, { icon: 'personSearch' }, { icon: 'more' }];
const CALLS_NAV: TrkNavItem[] = [{ icon: 'home' }, { icon: 'handshake' }, { icon: 'inbox', on: true }, { icon: 'more' }];
const ROUTE_NAV: TrkNavItem[] = [{ icon: 'home' }, { icon: 'route', on: true }, { icon: 'more' }];
const CLIENT_NAV: TrkNavItem[] = [{ icon: 'home' }, { icon: 'handshake', on: true }, { icon: 'inbox' }, { icon: 'more' }];
const WMS_NAV: TrkNavItem[] = [{ icon: 'home' }, { icon: 'warehouse' }, { icon: 'map' }, { icon: 'more' }];

const CLIENT_LOG: TrkInteractionLog[] = [
    { kind: 'call', at: '17.11.26 14:12', phone: '••• ••• 214' },
    { kind: 'sms', at: '17.11.26 13:40', phone: '••• ••• 214' },
    { kind: 'call', at: '17.11.26 09:05', phone: '••• ••• 587' },
    { kind: 'call', at: '16.11.26 16:48', phone: '••• ••• 214' },
    { kind: 'sms', at: '16.11.26 11:22', phone: '••• ••• 587' },
    { kind: 'call', at: '15.11.26 10:31', phone: '••• ••• 214' },
    { kind: 'call', at: '14.11.26 15:17', phone: '••• ••• 214' }
];

const TENANT = 'Hurtownia Przykładowa';
const COORDINATES = '••,•••••, ••,•••••';

export const TRACKER_MOCKUP: { pl: TrackerMockupLocale; en: TrackerMockupLocale } = {
    pl: {
        aria: {
            dashboard: 'Ekran startowy aplikacji ErpTracker na Androidzie: przypięte widoki Bufor i Przejazdy oraz siatka modułów (dane demonstracyjne).',
            calls: 'Bufor interakcji w ErpTracker: połączenia i SMS-y z nieznanych numerów, każde z przyciskiem Przypisz do kontaktu w CRM (dane demonstracyjne).',
            route: 'Szczegóły przejazdu w ErpTracker: aktywne śledzenie GPS z ostatnim pomiarem, dokładnością i prędkością oraz dane wykonawcy (dane demonstracyjne).',
            crmClient: 'Karta klienta w CRM ErpTracker: opiekun, osoba kontaktowa i sekcja Ostatni kontakt z połączeniami i SMS-ami zapisanymi automatycznie z telefonu handlowca (dane demonstracyjne).',
            printDoc: 'Dokument magazynowy WZ w ErpTracker z przyciskiem Drukuj w nagłówku, który otwiera PDF dokumentu do wydruku (dane demonstracyjne).',
            zebraLabel: 'Drukowanie etykiety z telefonu: produkt Profil DEMO 40x40, drukarka Zebra połączona przez Bluetooth, podgląd etykiety z kodem QR, 2 kopie i przycisk Wydrukuj (dane demonstracyjne).'
        },
        clock: '14:32',
        dashboard: {
            tenant: TENANT,
            gateway: 'Online',
            pinnedTitle: 'Przypięte',
            edit: 'Edytuj',
            allModules: 'Wszystkie moduły',
            pinned: [
                { label: 'Bufor', module: 'CRM', icon: 'inbox', color: MODULE_COLORS.crm },
                { label: 'Przejazdy', module: 'Logistyka', icon: 'route', color: MODULE_COLORS.logistics }
            ],
            modules: moduleTiles({
                hr: 'HR', recruitment: 'Rekrutacja', calendar: 'Kalendarz', crm: 'CRM', assets: 'Aktywa firmowe',
                catalog: 'Towary i usługi', sales: 'Sprzedaż', logistics: 'Logistyka', warehouse: 'Magazyn',
                surveys: 'Ankiety', tickets: 'Zgłoszenia', news: 'Nowości'
            }),
            nav: DASHBOARD_NAV
        },
        calls: {
            title: 'Bufor interakcji',
            description: 'Interakcje nieprzypisane do żadnego kontaktu',
            search: 'Szukaj po numerze telefonu',
            categories: { call: 'Połączenie', sms: 'SMS' },
            count: 'Interakcje: 37',
            pageSize: '20 na stronę',
            pageOf: '1 z 2',
            assign: 'Przypisz',
            types: { incoming: 'Przychodzące', outgoing: 'Wychodzące', missed: 'Nieodebrane', rejected: 'Odrzucone' },
            rows: [
                { category: 'call', phone: '+48 ••• ••• 214', type: 'incoming', at: '17.11.26, 14:12', details: '4m 18s' },
                { category: 'sms', phone: '+48 ••• ••• 587', type: 'incoming', at: '17.11.26, 13:40', details: 'Dzień dobry, proszę o ofertę na 40 palet. Sklep Testowy' },
                { category: 'call', phone: '+48 ••• ••• 903', type: 'missed', at: '17.11.26, 11:47', details: '-' },
                { category: 'call', phone: '+48 ••• ••• 341', type: 'outgoing', at: '17.11.26, 10:05', details: '12m 40s' },
                { category: 'sms', phone: '+48 ••• ••• 772', type: 'incoming', at: '16.11.26, 17:58', details: 'Potwierdzam dostawę na czwartek do 10:00.' },
                { category: 'call', phone: '+48 ••• ••• 118', type: 'rejected', at: '16.11.26, 16:21', details: '-' }
            ],
            nav: CALLS_NAV
        },
        route: {
            trip: 'PRZ/2026/11/014',
            status: 'W trasie',
            tracking: {
                title: 'Śledzenie',
                refresh: 'Odśwież',
                statusLabel: 'Status',
                statusValue: 'Śledzenie aktywne',
                lastLabel: 'Ostatni pomiar',
                lastValue: '12 s temu · 17.11.2026 14:31',
                coordinates: COORDINATES,
                rows: [
                    { label: 'Dokładność', value: '±4,8 m' },
                    { label: 'Prędkość', value: '63 km/h' },
                    { label: 'Zlecenia', value: 'ZL/0412, ZL/0415' }
                ]
            },
            executor: {
                title: 'Wykonawca',
                rows: [
                    { label: 'Typ wykonawcy', value: 'Flota własna' },
                    { label: 'Firma', value: TENANT },
                    { label: 'Rejestracja', value: 'DEMO 0214' },
                    { label: 'Kierowca', value: 'Anna Nowak · +48 ••• ••• 214' },
                    { label: 'Planowany wyjazd', value: '17.11.2026' }
                ]
            },
            settlement: {
                title: 'Rozliczenie',
                rows: [
                    { label: 'Podział kosztu', value: 'Wg wagi' },
                    { label: 'Koszt rozdzielony', value: 'Nie' }
                ]
            },
            orders: {
                title: 'Wpięte zlecenia · 2 · 1 840 kg · 6,4 LDM',
                open: 'Otwórz zlecenie',
                rows: [
                    { number: 'ZL/0412', status: 'W drodze', tone: 'active', customer: 'Sklep Testowy', cargo: '1 120 kg · 3,8 LDM', sell: '1 450,00 zł' },
                    { number: 'ZL/0415', status: 'W drodze', tone: 'active', customer: 'Hurtownia Demo', cargo: '720 kg · 2,6 LDM', sell: '980,00 zł' }
                ]
            },
            nav: ROUTE_NAV
        },
        crmClient: {
            title: TENANT,
            managers: { title: 'Opiekunowie', name: 'Anna Nowak', primary: 'Główny', email: 'anna.nowak@example.com' },
            contacts: { title: 'Kontakty', name: 'Jan Kowalski', primary: 'Główny', phone: '+48 ••• ••• 214', email: 'jan.kowalski@example.com' },
            lastContact: { title: 'Ostatni kontakt', date: 'Data', who: 'Kto', withWhom: 'Z kim', pageOf: '1 z 4', rows: CLIENT_LOG },
            nav: CLIENT_NAV
        },
        printDoc: {
            symbol: 'WZ/0412/26',
            typeLine: 'WZ · Wydanie zewnętrzne',
            status: 'Szkic',
            category: 'Wychodzące',
            tiles: [
                { label: 'Magazyn', value: 'Magazyn Główny' },
                { label: 'Planowana data realizacji', value: '18.11.2026' },
                { label: 'Utworzony przez', value: 'Jan Kowalski' }
            ],
            pending: { label: 'Realizowany przez', value: 'Oczekuje na magazyniera' },
            positions: { title: 'POZYCJE', count: '0 / 0', add: 'Dodaj pozycję', empty: 'Brak pozycji' },
            details: [
                { label: 'Data utworzenia', value: '17.11.2026, 09:14' },
                { label: 'Notatki', value: 'DEMO-0412 dla Sklep Testowy' }
            ],
            cancel: 'Anuluj dokument',
            send: 'Wyślij do magazynu',
            nav: WMS_NAV
        },
        zebraLabel: {
            title: 'Drukuj etykietę',
            product: 'Profil DEMO 40x40',
            receivedLabel: 'Ilość przyjęta:',
            received: '24 szt',
            printer: { title: 'Drukarka', model: 'Zebra', statusLabel: 'Status:', status: 'Połączono', mac: 'AC:3F:A4:••:••:12' },
            preview: { title: 'Podgląd etykiety', name: 'Profil DEMO 40x40', quantity: 'Ilość: 24', code: 'Kod QR: DEMO-0412' },
            copiesLabel: 'Ilość kopii',
            copies: '2',
            cancel: 'Anuluj',
            print: 'Wydrukuj',
            nav: WMS_NAV
        }
    },
    en: {
        aria: {
            dashboard: 'ErpTracker Android home screen: pinned Buffer and Trips views and the module grid (demo data).',
            calls: 'ErpTracker interaction buffer: calls and texts from unknown numbers, each with an Assign button that links it to a CRM contact (demo data).',
            route: 'ErpTracker trip detail: live GPS tracking with the last reading, accuracy and speed, plus the executor details (demo data).',
            crmClient: 'ErpTracker CRM client card: account manager, contact person and the Last contact section listing calls and texts logged automatically from the sales rep phone (demo data).',
            printDoc: 'ErpTracker warehouse issue document (WZ) with the Print action in its header, which opens the document PDF for printing (demo data).',
            zebraLabel: 'Printing a label from the phone: DEMO profile 40x40, a Zebra printer connected over Bluetooth, a QR label preview, 2 copies and the Print button (demo data).'
        },
        clock: '14:32',
        dashboard: {
            tenant: TENANT,
            gateway: 'Online',
            pinnedTitle: 'Pinned',
            edit: 'Edit',
            allModules: 'All modules',
            pinned: [
                { label: 'Buffer', module: 'CRM', icon: 'inbox', color: MODULE_COLORS.crm },
                { label: 'Trips', module: 'Logistics', icon: 'route', color: MODULE_COLORS.logistics }
            ],
            modules: moduleTiles({
                hr: 'HR', recruitment: 'Recruitment', calendar: 'Calendar', crm: 'CRM', assets: 'Company assets',
                catalog: 'Goods and services', sales: 'Sales', logistics: 'Logistics', warehouse: 'Warehouse',
                surveys: 'Surveys', tickets: 'Tickets', news: 'News'
            }),
            nav: DASHBOARD_NAV
        },
        calls: {
            title: 'Interaction buffer',
            description: 'Interactions not assigned to any contact',
            search: 'Search by phone number',
            categories: { call: 'Call', sms: 'SMS' },
            count: 'Interactions: 37',
            pageSize: '20 per page',
            pageOf: '1 of 2',
            assign: 'Assign',
            types: { incoming: 'Incoming', outgoing: 'Outgoing', missed: 'Missed', rejected: 'Rejected' },
            rows: [
                { category: 'call', phone: '+48 ••• ••• 214', type: 'incoming', at: '17.11.26, 14:12', details: '4m 18s' },
                { category: 'sms', phone: '+48 ••• ••• 587', type: 'incoming', at: '17.11.26, 13:40', details: 'Hello, could you quote 40 pallets? Sklep Testowy' },
                { category: 'call', phone: '+48 ••• ••• 903', type: 'missed', at: '17.11.26, 11:47', details: '-' },
                { category: 'call', phone: '+48 ••• ••• 341', type: 'outgoing', at: '17.11.26, 10:05', details: '12m 40s' },
                { category: 'sms', phone: '+48 ••• ••• 772', type: 'incoming', at: '16.11.26, 17:58', details: 'Confirming Thursday delivery before 10:00.' },
                { category: 'call', phone: '+48 ••• ••• 118', type: 'rejected', at: '16.11.26, 16:21', details: '-' }
            ],
            nav: CALLS_NAV
        },
        route: {
            trip: 'PRZ/2026/11/014',
            status: 'In transit',
            tracking: {
                title: 'Tracking',
                refresh: 'Refresh',
                statusLabel: 'Status',
                statusValue: 'Tracking active',
                lastLabel: 'Last reading',
                lastValue: '12 s ago · 17.11.2026 14:31',
                coordinates: COORDINATES,
                rows: [
                    { label: 'Accuracy', value: '±4.8 m' },
                    { label: 'Speed', value: '63 km/h' },
                    { label: 'Orders', value: 'ZL/0412, ZL/0415' }
                ]
            },
            executor: {
                title: 'Executor',
                rows: [
                    { label: 'Executor type', value: 'Own fleet' },
                    { label: 'Company', value: TENANT },
                    { label: 'Registration', value: 'DEMO 0214' },
                    { label: 'Driver', value: 'Anna Nowak · +48 ••• ••• 214' },
                    { label: 'Planned departure', value: '17.11.2026' }
                ]
            },
            settlement: {
                title: 'Settlement',
                rows: [
                    { label: 'Cost split', value: 'By weight' },
                    { label: 'Cost allocated', value: 'No' }
                ]
            },
            orders: {
                title: 'Attached orders · 2 · 1,840 kg · 6.4 LDM',
                open: 'Open order',
                rows: [
                    { number: 'ZL/0412', status: 'In transit', tone: 'active', customer: 'Sklep Testowy', cargo: '1,120 kg · 3.8 LDM', sell: 'PLN 1,450.00' },
                    { number: 'ZL/0415', status: 'In transit', tone: 'active', customer: 'Hurtownia Demo', cargo: '720 kg · 2.6 LDM', sell: 'PLN 980.00' }
                ]
            },
            nav: ROUTE_NAV
        },
        crmClient: {
            title: TENANT,
            managers: { title: 'Managers', name: 'Anna Nowak', primary: 'Primary', email: 'anna.nowak@example.com' },
            contacts: { title: 'Contacts', name: 'Jan Kowalski', primary: 'Primary', phone: '+48 ••• ••• 214', email: 'jan.kowalski@example.com' },
            lastContact: { title: 'Last contact', date: 'Date', who: 'Who', withWhom: 'With whom', pageOf: '1 of 4', rows: CLIENT_LOG },
            nav: CLIENT_NAV
        },
        printDoc: {
            symbol: 'WZ/0412/26',
            typeLine: 'WZ · External issue',
            status: 'Draft',
            category: 'Outbound',
            tiles: [
                { label: 'Warehouse', value: 'Main warehouse' },
                { label: 'Planned completion date', value: '18.11.2026' },
                { label: 'Created by', value: 'Jan Kowalski' }
            ],
            pending: { label: 'Handled by', value: 'Waiting for warehouse operator' },
            positions: { title: 'POSITIONS', count: '0 / 0', add: 'Add position', empty: 'No positions' },
            details: [
                { label: 'Creation date', value: '17.11.2026, 09:14' },
                { label: 'Notes', value: 'DEMO-0412 for Sklep Testowy' }
            ],
            cancel: 'Cancel document',
            send: 'Send to warehouse',
            nav: WMS_NAV
        },
        zebraLabel: {
            title: 'Print label',
            product: 'DEMO profile 40x40',
            receivedLabel: 'Received qty:',
            received: '24 pcs',
            printer: { title: 'Printer', model: 'Zebra', statusLabel: 'Status:', status: 'Connected', mac: 'AC:3F:A4:••:••:12' },
            preview: { title: 'Label preview', name: 'DEMO profile 40x40', quantity: 'Qty: 24', code: 'QR code: DEMO-0412' },
            copiesLabel: 'Copies',
            copies: '2',
            cancel: 'Cancel',
            print: 'Print',
            nav: WMS_NAV
        }
    }
};
