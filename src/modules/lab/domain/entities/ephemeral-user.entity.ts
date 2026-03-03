import { UserId } from '../value-objects/user-id.vo';
import { ExpirationTime } from '../value-objects/expiration-time.vo';
import { LanguageCode, SupportedLanguage } from '../value-objects/language-code.vo';

/**
 * EphemeralUser Role
 * Explaining: Demo users have a fixed 'demo' role to distinguish from permanent users.
 */
export type EphemeralUserRole = 'demo';

/**
 * EphemeralUser Entity
 * Explaining: Represents a temporary 24h demo user with strict lifecycle management.
 * All fields are readonly to ensure immutability of domain entities.
 */
export interface EphemeralUser {
    uid: UserId; // Explaining: Firebase Auth UID - immutable identifier
    email: string; // Explaining: User's email from Firebase Auth
    createdAt: Date; // Explaining: When the demo session was created
    role: EphemeralUserRole; // Explaining: Always 'demo' for ephemeral users
    expiresAt: ExpirationTime; // Explaining: When the session expires (24h from creation)
    preferredLanguage: LanguageCode; // Explaining: User's preferred UI language (pl | en)
}

/**
 * EphemeralUser Factory
 * Explaining: Factory function to create validated EphemeralUser instances.
 */
export function createEphemeralUser(params: {
    uid: string;
    email: string;
    preferredLanguage?: string;
    expiresInHours?: number;
}): EphemeralUser {
    const userId = UserId.create(params.uid);
    const email = params.email?.trim();
    
    if (!email || !email.includes('@')) {
        throw new Error('Invalid email address');
    }

    const language = LanguageCode.create(params.preferredLanguage || 'en');
    const expiresAt = ExpirationTime.fromNow(params.expiresInHours || 24);
    const createdAt = new Date();

    return {
        uid: userId,
        email,
        createdAt,
        role: 'demo' as EphemeralUserRole,
        expiresAt,
        preferredLanguage: language,
    };
}

/**
 * Check if an ephemeral user has expired.
 * Explaining: Helper function for cleanup logic.
 */
export function isExpired(user: EphemeralUser, referenceTime: Date = new Date()): boolean {
    return user.expiresAt.isExpired(referenceTime);
}

/**
 * Convert EphemeralUser to Firestore-compatible plain object.
 * Explaining: Adapter helper for persistence layer.
 */
export function toPersistence(user: EphemeralUser): Record<string, unknown> {
    return {
        uid: user.uid.toString(),
        email: user.email,
        createdAt: user.createdAt,
        role: user.role,
        expiresAt: user.expiresAt.toDate(),
        preferredLanguage: user.preferredLanguage.toString(),
    };
}

/**
 * Reconstruct EphemeralUser from Firestore plain object.
 * Explaining: Factory for reconstructing domain entity from persistence.
 */
export function fromPersistence(data: {
    uid: string;
    email: string;
    createdAt: Date;
    role: string;
    expiresAt: Date;
    preferredLanguage: string;
}): EphemeralUser {
    return {
        uid: UserId.create(data.uid),
        email: data.email,
        createdAt: data.createdAt,
        role: data.role as EphemeralUserRole,
        expiresAt: ExpirationTime.create(data.expiresAt),
        preferredLanguage: LanguageCode.create(data.preferredLanguage),
    };
}
