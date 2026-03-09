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
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { IsString, IsOptional, IsNumber, IsIn, Min, Max, MaxLength } from 'class-validator';
import { Request } from 'express';
import { GenerateChatResponseUseCase } from '../../application/generate-chat-response.use-case';
import { ChatWithAdminKnowledgeUseCase } from '../../application/use-cases/chat-with-admin-knowledge.use-case';
import { ChatWithUserKnowledgeUseCase } from '../../../lab/application/use-cases/chat-with-user-knowledge.use-case';
import { CaptchaGuard } from '../guards/captcha.guard';
import { FirebaseAuthGuard } from '../../../../core/auth/firebase-auth.guard';
import { SecurityInterceptor, RagSecurityContext } from '../../../lab/infrastructure/security/security.interceptor';
import { LabRateLimitGuard } from '../../../lab/infrastructure/security/lab-rate-limit.guard';
import { LabMetricsService } from '../../../lab/infrastructure/metrics/lab-metrics.service';
import { TELEMETRY_PORT, TelemetryPort } from '../../domain/ports/telemetry.port';

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
    @IsString()
    captcha?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    scoreThreshold?: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    systemContext?: string;

    @IsOptional()
    @IsString()
    @IsIn(['llm', 'heuristic', 'all'])
    chunkingStrategy?: 'llm' | 'heuristic' | 'all';
}

class SourceDto {
    title!: string;
}

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
        @Inject(TELEMETRY_PORT) private readonly telemetry: TelemetryPort,
    ) { }

    @Post('chat')
    @SkipThrottle()
    @UseGuards(CaptchaGuard)
    @HttpCode(HttpStatus.OK)
    async chatMainPage(
        @Body() body: ChatRequestDto,
    ): Promise<ChatResponseDto> {
        const detectedLanguage = this.detectLanguage(body.message);

        // Main page is public, so we use a synthetic admin context
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

            this.telemetry.observeVectorSearchLatency(result.timings.searchMs);
            this.telemetry.observeLlmLatency(result.timings.llmMs);
            this.telemetry.incrementLlmRequests();

            return {
                response: result.response,
                sources: [],
                language: result.detectedLanguage,
            };
        } catch (error) {
            this.logger.error({
                msg: 'Main page chat failed',
                sessionId: this.anonymizeSessionId(body.sessionId),
                error: error instanceof Error ? error.message : 'Unknown error',
            });

            return {
                response: detectedLanguage === 'pl'
                    ? 'Przepraszam, wystąpił błąd podczas przetwarzania zapytania. Spróbuj ponownie później.'
                    : 'Sorry, an error occurred while processing your request. Please try again later.',
                sources: [],
                language: detectedLanguage,
            };
        }
    }

    @Post('lab/chat')
    @UseGuards(FirebaseAuthGuard, LabRateLimitGuard)
    @UseInterceptors(SecurityInterceptor)
    @HttpCode(HttpStatus.OK)
    async chatLab(
        @Body() body: ChatRequestDto,
        @Req() req: RequestWithRagContext,
    ): Promise<ChatResponseDto> {
        const context = req.RAG_CONTEXT;

        // Defense in depth: validate context even though SecurityInterceptor should set it
        if (!context) {
            this.logger.warn({
                msg: 'SECURITY VIOLATION: Missing RAG_CONTEXT in lab chat',
                path: req.path,
                ip: req.ip,
                sessionId: this.anonymizeSessionId(body.sessionId),
            }, 'Context isolation violation');
            throw new ForbiddenException('Security context missing');
        }

        if (context.role !== 'demo' && context.role !== 'admin') {
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
                    chunkingStrategy: body.chunkingStrategy,
                },
                context,
            );

            this.labMetrics.recordChat(context.userId, result.detectedLanguage);
            this.labMetrics.recordChatTimings(result.timings);

            this.telemetry.observeVectorSearchLatency(result.timings.searchMs);
            this.telemetry.observeLlmLatency(result.timings.llmMs);
            this.telemetry.incrementLlmRequests();

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

            return {
                response: detectedLanguage === 'pl'
                    ? 'Przepraszam, wystąpił błąd podczas przetwarzania zapytania. Spróbuj ponownie później.'
                    : 'Sorry, an error occurred while processing your request. Please try again later.',
                sources: [],
                language: detectedLanguage,
            };
        }
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

    /** Truncate to first 8 chars to avoid exposing full session ID in logs. */
    private anonymizeSessionId(sessionId: string): string {
        if (!sessionId) return 'unknown';
        return sessionId.slice(0, 8) + '...';
    }
}
