import { Injectable, Logger, Inject } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import {
    KNOWLEDGE_REPO_PORT,
    KnowledgeRepoPort,
    RagSecurityContext,
} from '../../../knowledge/domain/ports/knowledge-repo.port';
import { GOOGLE_GENAI } from '../../../../core/genai/genai.module';
import { AdminSettingsService } from '../../../knowledge/application/services/admin-settings.service';

export interface ChatWithAdminKnowledgeInput {
    message: string;
    sessionId: string;
}

export interface ChatWithAdminKnowledgeOutput {
    response: string;
    detectedLanguage: 'pl' | 'en';
    timings: {
        embeddingMs: number;
        searchMs: number;
        llmMs: number;
        totalMs: number;
    };
}

@Injectable()
export class ChatWithAdminKnowledgeUseCase {
    private readonly logger = new Logger(ChatWithAdminKnowledgeUseCase.name);
    private readonly FALLBACK_MODEL = 'gemini-3.1-flash-lite-preview';

    constructor(
        @Inject(KNOWLEDGE_REPO_PORT)
        private readonly knowledgeRepo: KnowledgeRepoPort,
        @Inject(GOOGLE_GENAI) private readonly ai: GoogleGenAI,
        private readonly adminSettings: AdminSettingsService,
    ) { }

    async execute(
        input: ChatWithAdminKnowledgeInput,
        context: RagSecurityContext,
    ): Promise<ChatWithAdminKnowledgeOutput> {
        const { message, sessionId } = input;

        const detectedLanguage = this.detectLanguage(message);
        const totalStart = Date.now();

        this.logger.log({
            msg: 'Main page chat query',
            sessionId: this.anonymizeSessionId(sessionId),
            detectedLanguage,
            messageLength: message.length,
        });

        const settings = await this.adminSettings.getSettings();

        const embeddingStart = Date.now();
        const embedding = await this.generateEmbedding(message);
        const embeddingMs = Date.now() - embeddingStart;

        // CRITICAL: Query ONLY admin knowledge - never user-specific vectors
        const searchStart = Date.now();
        const knowledgeContext = await this.knowledgeRepo.searchAdminKnowledge(
            embedding,
            context,
            settings.scoreThreshold,
        );
        const searchMs = Date.now() - searchStart;

        const llmStart = Date.now();
        const response = await this.generateResponse(
            message,
            knowledgeContext,
            detectedLanguage,
            settings.systemPrompt,
            settings.modelName,
        );
        const llmMs = Date.now() - llmStart;
        const totalMs = Date.now() - totalStart;

        const timings = { embeddingMs, searchMs, llmMs, totalMs };
        this.logger.log({ timings }, 'Main page chat timings');

        return {
            response,
            detectedLanguage,
            timings,
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
        adminSystemPrompt?: string,
        modelName?: string,
    ): Promise<string> {
        const systemPrompt = this.buildSystemPrompt(context, language, adminSystemPrompt);
        const model = modelName || this.FALLBACK_MODEL;

        try {
            this.logger.debug({
                msg: 'Generating chat response',
                model,
                language,
                contextLength: context.length,
            });

            const response = await this.ai.models.generateContent({
                model,
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

    private buildSystemPrompt(context: string, language: 'pl' | 'en', adminSystemPrompt?: string): string {
        const basePrompt = `You are answering from the official ks-infra.dev knowledge base.`;

        const adminInstructions = adminSystemPrompt?.trim()
            ? `\n\nADMIN INSTRUCTIONS (tone & behavior):\n${adminSystemPrompt.trim()}`
            : '';

        if (language === 'pl') {
            return `${basePrompt}

ZASADY:
1. Odpowiadaj wyłącznie na podstawie poniższego KONTEKSTU.
2. Jeśli odpowiedzi nie ma w KONTEKŚCIE, przyznaj to uprzejmie po polsku.
3. Odpowiadaj zawsze po polsku.
4. Bądź zwięzły i profesjonalny.${adminInstructions}

KONTEKST:
${context || 'Brak dostępnych informacji w bazie wiedzy.'}`;
        }

        return `${basePrompt}

RULES:
1. Answer ONLY based on the CONTEXT below.
2. If the answer is not in the CONTEXT, admit it politely.
3. Always respond in English.
4. Be concise and professional.${adminInstructions}

CONTEXT:
${context || 'No specific information found in the knowledge base.'}`;
    }

    private anonymizeSessionId(sessionId: string): string {
        return sessionId.slice(0, 8) + '...';
    }
}
