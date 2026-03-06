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
import { ConfirmIndexUseCase, IndexResultDto, SemanticChunk } from '../../application/use-cases/confirm-index.use-case';
import { KnowledgeRepoPort, KNOWLEDGE_REPO_PORT } from '../../../knowledge/domain/ports/knowledge-repo.port';
import { LabUsageService, LabUsageStats } from '../../application/services/lab-usage.service';
import { Inject } from '@nestjs/common';
import { UserId } from '../../domain/value-objects/user-id.vo';

/**
 * Request with RAG_CONTEXT
 * Explaining: Extended Express Request with injected security context.
 */
interface RequestWithRagContext extends Request {
    RAG_CONTEXT?: RagSecurityContext;
    user?: unknown;
}

/**
 * ChunkDto
 * Explaining: Data Transfer Object for a semantic chunk in confirm-index request.
 */
class ChunkDto {
    @IsString()
    content!: string;

    @IsOptional()
    @IsString()
    title?: string;
}

/**
 * ConfirmIndexDto
 * Explaining: Data Transfer Object for confirm-index endpoint.
 */
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

/**
 * LabStatsResponse
 * Explaining: Response DTO for lab stats endpoint.
 */
interface LabStatsResponse {
    chunkCount: number;
    expiresAt: string;
    detectedLanguage: 'pl' | 'en';
    usage: LabUsageStats;
    maxRequests: number;
}

/**
 * Bilingual error messages
 * Explaining: Error messages in Polish and English for user-facing errors.
 */
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

/**
 * Valid file extensions for document upload.
 */
const VALID_FILE_EXTENSIONS = ['.txt', '.md', '.pdf'];

/**
 * Maximum file size in bytes (1MB).
 */
const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024;

/**
 * LabController
 * Explaining: REST controller for Lab functionality with secure endpoints.
 * All endpoints are protected by FirebaseAuthGuard and SecurityInterceptor.
 * 
 * Acceptance Criteria:
 * - POST /lab/analyze - multipart/form-data, max 10MB, accepts .txt/.md/.pdf
 * - POST /lab/confirm-index - JSON body with edited chunks and detected language
 * - GET /lab/stats - returns user's chunk count, session expiry, and detected language
 * - All endpoints protected with FirebaseAuthGuard
 * - All endpoints use SecurityInterceptor for context injection
 * - Bilingual error messages based on user's preferred language
 */
@Controller('lab')
@UseGuards(FirebaseAuthGuard, LabRateLimitGuard)
export class LabController {
    private readonly logger = new Logger(LabController.name);

    constructor(
        private readonly analyzeDocumentUseCase: AnalyzeDocumentUseCase,
        private readonly confirmIndexUseCase: ConfirmIndexUseCase,
        @Inject(KNOWLEDGE_REPO_PORT) private readonly knowledgeRepo: KnowledgeRepoPort,
        private readonly labUsageService: LabUsageService,
    ) { }

    /**
     * POST /lab/analyze
     * Explaining: Analyzes uploaded document and returns semantic chunks with detected language.
     * Accepts multipart/form-data with file field.
     * Max file size: 10MB.
     * Allowed file types: .txt, .md, .pdf.
     * 
     * @param file The uploaded file from multipart/form-data
     * @param req Request with RAG_CONTEXT
     * @returns AnalysisResultDto with detected language and chunks
     */
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

        // Validate file presence
        if (!file) {
            this.logger.warn('File upload rejected: no file provided');
            throw new BadRequestException(ERROR_MESSAGES[lang].fileRequired);
        }

        // Validate file size (additional check beyond multer limits)
        if (file.size > MAX_FILE_SIZE_BYTES) {
            this.logger.warn({ fileSize: file.size, maxSize: MAX_FILE_SIZE_BYTES }, 'File too large');
            throw new PayloadTooLargeException(ERROR_MESSAGES[lang].fileTooLarge);
        }

        // Validate file type
        const extension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
        if (!VALID_FILE_EXTENSIONS.includes(extension)) {
            this.logger.warn({ filename: file.originalname, extension }, 'Invalid file type');
            throw new BadRequestException(ERROR_MESSAGES[lang].invalidFileType);
        }

        // Validate context
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

        try {
            const result = await this.analyzeDocumentUseCase.execute({
                file: file.buffer,
                filename: file.originalname,
                userId,
            });

            this.logger.log({
                userId: context.userId,
                filename: file.originalname,
                detectedLanguage: result.detectedLanguage,
                chunkCount: result.chunks.length,
            }, 'Document analysis completed');

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

    /**
     * POST /lab/confirm-index
     * Explaining: Confirms and indexes edited semantic chunks.
     * Accepts JSON body with chunks array and detected language.
     * 
     * @param body ConfirmIndexDto with chunks and language
     * @param req Request with RAG_CONTEXT
     * @returns IndexResultDto with vector IDs and chunk count
     */
    @Post('confirm-index')
    async confirmIndex(
        @Body() body: ConfirmIndexDto,
        @Req() req: RequestWithRagContext,
    ): Promise<IndexResultDto> {
        const context = req.RAG_CONTEXT;
        const lang = context?.language === 'pl' ? 'pl' : 'en';

        // Validate context
        if (!context?.userId) {
            this.logger.warn('Request rejected: missing security context');
            throw new BadRequestException(ERROR_MESSAGES[lang].contextMissing);
        }

        // Validate chunks
        if (!body.chunks || !Array.isArray(body.chunks) || body.chunks.length === 0) {
            this.logger.warn({ body }, 'Invalid chunks in request');
            throw new BadRequestException(ERROR_MESSAGES[lang].chunksRequired);
        }

        // Validate language
        if (!body.language || (body.language !== 'pl' && body.language !== 'en')) {
            this.logger.warn({ language: body.language }, 'Invalid language in request');
            throw new BadRequestException(ERROR_MESSAGES[lang].invalidLanguage);
        }

        const userId = UserId.create(context.userId);

        // Convert DTO chunks to use case format
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

    /**
     * GET /lab/stats
     * Explaining: Returns user's chunk count, session expiry, and detected language.
     * 
     * @param req Request with RAG_CONTEXT
     * @returns LabStatsResponse with chunk count, session expiry, and language
     */
    @Get('stats')
    async getStats(
        @Req() req: RequestWithRagContext,
    ): Promise<LabStatsResponse> {
        const context = req.RAG_CONTEXT;
        const lang = context?.language === 'pl' ? 'pl' : 'en';

        // Validate context
        if (!context?.userId) {
            this.logger.warn('Request rejected: missing security context');
            throw new BadRequestException(ERROR_MESSAGES[lang].contextMissing);
        }

        this.logger.log({
            userId: context.userId,
            role: context.role,
        }, 'Fetching lab stats');

        try {
            // Get chunk count from knowledge repo using the count method
            const chunkCount = await this.knowledgeRepo.count(context);

            // Session expires in 24 hours from now (ephemeral user session)
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

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
