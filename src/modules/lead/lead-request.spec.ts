import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { LeadRequestDto } from './lead.controller';

// The same options as the global pipe in main.ts: unknown fields are rejected.
const pipe = new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true });
const validate = (body: object) => pipe.transform(body, { type: 'body', metatype: LeadRequestDto });
const lead = { name: 'Jan Test', email: 'jan@example.com', message: 'Proszę o kontakt w sprawie analizy.' };

describe('LeadRequestDto', () => {
    it('accepts the source of the visit sent by the form', async () => {
        const body = { ...lead, source: 'tiktok', medium: 'video', campaign: 'film01', content: 'a', landing: '/nakladka-subiekt-gt/', referrer: 'www.tiktok.com' };

        await expect(validate(body)).resolves.toMatchObject(body);
    });

    it('rejects a source longer than 200 characters', async () => {
        await expect(validate({ ...lead, campaign: 'x'.repeat(201) })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('still rejects fields it does not know', async () => {
        await expect(validate({ ...lead, utm_source: 'tiktok' })).rejects.toBeInstanceOf(BadRequestException);
    });
});
