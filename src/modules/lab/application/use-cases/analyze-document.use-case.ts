import { Inject, Injectable, Logger, BadRequestException, PayloadTooLargeException } from '@nestjs/common';
// pdf-parse v2 exports a PDFParse class, not a default function
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PDFParse } = require('pdf-parse');
import { UserId } from '../../domain/value-objects/user-id.vo';
import {
    AnalysisPort,
    ANALYSIS_PORT,
    SemanticAnalysisResult,
} from '../../domain/ports/analysis.port';

/**
 * AnalysisResultChunk DTO
 * Explaining: A single semantic chunk from document analysis.
 */
export interface AnalysisResultChunkDto {
    content: string;
    startLine: number;
    endLine: number;
}

/**
 * AnalysisResultDto
 * Explaining: Data transfer object for document analysis results
 * including detected language and semantic chunks.
 */
export interface AnalysisResultDto {
    detectedLanguage: 'pl' | 'en';
    chunks: AnalysisResultChunkDto[];
}

/**
 * AnalyzeDocumentInput
 * Explaining: Input parameters for document analysis.
 */
export interface AnalyzeDocumentInput {
    file: Buffer;
    filename: string;
    userId: UserId;
}

/**
 * Valid file extensions for document upload.
 */
const VALID_FILE_EXTENSIONS = ['.txt', '.md', '.pdf'];

/**
 * Maximum file size in bytes (10MB).
 */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * AnalyzeDocumentUseCase
 * Explaining: Application use case for analyzing uploaded documents.
 * Validates file type and size, extracts text content,
 * calls AI analysis for language detection and semantic chunking.
 */
@Injectable()
export class AnalyzeDocumentUseCase {
    private readonly logger = new Logger(AnalyzeDocumentUseCase.name);

    constructor(
        @Inject(ANALYSIS_PORT) private readonly analysisPort: AnalysisPort,
    ) { }

    /**
     * Execute document analysis.
     * Explaining: Validates file, extracts text, calls AI analysis,
     * and returns structured result with detected language.
     * @param input The document input (file buffer, filename, userId)
     * @returns Promise with analysis result including language and chunks
     */
    async execute(input: AnalyzeDocumentInput): Promise<AnalysisResultDto> {
        const { file, filename, userId } = input;

        this.logger.log(
            { filename, userId: userId.toString(), fileSize: file.length },
            'Starting document analysis',
        );

        // Validate file type
        this.validateFileType(filename);

        // Validate file size
        this.validateFileSize(file);

        // Extract text content from file
        const content = await this.extractText(file, filename);

        // Call AI analysis for language detection and chunking
        const analysisResult = await this.analysisPort.analyzeDocument(
            content,
            filename,
        );

        // Convert to DTO format
        const result: AnalysisResultDto = {
            detectedLanguage: analysisResult.detectedLanguage,
            chunks: analysisResult.chunks.map((chunk) => ({
                content: chunk.content,
                startLine: chunk.startLine,
                endLine: chunk.endLine,
            })),
        };

        this.logger.log(
            {
                filename,
                userId: userId.toString(),
                detectedLanguage: result.detectedLanguage,
                chunkCount: result.chunks.length,
            },
            'Document analysis completed',
        );

        return result;
    }

    /**
     * Validate file type.
     * Explaining: Checks if file extension is in allowed list (.txt, .md, .pdf).
     * Throws BadRequestException (400) for invalid file types.
     * @param filename The name of the file
     */
    private validateFileType(filename: string): void {
        const extension = filename.toLowerCase().slice(filename.lastIndexOf('.'));

        if (!VALID_FILE_EXTENSIONS.includes(extension)) {
            this.logger.warn(
                { filename, extension },
                'Invalid file type rejected',
            );
            throw new BadRequestException(
                `Invalid file type: ${extension}. Supported types: ${VALID_FILE_EXTENSIONS.join(', ')}`,
            );
        }
    }

    /**
     * Validate file size.
     * Explaining: Ensures file size is within 10MB limit.
     * Throws PayloadTooLargeException (413) if file is too large.
     * @param file The file buffer
     */
    private validateFileSize(file: Buffer): void {
        if (file.length > MAX_FILE_SIZE_BYTES) {
            this.logger.warn(
                { fileSize: file.length, maxSize: MAX_FILE_SIZE_BYTES },
                'File too large rejected',
            );
            throw new PayloadTooLargeException(
                `File size exceeds maximum allowed size of 10MB. Received: ${(file.length / 1024 / 1024).toFixed(2)}MB`,
            );
        }
    }

    /**
     * Extract text content from file.
     * Explaining: Uses pdf-parse for PDF files, toString() for text files.
     * @param file The file buffer
     * @param filename The filename for context
     * @returns Extracted text content
     */
    private async extractText(file: Buffer, filename: string): Promise<string> {
        const extension = filename.toLowerCase().slice(filename.lastIndexOf('.'));

        if (extension === '.pdf') {
            try {
                const parser = new PDFParse({ data: file, verbosity: 0 });
                const result = await parser.getText();
                const text = result.pages.map((p: any) => p.text).join('\n');
                const info = await parser.getInfo();
                this.logger.debug(
                    { filename, pageCount: info?.numPages ?? result.pages.length },
                    'PDF parsed successfully',
                );
                await parser.destroy();
                return text;
            } catch (error) {
                this.logger.error(
                    { filename, error: (error as Error).message },
                    'Failed to parse PDF',
                );
                throw new BadRequestException(
                    `Failed to parse PDF file: ${(error as Error).message}`,
                );
            }
        }

        // For .txt and .md files, convert buffer to string
        // Use UTF-8 encoding for text files
        const text = file.toString('utf-8');
        this.logger.debug(
            { filename, charCount: text.length },
            'Text file extracted successfully',
        );
        return text;
    }
}
