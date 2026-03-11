import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import type { OfferSourcePort } from '../../domain/ports/offer-source.port';
import { JobOffer } from '../../domain/entities/job-offer.entity';
import { Money } from '../../domain/value-objects/money.vo';

@Injectable()
export class GmailOfferSourceAdapter implements OfferSourcePort {
  private readonly logger = new Logger(GmailOfferSourceAdapter.name);

  private getGmailClient() {
    const oauth2 = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
    );
    oauth2.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });
    return google.gmail({ version: 'v1', auth: oauth2 });
  }

  async fetchNewOffers(): Promise<JobOffer[]> {
    const gmail = this.getGmailClient();

    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'from:useme.com is:unread newer_than:1d',
      maxResults: 20,
    });

    const messageIds = res.data.messages || [];
    this.logger.log(`Found ${messageIds.length} unread Useme emails`);

    const offers: JobOffer[] = [];

    for (const msg of messageIds) {
      try {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'full',
        });

        const offer = this.parseEmailToOffer(detail.data);
        if (offer) {
          offers.push(offer);
        }

        await gmail.users.messages.modify({
          userId: 'me',
          id: msg.id!,
          requestBody: { removeLabelIds: ['UNREAD'] },
        });
      } catch (error) {
        this.logger.warn(
          `Failed to parse email ${msg.id}: ${(error as Error).message}`,
        );
      }
    }

    return offers;
  }

  private parseEmailToOffer(message: any): JobOffer | null {
    const headers = message.payload?.headers || [];
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';

    const body = this.extractBody(message.payload);
    if (!body) return null;

    const urlMatch = body.match(/https:\/\/useme\.com\/pl\/jobs\/[^\s"<>]+/);
    const url = urlMatch ? urlMatch[0] : '';

    const idMatch = url.match(/\/(\d+)\/?/);
    const externalId = idMatch ? idMatch[1] : message.id;

    const budget = this.parseBudget(body);

    return new JobOffer({
      externalId,
      title: this.cleanSubject(subject),
      description: this.cleanBody(body),
      budget,
      category: this.extractCategory(body),
      url,
      postedAt: new Date(parseInt(message.internalDate, 10)),
    });
  }

  private extractBody(payload: any): string {
    if (!payload) return '';

    if (payload.mimeType === 'text/plain' && payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    if (payload.mimeType === 'text/html' && payload.body?.data) {
      const html = Buffer.from(payload.body.data, 'base64').toString('utf-8');
      return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
      for (const part of payload.parts) {
        const result = this.extractBody(part);
        if (result) return result;
      }
    }

    return '';
  }

  private cleanSubject(subject: string): string {
    return subject
      .replace(/^(Re:|Fwd:|Nowe zlecenie[:\s]*)/gi, '')
      .trim();
  }

  private cleanBody(body: string): string {
    return body
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 3000);
  }

  private extractCategory(body: string): string {
    const catMatch = body.match(/Kategoria:\s*([^\n]+)/i);
    return catMatch ? catMatch[1].trim() : 'IT';
  }

  private parseBudget(text: string): Money | null {
    const match = text.match(/([\d\s,.]+)\s*(PLN|USD|EUR|zł)/i);
    if (!match) return null;

    const amount = parseFloat(match[1].replace(/\s/g, '').replace(',', '.'));
    let currency = match[2].toUpperCase();
    if (currency === 'ZŁ') currency = 'PLN';

    if (isNaN(amount)) return null;
    return new Money(amount, currency);
  }
}
