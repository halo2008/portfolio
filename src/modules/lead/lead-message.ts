export interface Lead {
    name: string;
    email: string;
    message: string;
    service?: string;
    language?: string;
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    landing?: string;
    referrer?: string;
}

const escapeSlackText = (text: string): string =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const formatSource = (lead: Lead): string => {
    if (!lead.source) return `not tagged${lead.landing ? ` · landing ${escapeSlackText(lead.landing)}` : ''}`;
    const parts = [lead.source, lead.medium, lead.campaign, lead.content].filter((part): part is string => Boolean(part));
    const extra = [
        lead.landing ? `landing ${lead.landing}` : '',
        lead.referrer && lead.referrer !== lead.source ? `referrer ${lead.referrer}` : '',
    ].filter(Boolean);
    return escapeSlackText([parts.join(' / '), ...extra].join(' · '));
};

export const formatLeadMessage = (lead: Lead): string =>
    [
        '💼 *New lead from ks-infra.dev*',
        `*Name:* ${escapeSlackText(lead.name)}`,
        `*Email:* ${escapeSlackText(lead.email)}`,
        `*Service:* ${escapeSlackText(lead.service ?? 'not specified')}`,
        `*Language:* ${lead.language ?? 'unknown'}`,
        `*Source:* ${formatSource(lead)}`,
        '',
        escapeSlackText(lead.message),
    ].join('\n');
