// src/chat/conversation-state.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { FIRESTORE_DB } from '../firestore/firestore.provider';

@Injectable()
export class ConversationStateService {
    private readonly logger = new Logger(ConversationStateService.name);
    private readonly COLLECTION_NAME = 'active_conversations';

    constructor(@Inject(FIRESTORE_DB) private readonly firestore: Firestore) {}

    /**
     * Maps the Slack thread timestamp to the User's Socket ID.
     * We use threadTs as the Document ID for fast O(1) lookups.
     */
    async linkThreadToSocket(threadTs: string, socketId: string): Promise<void> {
        try {
            const docRef = this.firestore.collection(this.COLLECTION_NAME).doc(threadTs);
            
            await docRef.set({
                socketId: socketId,
                createdAt: new Date(),
                // Firestore TTL Policy field (optional, requires setup in GCP Console)
                expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
            });

            this.logger.log(`Linked Slack Thread '${threadTs}' to Socket '${socketId}' in Firestore.`);
        } catch (error) {
            this.logger.error(`Failed to link thread to socket in Firestore: ${error.message}`, error);
            // Consider throwing or handling gracefully depending on criticality
        }
    }

    /**
     * Retrieves the Socket ID associated with a Slack thread.
     */
    async getSocketId(threadTs: string): Promise<string | null> {
        try {
            const docRef = this.firestore.collection(this.COLLECTION_NAME).doc(threadTs);
            const doc = await docRef.get();

            if (!doc.exists) {
                this.logger.warn(`No active conversation found for thread: ${threadTs}`);
                return null;
            }

            const data = doc.data();
            return data?.socketId || null;
        } catch (error) {
            this.logger.error(`Failed to retrieve socket ID from Firestore: ${error.message}`, error);
            return null;
        }
    }
    
    // Optional: Clean up manually if not using TTL Policy
    async removeConversation(threadTs: string): Promise<void> {
        await this.firestore.collection(this.COLLECTION_NAME).doc(threadTs).delete();
    }
}