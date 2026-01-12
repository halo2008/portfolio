// src/chat/conversation-state.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Firestore, Timestamp } from 'firebase-admin/firestore';
import { FIRESTORE_DB } from '../firestore/firestore.provider';

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    timestamp: Date;
}

@Injectable()
export class ConversationStateService {
    private readonly logger = new Logger(ConversationStateService.name);
    private readonly COLLECTION_NAME = 'active_conversations';
    private readonly HISTORY_COLLECTION = 'conversations';

    constructor(@Inject(FIRESTORE_DB) private readonly firestore: Firestore) { }

    /**
     * Maps the Slack thread timestamp to the User's Socket ID.
     */
    async linkThreadToSocket(threadTs: string, socketId: string): Promise<void> {
        try {
            const docRef = this.firestore.collection(this.COLLECTION_NAME).doc(threadTs);

            await docRef.set({
                socketId: socketId,
                createdAt: new Date(),
                expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
            });

            this.logger.log(`Linked Slack Thread '${threadTs}' to Socket '${socketId}' in Firestore.`);
        } catch (error) {
            this.logger.error(`Failed to link thread to socket in Firestore: ${error.message}`, error);
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

    /**
     * Saves a message to the session history.
     */
    async saveMessage(sessionId: string, role: 'user' | 'model', content: string): Promise<void> {
        if (!sessionId) return;

        try {
            const docRef = this.firestore.collection(this.HISTORY_COLLECTION).doc(sessionId);

            await docRef.collection('messages').add({
                role,
                content,
                timestamp: Timestamp.now()
            });

            await docRef.set({ lastActive: Timestamp.now() }, { merge: true });

        } catch (error) {
            this.logger.error(`Failed to save message for session ${sessionId}`, error);
        }
    }

    /**
     * Retrieves conversation history for LLM context.
     */
    async getHistory(sessionId: string, limit: number = 6): Promise<ChatMessage[]> {
        if (!sessionId) return [];

        try {
            const messagesRef = this.firestore.collection(this.HISTORY_COLLECTION)
                .doc(sessionId)
                .collection('messages');

            const snapshot = await messagesRef
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            if (snapshot.empty) return [];

            const history: ChatMessage[] = snapshot.docs
                .map(doc => {
                    const data = doc.data();
                    return {
                        role: data.role as 'user' | 'model',
                        content: data.content,
                        timestamp: (data.timestamp as Timestamp).toDate()
                    };
                })
                .reverse();

            return history;

        } catch (error) {
            this.logger.error(`Failed to fetch history for session ${sessionId}`, error);
            return [];
        }
    }
}