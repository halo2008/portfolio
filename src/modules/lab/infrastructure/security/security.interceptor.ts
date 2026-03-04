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

/**
 * RAG Security Context
 * Explaining: Context injected into RAG queries for zero-trust security.
 * Contains user identity and authorization metadata.
 */
export interface RagSecurityContext {
    userId: string;
    role: string;
    language: string;
}

/**
 * Extended Request with RAG_CONTEXT
 * Explaining: Augments Express Request with security context for downstream use.
 */
export interface RequestWithRagContext extends Request {
    RAG_CONTEXT?: RagSecurityContext;
    // user is set by FirebaseAuthGuard
    user?: unknown;
}

/**
 * Firebase Decoded Token structure
 * Explaining: Subset of Firebase Auth decoded token we care about.
 */
interface FirebaseDecodedToken {
    uid: string;
    role?: string;
}

/**
 * SecurityInterceptor
 * Explaining: NestJS interceptor that injects user context from Firebase JWT
 * into all RAG queries. Implements zero-trust by ensuring every request
 * has verified identity context.
 *
 * Acceptance Criteria:
 * - Extracts uid from FirebaseAuthGuard decoded token (request.user)
 * - Injects RAG_CONTEXT with userId, role, and language into request
 * - Rejects requests with missing or invalid JWT with 401
 * - Logs security context injection for audit trail
 */
@Injectable()
export class SecurityInterceptor implements NestInterceptor {
    private readonly logger = new Logger(SecurityInterceptor.name);

    /** Routes that should bypass security context injection */
    private readonly PUBLIC_ROUTES = ['/api/health', '/health', '/metrics', '/api', '/', '/api/chat', '/api/slack/events'];

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest<RequestWithRagContext>();

        // Skip security context injection for public/infra routes (health checks, metrics)
        if (this.PUBLIC_ROUTES.includes(request.path)) {
            return next.handle();
        }

        // Extract decoded token from FirebaseAuthGuard
        const decodedToken = request.user as FirebaseDecodedToken | undefined;

        // Validate token presence (FirebaseAuthGuard should have set this)
        if (!decodedToken || !decodedToken.uid) {
            this.logger.warn({
                path: request.path,
                method: request.method,
                ip: request.ip,
            }, 'Security context injection failed: missing or invalid JWT');
            throw new UnauthorizedException('Missing or invalid authentication context');
        }

        // Extract user preferences from headers or use defaults
        const acceptLanguage = request.headers['accept-language'] || 'en';
        const preferredLanguage = this.parsePreferredLanguage(acceptLanguage as string);

        // Build and inject RAG_CONTEXT
        const ragContext: RagSecurityContext = {
            userId: decodedToken.uid,
            role: decodedToken.role || 'user',
            language: preferredLanguage,
        };

        // Inject context into request for downstream use
        request.RAG_CONTEXT = ragContext;

        // Log security context injection for audit trail
        this.logger.log({
            userId: ragContext.userId,
            role: ragContext.role,
            language: ragContext.language,
            path: request.path,
            method: request.method,
        }, 'Security context injected for RAG query');

        return next.handle();
    }

    /**
     * Parse preferred language from Accept-Language header
     * Explaining: Extracts primary language code, supports PL/EN.
     * Defaults to 'en' if unsupported language.
     */
    private parsePreferredLanguage(acceptLanguage: string): string {
        if (!acceptLanguage) {
            return 'en';
        }

        // Extract primary language code (first in list, before any quality values)
        const primaryLang = acceptLanguage.split(',')[0]?.trim().toLowerCase();

        // Support PL and EN only (matching LanguageCode VO constraints)
        if (primaryLang.startsWith('pl')) {
            return 'pl';
        }

        return 'en';
    }
}
