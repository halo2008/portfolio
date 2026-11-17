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
    });
});
