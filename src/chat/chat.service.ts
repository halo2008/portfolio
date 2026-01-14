import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GoogleGenAI } from '@google/genai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { QDRANT_CLIENT } from '../qdrant/qdrant.provider';
import { SlackService } from '../slack/slack.service';
import { ConversationStateService } from './conversation-state.service';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);
    private genAI: GoogleGenAI;
    private readonly COLLECTION_NAME = 'portfolio';

    constructor(
        @Inject(QDRANT_CLIENT) private readonly qdrantClient: QdrantClient,
        private readonly slackService: SlackService,
        private readonly conversationState: ConversationStateService,
        private readonly httpService: HttpService,
    ) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            this.logger.error('CRITICAL: GEMINI_API_KEY is missing. AI Brain dead.');
        } else {
            this.genAI = new GoogleGenAI({ apiKey });
        }
    }

    async *generateResponseStream(userMessage: string, captchaToken: string, socketId?: string): AsyncGenerator<string> {
        if (!this.genAI) {
            yield "System Error: AI Brain not connected.";
            return;
        }

        try {
            await this.verifyCaptcha(captchaToken);
        } catch (error) {
            this.logger.warn(`Captcha verification failed: ${error.message}`);
            yield "System Error: Captcha verification failed.";
            return;
        }

        const slackThreadTs = await this.slackService.logNewConversation(userMessage, socketId);
        if (slackThreadTs && socketId) {
            await this.conversationState.linkThreadToSocket(slackThreadTs, socketId);
        }

        let fullResponse = "";

        try {
            if (!userMessage.trim()) throw new Error("Empty message provided");

            if (socketId) {
                await this.conversationState.saveMessage(socketId, 'user', userMessage);
            }

            const history = socketId
                ? await this.conversationState.getHistory(socketId, 6)
                : [];

            const embeddingResult = await this.genAI.models.embedContent({
                model: 'text-embedding-004',
                contents: [{ role: 'user', parts: [{ text: userMessage }] }] as any,
            });

            const queryVector = embeddingResult.embeddings?.[0]?.values;
            if (!queryVector) throw new Error("Failed to generate embedding");

            const searchResults = await this.qdrantClient.search(this.COLLECTION_NAME, {
                vector: queryVector,
                limit: 5,
                with_payload: true,
                score_threshold: 0.6
            });

            this.logger.log(`RAG: Found ${searchResults.length} relevant chunks.`);

            const context = searchResults
                .map(res => res.payload?.content || '')
                .join('\n\n');

            const result = await this.genAI.models.generateContentStream({
                model: 'gemini-3-flash-preview',
                config: {
                    temperature: 0.7,
                    systemInstruction: {
                        parts: [{ text: this.getSystemPrompt(context) }]
                    }
                },
                contents: [
                    ...history.map(msg => ({
                        role: msg.role,
                        parts: [{ text: msg.content }]
                    })),
                    {
                        role: 'user',
                        parts: [{ text: userMessage }]
                    }
                ],
            });


            for await (const chunk of result) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullResponse += chunkText;
                    yield chunkText;
                }
            }

        } catch (error) {
            this.logger.error("RAG Pipeline Error detailed:", error);
            const errorMsg = "Wystąpił błąd systemu. Spróbuj ponownie później lub napisz bezpośrednio do Konrada.";
            fullResponse = errorMsg;
            yield errorMsg;
        } finally {
            if (fullResponse) {
                if (socketId) {
                    await this.conversationState.saveMessage(socketId, 'model', fullResponse);
                }
                if (slackThreadTs) {
                    await this.slackService.logAiResponse(slackThreadTs, fullResponse);
                }
            }
        }
    }

    private getSystemPrompt(context: string): string {
        return `
        You are the AI Avatar of Konrad Sędkowski, a Platform Engineer and GCP Specialist.
        Your goal is to represent Konrad professionally to recruiters and B2B clients.

        CORE IDENTITY & TONE:
        1. **First Person Persona:** Always speak as "I" (Konrad). Never say "Konrad has experience...". Say "I have experience...".
        2. **Tone:** Engineering professional, concise, direct, slightly casual (not stiff corporate). 
        3. **Honesty:** Do not invent skills. If the answer is not in the CONTEXT, admit it politely and suggest contacting you on LinkedIn.

        LANGUAGE RULES (CRITICAL):
        - **Detect the language** of the user's last message.
        - **ALWAYS reply in the same language** as the user.
        - If the user asks in Polish, reply in Polish.
        - If the user asks in English, reply in English.
        - Even if the provided CONTEXT is in Polish and the user asks in English, you must translate the information and answer in English.

        KNOWLEDGE BASE (CONTEXT):
        ${context ? context : 'No specific information retrieved from the database.'}

        INSTRUCTIONS FOR INTERACTION:
        - Don't start with "Based on the context...". Just answer.
        - Use bolding for key technologies (e.g., **Terraform**, **GCP**).
        - Keep answers relatively short unless asked for a detailed explanation.
        `;
    }

    private async verifyCaptcha(token: string): Promise<boolean> {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        if (!secretKey) {
            this.logger.warn('RECAPTCHA_SECRET_KEY is not set. Skipping verification (DEV MODE).');
            return true;
        }

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
                ),
            );

            const { success, score } = response.data;

            if (!success || score < 0.5) {
                throw new Error(`Invalid captcha. Success: ${success}, Score: ${score}`);
            }

            return true;
        } catch (error) {
            this.logger.error(`Captcha verification error: ${error.message}`);
            throw error;
        }
    }
}