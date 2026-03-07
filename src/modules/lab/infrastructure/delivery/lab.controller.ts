import {
    Controller,
    Post,
    Get,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Body,
    Req,
    BadRequestException,
    PayloadTooLargeException,
    Logger,
} from '@nestjs/common';
import { IsString, IsOptional, IsArray, ValidateNested, IsIn, ArrayMinSize } from 'class-validator';
import { Type as TransformType } from 'class-transformer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { FirebaseAuthGuard } from '../../../../core/auth/firebase-auth.guard';
import { LabRateLimitGuard } from '../security/lab-rate-limit.guard';
import { RagSecurityContext } from '../../../knowledge/domain/ports/knowledge-repo.port';
import { AnalyzeDocumentUseCase, AnalysisResultDto } from '../../application/use-cases/analyze-document.use-case';
import { ChunkingStrategy } from '../../domain/ports/analysis.port';
import { ConfirmIndexUseCase, IndexResultDto, SemanticChunk } from '../../application/use-cases/confirm-index.use-case';
import { KnowledgeRepoPort, KNOWLEDGE_REPO_PORT } from '../../../knowledge/domain/ports/knowledge-repo.port';
import { LabUsageService, LabUsageStats } from '../../application/services/lab-usage.service';
import { LabMetricsService } from '../metrics/lab-metrics.service';
import { Inject } from '@nestjs/common';
import { UserId } from '../../domain/value-objects/user-id.vo';

interface RequestWithRagContext extends Request {
    RAG_CONTEXT?: RagSecurityContext;
    user?: unknown;
}

class ChunkDto {
    @IsString()
    content!: string;

    @IsOptional()
    @IsString()
    title?: string;
}

class ConfirmIndexDto {
    @IsArray()
    @ValidateNested({ each: true })
    @TransformType(() => ChunkDto)
    @ArrayMinSize(1)
    chunks!: ChunkDto[];

    @IsString()
    @IsIn(['pl', 'en'])
    language!: 'pl' | 'en';
}

class SetLanguageDto {
    @IsString()
    @IsIn(['pl', 'en'])
    language!: 'pl' | 'en';
}

interface LabStatsResponse {
    chunkCount: number;
    expiresAt: string;
    detectedLanguage: 'pl' | 'en';
    usage: LabUsageStats;
    maxRequests: number;
}

const ERROR_MESSAGES = {
    pl: {
        fileRequired: 'Plik jest wymagany',
        invalidFileType: 'Nieprawidłowy typ pliku. Dozwolone: .txt, .md, .pdf',
        fileTooLarge: 'Plik przekracza maksymalny rozmiar 1MB',
        chunksRequired: 'Chunks są wymagane',
        invalidLanguage: 'Nieprawidłowy język. Dozwolone: pl, en',
        invalidPayload: 'Nieprawidłowa zawartość żądania',
        contextMissing: 'Brak kontekstu bezpieczeństwa',
    },
    en: {
        fileRequired: 'File is required',
        invalidFileType: 'Invalid file type. Allowed: .txt, .md, .pdf',
        fileTooLarge: 'File exceeds maximum size of 1MB',
        chunksRequired: 'Chunks are required',
        invalidLanguage: 'Invalid language. Allowed: pl, en',
        invalidPayload: 'Invalid request payload',
        contextMissing: 'Security context missing',
    },
};

const VALID_FILE_EXTENSIONS = ['.txt', '.md', '.pdf'];
const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024;

@Controller('lab')
@UseGuards(FirebaseAuthGuard, LabRateLimitGuard)
export class LabController {
    private readonly logger = new Logger(LabController.name);

    constructor(
        private readonly analyzeDocumentUseCase: AnalyzeDocumentUseCase,
        private readonly confirmIndexUseCase: ConfirmIndexUseCase,
        @Inject(KNOWLEDGE_REPO_PORT) private readonly knowledgeRepo: KnowledgeRepoPort,
        private readonly labUsageService: LabUsageService,
        private readonly labMetrics: LabMetricsService,
    ) { }

