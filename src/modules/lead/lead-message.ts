export interface Lead {
    name: string;
    email: string;
    message: string;
    service?: string;
    language?: string;
}

const escapeSlackText = (text: string): string =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const formatLeadMessage = (lead: Lead): string =>
    [
        '💼 *New lead from ks-infra.dev*',
        `*Name:* ${escapeSlackText(lead.name)}`,
        `*Email:* ${escapeSlackText(lead.email)}`,
        `*Service:* ${escapeSlackText(lead.service ?? 'not specified')}`,
        `*Language:* ${lead.language ?? 'unknown'}`,
        '',
        escapeSlackText(lead.message),
    ].join('\n');
