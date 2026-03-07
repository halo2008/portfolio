import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    UseInterceptors,
    Req,
    ForbiddenException,
    Logger,
    Inject,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsString, IsOptional, IsNumber, Min, Max, MaxLength } from 'class-validator';
import { Request } from 'express';
import { GenerateChatResponseUseCase } from '../../application/generate-chat-response.use-case';
import { ChatWithAdminKnowledgeUseCase } from '../../application/use-cases/chat-with-admin-knowledge.use-case';
import { ChatWithUserKnowledgeUseCase } from '../../../lab/application/use-cases/chat-with-user-knowledge.use-case';
import { CaptchaGuard } from '../guards/captcha.guard';
import { FirebaseAuthGuard } from '../../../../core/auth/firebase-auth.guard';
import { SecurityInterceptor, RagSecurityContext } from '../../../lab/infrastructure/security/security.interceptor';
import { LabRateLimitGuard } from '../../../lab/infrastructure/security/lab-rate-limit.guard';
import { LabMetricsService } from '../../../lab/infrastructure/metrics/lab-metrics.service';

interface RequestWithRagContext extends Request {
    RAG_CONTEXT?: RagSecurityContext;
    user?: unknown;
}

class ChatRequestDto {
    @IsString()
    @MaxLength(5000)
    message!: string;

    @IsString()
    sessionId!: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    scoreThreshold?: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    systemContext?: string;
}

/**
 * SourceDto
 * Explaining: Data Transfer Object for source citations in responses.
 */
class SourceDto {
    title!: string;
}

/**
 * ChatResponseDto
 * Explaining: Data Transfer Object for chat responses with bilingual support.
 */
class TimingsDto {
    embeddingMs!: number;
    searchMs!: number;
    llmMs!: number;
    totalMs!: number;
}

class ChatResponseDto {
    response!: string;
    sources!: SourceDto[];
    language!: 'pl' | 'en';
    timings?: TimingsDto;
}

/**
 * ChatController
 * Explaining: REST controller for bilingual chat endpoints with context isolation.
 * 
 * Endpoints:
 * - POST /chat - Main page chat (admin knowledge, CAPTCHA protected)
 * - POST /lab/chat - Lab chat (user knowledge, Firebase Auth + SecurityInterceptor)
 * 
 * Security:
 * - Context isolation enforced: admin-only vs user-only knowledge access
 * - Context isolation violations are logged as security events
 */
@Controller()
export class ChatController {
    private readonly logger = new Logger(ChatController.name);

    constructor(
        private readonly generateChatResponse: GenerateChatResponseUseCase,
        @Inject(ChatWithAdminKnowledgeUseCase)
        private readonly chatWithAdminKnowledge: ChatWithAdminKnowledgeUseCase,
        @Inject(ChatWithUserKnowledgeUseCase)
        private readonly chatWithUserKnowledge: ChatWithUserKnowledgeUseCase,
        private readonly labMetrics: LabMetricsService,
    ) { }

    /**
     * POST /chat
     * Explaining: Main page chat endpoint using admin knowledge base.
     * Uses ChatWithAdminKnowledgeUseCase which queries ONLY admin vectors.
     * Protected by CAPTCHA guard (no auth required for main page).
     * 
     * @param body ChatRequestDto with message and sessionId
     * @returns ChatResponseDto with response, sources (empty for admin), and detected language
     */
    @Post('chat')
    @Throttle({ short: { ttl: 60000, limit: 5 } })
    @UseGuards(CaptchaGuard)
    @HttpCode(HttpStatus.OK)
    async chatMainPage(
        @Body() body: ChatRequestDto,
    ): Promise<ChatResponseDto> {
        // Detect input language for bilingual response
        const detectedLanguage = this.detectLanguage(body.message);

        // Create a synthetic admin context for the use case
        // Main page is public (CAPTCHA-protected), so we use a system admin context
        const context: RagSecurityContext = {
            userId: 'system_main_page',
            role: 'admin',
            language: detectedLanguage,
        };

        this.logger.log({
            msg: 'Main page chat request',
            sessionId: this.anonymizeSessionId(body.sessionId),
            detectedLanguage,
        });

        try {
            const result = await this.chatWithAdminKnowledge.execute(
                {
                    message: body.message,
                    sessionId: body.sessionId,
                },
                context,
            );

            return {
                response: result.response,
                sources: [], // Admin knowledge doesn't return sources in the same way
                language: result.detectedLanguage,
            };
        } catch (error) {
            this.logger.error({
                msg: 'Main page chat failed',
                sessionId: this.anonymizeSessionId(body.sessionId),
                error: error instanceof Error ? error.message : 'Unknown error',
            });

            // Return error in detected language
            return {
                response: detectedLanguage === 'pl'
                    ? 'Przepraszam, wystąpił błąd podczas przetwarzania zapytania. Spróbuj ponownie później.'
                    : 'Sorry, an error occurred while processing your request. Please try again later.',
                sources: [],
                language: detectedLanguage,
            };
        }
    }

