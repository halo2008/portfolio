import { formatLeadMessage } from './lead-message';

describe('formatLeadMessage', () => {
    it('neutralises Slack control sequences in visitor input', () => {
        const text = formatLeadMessage({
            name: '<!channel>',
            email: 'a@b.pl',
            message: 'Hi <@U123> & <https://evil.example|click>',
        });

        expect(text).not.toContain('<!channel>');
        expect(text).not.toContain('<@U123>');
        expect(text).toContain('&lt;!channel&gt;');
        expect(text).toContain('&amp;');
        expect(text).toContain('*Service:* not specified');
        expect(text).toContain('*Source:* not tagged');
    });

    it('credits the source of a tagged visit and escapes it', () => {
        const text = formatLeadMessage({
            name: 'Jan',
            email: 'a@b.pl',
            message: 'Proszę o kontakt',
            source: 'tiktok',
            medium: 'video',
            campaign: 'film01<!channel>',
            landing: '/nakladka-subiekt-gt/',
            referrer: 'www.tiktok.com',
        });

        expect(text).toContain('*Source:* tiktok / video / film01&lt;!channel&gt; · landing /nakladka-subiekt-gt/ · referrer www.tiktok.com');
        expect(text).not.toContain('<!channel>');
    });

    it('shows the landing page of an untagged visit', () => {
        const text = formatLeadMessage({ name: 'Jan', email: 'a@b.pl', message: 'Proszę o kontakt', landing: '/en/' });

        expect(text).toContain('*Source:* not tagged · landing /en/');
    });
});
