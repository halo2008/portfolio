import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';

export const FIRESTORE_DB = 'FIRESTORE_DB';

export const FirestoreProvider: Provider = {
    provide: FIRESTORE_DB,
    useFactory: () => {
        // Avoid duplicate initialization on hot-reload
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
        }
        return admin.firestore();
    },
};