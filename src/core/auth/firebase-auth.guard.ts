import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as admin from 'firebase-admin';
import { ROLES_KEY } from './roles.decorator';

// firebase-admin is initialized by the global FirestoreModule.
// No need to call admin.initializeApp() here.

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    private readonly logger = new Logger(FirebaseAuthGuard.name);

    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid Authorization header');
        }

        const token = authHeader.split('Bearer ')[1];

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            request.user = decodedToken; // Attach Firebase user info to the request

            // If no specific roles are required, simply having a valid token is enough
            if (!requiredRoles || requiredRoles.length === 0) {
                return true;
            }

            // Custom claims check
            const userRole = decodedToken.role;

            // If route requires 'admin', check if token has role: 'admin'
            if (requiredRoles.includes('admin') && userRole !== 'admin') {
                return false; // Return false to trigger 403 Forbidden
            }

            return true;
        } catch (error) {
            this.logger.warn({
                msg: 'Firebase token verification failed',
                error: (error as Error).message,
                ip: request.ip,
            });
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}

