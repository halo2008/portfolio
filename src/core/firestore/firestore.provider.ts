// src/firestore/firestore.provider.ts
import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';

export const FIRESTORE_DB = 'FIRESTORE_DB';

export const FirestoreProvider: Provider = {
    provide: FIRESTORE_DB,
    useFactory: () => {
        // Check if app is already initialized to avoid hot-reload errors
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(), // Best practice for GCP (Cloud Run / Local with gcloud auth)
            });
        }
        return admin.firestore();
    },
};