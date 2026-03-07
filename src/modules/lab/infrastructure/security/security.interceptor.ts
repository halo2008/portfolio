import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

export interface RagSecurityContext {
    userId: string;
    role: string;
    language: string;
}

export interface RequestWithRagContext extends Request {
    RAG_CONTEXT?: RagSecurityContext;
    // user is set by FirebaseAuthGuard
    user?: unknown;
}

interface FirebaseDecodedToken {
    uid: string;
    role?: string;
}

/** Injects RAG_CONTEXT from Firebase JWT into every request for zero-trust security */
@Injectable()
export class SecurityInterceptor implements NestInterceptor {
    private readonly logger = new Logger(SecurityInterceptor.name);

    /** Routes that should bypass security context injection */
    private readonly PUBLIC_ROUTES = ['/api/health', '/health', '/metrics', '/api', '/', '/api/chat', '/api/slack/events'];

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest<RequestWithRagContext>();

        if (this.PUBLIC_ROUTES.includes(request.path)) {
            return next.handle();
        }

        const decodedToken = request.user as FirebaseDecodedToken | undefined;

        if (!decodedToken || !decodedToken.uid) {
            this.logger.warn({
                path: request.path,
                method: request.method,
                ip: request.ip,
            }, 'Security context injection failed: missing or invalid JWT');
            throw new UnauthorizedException('Missing or invalid authentication context');
        }

        const acceptLanguage = request.headers['accept-language'] || 'en';
        const preferredLanguage = this.parsePreferredLanguage(acceptLanguage as string);

        // Ephemeral lab users don't have custom claims, default to 'demo'
        const isLabRoute = request.path.startsWith('/lab') || request.path.startsWith('/api/lab');
        const defaultRole = isLabRoute ? 'demo' : 'user';

        const ragContext: RagSecurityContext = {
            userId: decodedToken.uid,
            role: decodedToken.role || defaultRole,
            language: preferredLanguage,
        };

        request.RAG_CONTEXT = ragContext;

        this.logger.log({
            userId: ragContext.userId,
            role: ragContext.role,
            language: ragContext.language,
            path: request.path,
            method: request.method,
        }, 'Security context injected for RAG query');

        return next.handle();
    }

    private parsePreferredLanguage(acceptLanguage: string): string {
        if (!acceptLanguage) {
            return 'en';
        }

        const primaryLang = acceptLanguage.split(',')[0]?.trim().toLowerCase();

        if (primaryLang.startsWith('pl')) {
            return 'pl';
        }

        return 'en';
    }
}
