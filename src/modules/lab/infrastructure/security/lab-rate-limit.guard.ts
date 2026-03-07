import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Logger, Inject } from '@nestjs/common';
import { LabUsageService } from '../../application/services/lab-usage.service';
import { RequestWithRagContext } from './security.interceptor';

@Injectable()
export class LabRateLimitGuard implements CanActivate {
    private readonly logger = new Logger(LabRateLimitGuard.name);

    constructor(
        private readonly labUsageService: LabUsageService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithRagContext>();

        // Context might not be injected yet if this guard runs before interceptor,
        // but we can extract user directly from Firebase auth (request.user)
        const user = request.user as { uid?: string } | undefined;
        const uid = user?.uid || request.RAG_CONTEXT?.userId;

        if (!uid) {
            // Let the security interceptor/auth guard handle missing auth
            return true;
        }

        try {
            const isLimited = await this.labUsageService.isRateLimited(uid);

            if (isLimited) {
                const lang = request.headers['accept-language']?.startsWith('pl') ? 'pl' : 'en';
                const message = lang === 'pl'
                    ? 'Limit zapytań dla sesji testowej został wyczerpany (max 50).'
                    : 'Test session request limit exceeded (max 50).';

                this.logger.warn({ uid }, 'Rate limit exceeded for lab session');

                throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
            }

            return true;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error({ uid, error: (error as Error).message }, 'Error checking rate limit');
            // Fail closed: deny request if rate limit check fails
            return false;
        }
    }
}
