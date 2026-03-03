import { Inject, Injectable, Logger } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import {
    EphemeralUserRepoPort,
    EPHEMERAL_USER_REPO_PORT,
} from '../../domain/ports/ephemeral-user-repo.port';
import {
    EphemeralUser,
    toPersistence,
    fromPersistence,
} from '../../domain/entities/ephemeral-user.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { FIRESTORE_DB } from '../../../../core/firestore/firestore.provider';

/**
 * FirestoreEphemeralUserAdapter
 * Explaining: Firestore adapter for persisting ephemeral demo user metadata.
 * Uses collection 'ephemeral_users' with TTL on expiresAt field.
 */
@Injectable()
export class FirestoreEphemeralUserAdapter implements EphemeralUserRepoPort {
    private readonly logger = new Logger(FirestoreEphemeralUserAdapter.name);
    private readonly COLLECTION_NAME = 'ephemeral_users';

    constructor(
        @Inject(FIRESTORE_DB) private readonly firestore: Firestore,
    ) { }

    /**
     * Save an ephemeral user to Firestore.
     * Explaining: Creates or updates the user document using UID as document ID.
     */
    async save(user: EphemeralUser): Promise<void> {
        try {
            const data = toPersistence(user);
            await this.firestore
                .collection(this.COLLECTION_NAME)
                .doc(user.uid.toString())
                .set(data);

            this.logger.debug(
                { uid: user.uid.toString(), email: user.email },
                'Ephemeral user saved to Firestore',
            );
        } catch (error) {
            this.logger.error(
                { uid: user.uid.toString(), error: (error as Error).message },
                'Failed to save ephemeral user to Firestore',
            );
            throw error;
        }
    }

    /**
     * Find all users that have expired before the given date.
     * Explaining: Queries Firestore for users where expiresAt < before.
     * Used by cleanup service to find expired demo accounts.
     */
    async findExpired(before: Date): Promise<EphemeralUser[]> {
        try {
            const snapshot = await this.firestore
                .collection(this.COLLECTION_NAME)
                .where('expiresAt', '<', before)
                .get();

            const users: EphemeralUser[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                users.push(
                    fromPersistence({
                        uid: data.uid,
                        email: data.email,
                        createdAt: data.createdAt.toDate(),
                        role: data.role,
                        expiresAt: data.expiresAt.toDate(),
                        preferredLanguage: data.preferredLanguage,
                    }),
                );
            });

            this.logger.debug(
                { count: users.length, before: before.toISOString() },
                'Found expired ephemeral users',
            );

            return users;
        } catch (error) {
            this.logger.error(
                { before: before.toISOString(), error: (error as Error).message },
                'Failed to find expired ephemeral users',
            );
            throw error;
        }
    }

    /**
     * Delete an ephemeral user by their UID.
     * Explaining: Removes the user document from Firestore.
     */
    async delete(uid: UserId): Promise<void> {
        try {
            await this.firestore
                .collection(this.COLLECTION_NAME)
                .doc(uid.toString())
                .delete();

            this.logger.debug(
                { uid: uid.toString() },
                'Ephemeral user deleted from Firestore',
            );
        } catch (error) {
            this.logger.error(
                { uid: uid.toString(), error: (error as Error).message },
                'Failed to delete ephemeral user from Firestore',
            );
            throw error;
        }
    }

    /**
     * Find a user by their UID.
     * Explaining: Retrieves a single user document from Firestore.
     */
    async findByUid(uid: UserId): Promise<EphemeralUser | null> {
        try {
            const doc = await this.firestore
                .collection(this.COLLECTION_NAME)
                .doc(uid.toString())
                .get();

            if (!doc.exists) {
                this.logger.debug(
                    { uid: uid.toString() },
                    'Ephemeral user not found in Firestore',
                );
                return null;
            }

            const data = doc.data()!;
            const user = fromPersistence({
                uid: data.uid,
                email: data.email,
                createdAt: data.createdAt.toDate(),
                role: data.role,
                expiresAt: data.expiresAt.toDate(),
                preferredLanguage: data.preferredLanguage,
            });

            this.logger.debug(
                { uid: uid.toString() },
                'Ephemeral user found in Firestore',
            );

            return user;
        } catch (error) {
            this.logger.error(
                { uid: uid.toString(), error: (error as Error).message },
                'Failed to find ephemeral user by UID',
            );
            throw error;
        }
    }
}
