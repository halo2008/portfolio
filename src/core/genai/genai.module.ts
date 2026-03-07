import { Module, Global } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

export const GOOGLE_GENAI = 'GOOGLE_GENAI';

@Global()
@Module({
    providers: [
        {
            provide: GOOGLE_GENAI,
            useFactory: () => {
                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) {
                    throw new Error('CRITICAL: GEMINI_API_KEY is missing.');
                }
                return new GoogleGenAI({
                    apiKey,
                    httpOptions: { apiVersion: 'v1beta' }
                });
            },
        },
    ],
    exports: [GOOGLE_GENAI],
})
export class GenAiModule { }