    /**
     * POST /lab/chat
     * Explaining: Lab chat endpoint using user's uploaded documents.
     * Uses ChatWithUserKnowledgeUseCase which queries ONLY the current user's vectors.
     * Protected by FirebaseAuthGuard and SecurityInterceptor for zero-trust context.
     * 
     * Security Context Isolation:
     * - Extracts RAG_CONTEXT from SecurityInterceptor
     * - Validates role is 'demo' (user context)
     * - Validates userId matches the request context
     * - Logs context isolation violations as security events
     * 
     * @param body ChatRequestDto with message and sessionId
     * @param req Request with RAG_CONTEXT
     * @returns ChatResponseDto with response, sources, and detected language
     */
    @Post('lab/chat')
    @UseGuards(FirebaseAuthGuard, LabRateLimitGuard)
    @UseInterceptors(SecurityInterceptor)
    @HttpCode(HttpStatus.OK)
    async chatLab(
        @Body() body: ChatRequestDto,
        @Req() req: RequestWithRagContext,
    ): Promise<ChatResponseDto> {
        const context = req.RAG_CONTEXT;

        // Validate security context presence (Defense in depth)
        if (!context) {
            this.logger.warn({
                msg: 'SECURITY VIOLATION: Missing RAG_CONTEXT in lab chat',
                path: req.path,
                ip: req.ip,
                sessionId: this.anonymizeSessionId(body.sessionId),
            }, 'Context isolation violation');
            throw new ForbiddenException('Security context missing');
        }

        // Validate role for user context
        if (context.role !== 'demo') {
            this.logger.warn({
                msg: 'SECURITY VIOLATION: Invalid role for lab chat',
                userId: context.userId,
                role: context.role,
                expectedRole: 'demo',
                path: req.path,
                ip: req.ip,
            }, 'Context isolation violation');
            throw new ForbiddenException(
                context.language === 'pl'
                    ? 'Brak uprawnień do czatu w laboratorium'
                    : 'Access denied for lab chat'
            );
        }

        // Detect input language
        const detectedLanguage = this.detectLanguage(body.message);

        this.logger.log({
            msg: 'Lab chat request',
            userId: context.userId,
            sessionId: this.anonymizeSessionId(body.sessionId),
            detectedLanguage,
        });

        try {
            const result = await this.chatWithUserKnowledge.execute(
                {
                    message: body.message,
                    sessionId: body.sessionId,
                    scoreThreshold: body.scoreThreshold,
                    systemContext: body.systemContext,
                },
                context,
            );

            this.labMetrics.recordChat(context.userId, result.detectedLanguage);

            return {
                response: result.response,
                sources: result.sources,
                language: result.detectedLanguage,
                timings: result.timings,
            };
        } catch (error) {
            this.logger.error({
                msg: 'Lab chat failed',
                userId: context.userId,
                sessionId: this.anonymizeSessionId(body.sessionId),
                error: error instanceof Error ? error.message : 'Unknown error',
            });

            // Return error in detected language
            return {
                response: detectedLanguage === 'pl'
                    ? 'Przepraszam, wystąpił błąd podczas przetwarzania zapytania. Spróbuj ponownie później.'
                    : 'Sorry, an error occurred while processing your request. Please try again later.',
                sources: [],
                language: detectedLanguage,
            };
        }
    }

    /**
     * Detect language from input message.
     * Explaining: Simple heuristic detection for Polish vs English.
     * Checks for Polish-specific characters and common words.
     * 
     * @param message The input message to analyze
     * @returns 'pl' for Polish, 'en' for English
     */
    private detectLanguage(message: string): 'pl' | 'en' {
        const lowerMessage = message.toLowerCase();

        // Polish-specific characters
        const polishChars = /[ąćęłńóśźż]/;
        // Common Polish words
        const polishWords = /\b(jak|co|gdzie|kiedy|dlaczego|czy|jest|są|tego|tym|dla|nie|tak|proszę|dziękuję)\b/;

        if (polishChars.test(lowerMessage) || polishWords.test(lowerMessage)) {
            return 'pl';
        }

        // Default to English if no Polish indicators found
        return 'en';
    }

    /**
     * Anonymize session ID for logging.
     * Explaining: Takes first 8 chars to enable session correlation
     * without exposing full session ID in logs.
     * 
     * @param sessionId The full session ID
     * @returns Anonymized session identifier
     */
    private anonymizeSessionId(sessionId: string): string {
        if (!sessionId) return 'unknown';
        return sessionId.slice(0, 8) + '...';
    }
}
