import { Controller, Post, UploadedFile, UseInterceptors, Headers, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { IngestionService } from './ingestion.service';

@Controller('internal/ingest')
export class IngestionController {
    constructor(private readonly ingestionService: IngestionService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Headers('x-admin-secret') secret: string,
    ) {
        if (secret !== process.env.ADMIN_SECRET) {
            throw new UnauthorizedException('Nice try, but you are not Konrad.');
        }

        if (!file) {
            return { error: 'No file provided' };
        }

        return await this.ingestionService.processFile(file);
    }
}