export type TrkcCallType = 'incoming' | 'outgoing' | 'missed' | 'rejected';

export interface TrkcCall { name: string; number: string; date: string; type: TrkcCallType }

export interface TrackerCaseMockupLocale {
    aria: { crmApp: string; labels: string };
    clock: string;
    crmApp: {
        numberLabel: string;
        dateLabel: string;
        calls: TrkcCall[];
    };
    labels: {
        user: string;
        database: string;
        product: string;
        receivedLabel: string;
        received: string;
        printerStatus: string;
        printerMac: string;
        label: { name: string; quantity: string; code: string };
        copiesPrompt: string;
        copiesLabel: string;
        copies: string;
        cancel: string;
        print: string;
    };
}

const CALLS: TrkcCall[] = [
    { name: 'Hurtownia Przykładowa', number: '+48 ••• ••• 214', date: '17-11-2026 09:42:13', type: 'incoming' },
    { name: 'Sklep Testowy', number: '+48 ••• ••• 587', date: '17-11-2026 09:15:40', type: 'outgoing' },
    { name: 'Jan Kowalski', number: '+48 ••• ••• 903', date: '17-11-2026 08:51:07', type: 'missed' },
    { name: 'Magazyn Demo', number: '+48 ••• ••• 362', date: '16-11-2026 16:28:55', type: 'outgoing' },
    { name: 'Firma Testowa Sp. z o.o.', number: '+48 ••• ••• 741', date: '16-11-2026 14:03:22', type: 'rejected' }
];

export const TRACKER_CASE_MOCKUP: { pl: TrackerCaseMockupLocale; en: TrackerCaseMockupLocale } = {
    pl: {
        aria: {
            crmApp: 'Makieta aplikacji handlowca na Androida: rejestr połączeń, w którym każda rozmowa jest przypisana do klienta z centrali, z ikoną typu połączenia i przyciskiem oddzwonienia. Dane demonstracyjne.',
            labels: 'Makieta aplikacji magazynowej na Androida: podgląd etykiety z kodem QR, drukarka Zebra połączona przez Bluetooth i przycisk Wydrukuj z liczbą kopii. Dane demonstracyjne.'
        },
        clock: '9:41',
        crmApp: {
            numberLabel: 'Numer:',
            dateLabel: 'Data:',
            calls: CALLS
        },
        labels: {
            user: 'Zalogowany: M12',
            database: 'Baza testowa',
            product: 'Profil DEMO 40x40',
            receivedLabel: 'Ilość przyjęta:',
            received: '24.0 szt',
            printerStatus: 'Status: Połączono....',
            printerMac: 'AC:3F:A4:••:••:12',
            label: { name: 'Profil DEMO 40x40', quantity: 'Ilość: 24.0', code: 'Kod QR: DEMO-0412' },
            copiesPrompt: 'Podaj liczbę kopii do wydrukowania',
            copiesLabel: 'Ilość kopii',
            copies: '2',
            cancel: 'Anuluj',
            print: 'Wydrukuj'
        }
    },
    en: {
        aria: {
            crmApp: 'Mockup of the salesperson Android app: a call log where every conversation is matched to a client from head office, with the call type icon and a call-back button. Demo data.',
            labels: 'Mockup of the warehouse Android app: a QR label preview, a Zebra printer connected over Bluetooth and a Print button with the number of copies. Demo data.'
        },
        clock: '9:41',
        crmApp: {
            numberLabel: 'Number:',
            dateLabel: 'Date:',
            calls: CALLS
        },
        labels: {
            user: 'Logged in: M12',
            database: 'Test database',
            product: 'DEMO profile 40x40',
            receivedLabel: 'Received qty:',
            received: '24.0 pcs',
            printerStatus: 'Status: Connected....',
            printerMac: 'AC:3F:A4:••:••:12',
            label: { name: 'DEMO profile 40x40', quantity: 'Qty: 24.0', code: 'QR code: DEMO-0412' },
            copiesPrompt: 'Enter the number of copies to print',
            copiesLabel: 'Copies',
            copies: '2',
            cancel: 'Cancel',
            print: 'Print'
        }
    }
};