    @Post('analyze')
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: MAX_FILE_SIZE_BYTES,
        },
        fileFilter: (_req, file, callback) => {
            const extension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
            if (VALID_FILE_EXTENSIONS.includes(extension)) {
                callback(null, true);
            } else {
                callback(new BadRequestException(`Invalid file type: ${extension}`), false);
            }
        },
    }))
    async analyzeDocument(
        @UploadedFile() file: Express.Multer.File | undefined,
        @Req() req: RequestWithRagContext,
    ): Promise<AnalysisResultDto> {
        const context = req.RAG_CONTEXT;
        const lang = context?.language === 'pl' ? 'pl' : 'en';

        if (!file) {
            this.logger.warn('File upload rejected: no file provided');
            throw new BadRequestException(ERROR_MESSAGES[lang].fileRequired);
        }

        // Additional check beyond multer limits
        if (file.size > MAX_FILE_SIZE_BYTES) {
            this.logger.warn({ fileSize: file.size, maxSize: MAX_FILE_SIZE_BYTES }, 'File too large');
            throw new PayloadTooLargeException(ERROR_MESSAGES[lang].fileTooLarge);
        }

        const extension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
        if (!VALID_FILE_EXTENSIONS.includes(extension)) {
            this.logger.warn({ filename: file.originalname, extension }, 'Invalid file type');
            throw new BadRequestException(ERROR_MESSAGES[lang].invalidFileType);
        }

        if (!context?.userId) {
            this.logger.warn('Request rejected: missing security context');
            throw new BadRequestException(ERROR_MESSAGES[lang].contextMissing);
        }

        const userId = UserId.create(context.userId);

        this.logger.log({
            userId: context.userId,
            filename: file.originalname,
            fileSize: file.size,
        }, 'Processing document analysis');

        const rawStrategy = (req as any).body?.chunkingStrategy;
        const strategy: ChunkingStrategy =
            rawStrategy === 'heuristic' ? 'heuristic' : 'llm';

        try {
            const result = await this.analyzeDocumentUseCase.execute({
                file: file.buffer,
                filename: file.originalname,
                userId,
                chunkingStrategy: strategy,
            });

            this.logger.log({
                userId: context.userId,
                filename: file.originalname,
                detectedLanguage: result.detectedLanguage,
                chunkCount: result.chunks.length,
            }, 'Document analysis completed');

            this.labMetrics.recordAnalysis(context.userId, result.detectedLanguage);

            return result;
        } catch (error) {
            this.logger.error({
                userId: context.userId,
                filename: file.originalname,
                error: (error as Error).message,
            }, 'Document analysis failed');
            throw error;
        }
    }

    @Post('confirm-index')
    async confirmIndex(
        @Body() body: ConfirmIndexDto,
        @Req() req: RequestWithRagContext,
    ): Promise<IndexResultDto> {
        const context = req.RAG_CONTEXT;
        const lang = context?.language === 'pl' ? 'pl' : 'en';

        if (!context?.userId) {
            this.logger.warn('Request rejected: missing security context');
            throw new BadRequestException(ERROR_MESSAGES[lang].contextMissing);
        }

        if (!body.chunks || !Array.isArray(body.chunks) || body.chunks.length === 0) {
            this.logger.warn({ body }, 'Invalid chunks in request');
            throw new BadRequestException(ERROR_MESSAGES[lang].chunksRequired);
        }

        if (!body.language || (body.language !== 'pl' && body.language !== 'en')) {
            this.logger.warn({ language: body.language }, 'Invalid language in request');
            throw new BadRequestException(ERROR_MESSAGES[lang].invalidLanguage);
        }

        const userId = UserId.create(context.userId);

        const chunks: SemanticChunk[] = body.chunks.map((chunk) => ({
            content: chunk.content,
            title: chunk.title,
        }));

        this.logger.log({
            userId: context.userId,
            chunkCount: chunks.length,
            language: body.language,
        }, 'Processing chunk indexing');

        try {
            const result = await this.confirmIndexUseCase.execute({
                chunks,
                userId,
                language: body.language,
            });

            this.logger.log({
                userId: context.userId,
                chunkCount: result.chunkCount,
                language: result.language,
                vectorIdsCount: result.vectorIds.length,
            }, 'Chunk indexing completed');

            this.labMetrics.recordIndexing(context.userId, result.chunkCount);

            return result;
        } catch (error) {
            this.logger.error({
                userId: context.userId,
                chunkCount: chunks.length,
                error: (error as Error).message,
            }, 'Chunk indexing failed');
            throw error;
        }
    }

    /** Called from frontend instead of direct Firestore write (blocked by ad blockers) */
    @Post('language')
    async setLanguage(
        @Body() body: SetLanguageDto,
        @Req() req: RequestWithRagContext,
    ) {
        const context = req.RAG_CONTEXT;
        if (!context?.userId) {
            throw new BadRequestException('Security context missing');
        }

        const lang = body.language;

        await this.labUsageService.updateLanguagePreference(context.userId, lang);

        return { status: 'ok', language: lang };
    }

    @Get('stats')
    async getStats(
        @Req() req: RequestWithRagContext,
    ): Promise<LabStatsResponse> {
        const context = req.RAG_CONTEXT;
        const lang = context?.language === 'pl' ? 'pl' : 'en';

        if (!context?.userId) {
            this.logger.warn('Request rejected: missing security context');
            throw new BadRequestException(ERROR_MESSAGES[lang].contextMissing);
        }

        this.logger.log({
            userId: context.userId,
            role: context.role,
        }, 'Fetching lab stats');

        try {
            const chunkCount = await this.knowledgeRepo.count(context);
            const expiresAt = await this.labUsageService.getSessionExpiresAt(context.userId);

            const detectedLanguage = context.language === 'pl' ? 'pl' : 'en';

            const usage = await this.labUsageService.getUsageStats(context.userId);

            this.logger.log({
                userId: context.userId,
                chunkCount,
                detectedLanguage,
            }, 'Lab stats fetched');

            return {
                chunkCount,
                expiresAt,
                detectedLanguage,
                usage,
                maxRequests: this.labUsageService.MAX_REQUESTS_PER_SESSION,
            };
        } catch (error) {
            this.logger.error({
                userId: context.userId,
                error: (error as Error).message,
            }, 'Failed to fetch lab stats');
            throw error;
        }
    }
}
