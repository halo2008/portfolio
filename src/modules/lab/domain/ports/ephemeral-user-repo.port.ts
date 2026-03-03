import { EphemeralUser } from '../entities/ephemeral-user.entity';
import { UserId } from '../value-objects/user-id.vo';

/**
 * Injection token for EphemeralUserRepoPort.
 * Explaining: Used by NestJS dependency injection for hexagonal architecture.
 */
export const EPHEMERAL_USER_REPO_PORT = Symbol('EPHEMERAL_USER_REPO_PORT');

/**
 * EphemeralUserRepoPort
 * Explaining: Port interface for ephemeral user persistence operations.
 * Follows hexagonal architecture - domain defines the contract,
 * infrastructure adapters provide the implementation.
 */
export interface EphemeralUserRepoPort {
    /**
     * Save an ephemeral user to persistence.
     * Explaining: Creates or updates the user record in Firestore.
     * @param user The ephemeral user entity to save
     * @returns Promise that resolves when save is complete
     */
    save(user: EphemeralUser): Promise<void>;

    /**
     * Find all users that have expired before the given date.
     * Explaining: Used by cleanup service to find expired demo accounts.
     * @param before The cutoff date - users expiring before this are returned
     * @returns Array of expired ephemeral users
     */
    findExpired(before: Date): Promise<EphemeralUser[]>;

    /**
     * Delete an ephemeral user by their UID.
     * Explaining: Removes the user record from persistence.
     * @param uid The user's Firebase UID
     * @returns Promise that resolves when deletion is complete
     */
    delete(uid: UserId): Promise<void>;

    /**
     * Find a user by their UID.
     * Explaining: Optional method for retrieving single user by ID.
     * @param uid The user's Firebase UID
     * @returns The user or null if not found
     */
    findByUid?(uid: UserId): Promise<EphemeralUser | null>;
}
