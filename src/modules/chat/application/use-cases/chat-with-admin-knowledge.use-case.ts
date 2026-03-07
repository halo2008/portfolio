import { Injectable, Logger, Inject } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import {
    KNOWLEDGE_REPO_PORT,
    KnowledgeRepoPort,
    RagSecurityContext,
} from '../../../knowledge/domain/ports/knowledge-repo.port';
import { GOOGLE_GENAI } from '../../../../core/genai/genai.module';

export interface ChatWithAdminKnowledgeInput {
    message: string;
    sessionId: string;
}

export interface ChatWithAdminKnowledgeOutput {
    response: string;
    detectedLanguage: 'pl' | 'en';
}

@Injectable()
export class ChatWithAdminKnowledgeUseCase {
    private readonly logger = new Logger(ChatWithAdminKnowledgeUseCase.name);
    private readonly MODEL_NAME = 'gemini-3-flash-preview';

    constructor(
        @Inject(KNOWLEDGE_REPO_PORT)
        private readonly knowledgeRepo: KnowledgeRepoPort,
        @Inject(GOOGLE_GENAI) private readonly ai: GoogleGenAI,
    ) { }

    async execute(
        input: ChatWithAdminKnowledgeInput,
        context: RagSecurityContext,
    ): Promise<ChatWithAdminKnowledgeOutput> {
        const { message, sessionId } = input;

        const detectedLanguage = this.detectLanguage(message);

        this.logger.log({
            msg: 'Main page chat query',
            sessionId: this.anonymizeSessionId(sessionId),
            detectedLanguage,
            messageLength: message.length,
        });

        const embedding = await this.generateEmbedding(message);

        // CRITICAL: Query ONLY admin knowledge - never user-specific vectors
        const knowledgeContext = await this.knowledgeRepo.searchAdminKnowledge(
            embedding,
            context,
        );

        const response = await this.generateResponse(
            message,
            knowledgeContext,
            detectedLanguage,
        );

        return {
            response,
            detectedLanguage,
        };
    }

    private detectLanguage(message: string): 'pl' | 'en' {
        const lowerMessage = message.toLowerCase();

        const polishChars = /[ąćęłńóśźż]/;
        const polishWords = /\b(jak|co|gdzie|kiedy|dlaczego|czy|jest|są|tego|tym|dla|nie|tak|proszę|dziękuję)\b/;

        if (polishChars.test(lowerMessage) || polishWords.test(lowerMessage)) {
            return 'pl';
        }

        return 'en';
    }

    private async generateEmbedding(text: string): Promise<number[]> {
        try {
            this.logger.debug({
                msg: 'Generating embedding for query',
                textLength: text.length,
            });

            const result = await this.ai.models.embedContent({
                model: 'gemini-embedding-001',
                contents: [{ text }],
                config: { taskType: 'RETRIEVAL_QUERY', outputDimensionality: 768 },
            });

            const embedding = result.embeddings?.[0]?.values;

            if (!embedding) {
                throw new Error('Failed to generate embedding: empty result');
            }

            return embedding;
        } catch (error) {
            this.logger.error({
                msg: 'Embedding generation failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    private async generateResponse(
        message: string,
        context: string,
        language: 'pl' | 'en',
    ): Promise<string> {
        const systemPrompt = this.buildSystemPrompt(context, language);

        try {
            this.logger.debug({
                msg: 'Generating chat response',
                model: this.MODEL_NAME,
                language,
                contextLength: context.length,
            });

            const response = await this.ai.models.generateContent({
                model: this.MODEL_NAME,
                contents: [{ role: 'user', parts: [{ text: message }] }],
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                },
            });

            const text = response.text;

            if (!text) {
                throw new Error('Empty response from Gemini model');
            }

            return text;
        } catch (error) {
            this.logger.error({
                msg: 'Response generation failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            });

            return language === 'pl'
                ? 'Przepraszam, wystąpił błąd podczas generowania odpowiedzi. Spróbuj ponownie później.'
                : 'Sorry, an error occurred while generating the response. Please try again later.';
        }
    }

    private buildSystemPrompt(context: string, language: 'pl' | 'en'): string {
        const basePrompt = `You are answering from the official ks-infra.dev knowledge base.`;

        if (language === 'pl') {
            return `${basePrompt}

ZASADY:
1. Odpowiadaj wyłącznie na podstawie poniższego KONTEKSTU.
2. Jeśli odpowiedzi nie ma w KONTEKŚCIE, przyznaj to uprzejmie po polsku.
3. Odpowiadaj zawsze po polsku.
4. Bądź zwięzły i profesjonalny.

KONTEKST:
${context || 'Brak dostępnych informacji w bazie wiedzy.'}`;
        }

        return `${basePrompt}

RULES:
1. Answer ONLY based on the CONTEXT below.
2. If the answer is not in the CONTEXT, admit it politely.
3. Always respond in English.
4. Be concise and professional.

CONTEXT:
${context || 'No specific information found in the knowledge base.'}`;
    }

    private anonymizeSessionId(sessionId: string): string {
        return sessionId.slice(0, 8) + '...';
    }
}
