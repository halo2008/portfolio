import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';

export const FIRESTORE_DB = 'FIRESTORE_DB';

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
            provide: 'FIRESTORE_CLIENT',
            useExisting: FIRESTORE_DB,
        },
    ],
    exports: [FIRESTORE_DB, 'FIRESTORE_CLIENT'],
})
export class FirestoreModule { }
