import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';

export const FIRESTORE_DB = 'FIRESTORE_DB';

/**
 * FirestoreModule
 * Global singleton module providing a single Firestore instance.
 * Replaces duplicate `new Firestore()` and `admin.firestore()` calls
 * across ChatModule, SlackModule, and LabModule.
 *
 * Provides both 'FIRESTORE_DB' and 'FIRESTORE_CLIENT' tokens
 * so all existing injections work without changes.
 */
@Global()
@Module({
    providers: [
        {
            provide: FIRESTORE_DB,
            useFactory: () => {
                if (!admin.apps.length) {
                    admin.initializeApp({
                        credential: admin.credential.applicationDefault(),
                    });
                }
                return admin.firestore();
            },
        },
        {
            // Alias for modules that inject 'FIRESTORE_CLIENT' (chat, slack)
            provide: 'FIRESTORE_CLIENT',
            useExisting: FIRESTORE_DB,
        },
    ],
    exports: [FIRESTORE_DB, 'FIRESTORE_CLIENT'],
})
export class FirestoreModule { }
