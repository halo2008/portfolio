import { PersistencePort } from '../../domain/ports/persistence.port';
import { ChatMessage } from '../../domain/entities/chat-message.entity';
import { Injectable, Inject } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';

@Injectable()
export class FirestorePersistenceAdapter implements PersistencePort {
  constructor(@Inject('FIRESTORE_CLIENT') private readonly firestore: Firestore) {}

  async saveMessage(sessionId: string, role: 'user' | 'model', content: string): Promise<void> {
    await this.firestore.collection('chats').doc(sessionId).collection('messages').add({
      role,
      content,
      createdAt: new Date()
    });
  }

  async getHistory(sessionId: string, limit: number): Promise<ChatMessage[]> {
    const snapshot = await this.firestore.collection('chats')
      .doc(sessionId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({
      role: doc.data().role,
      content: doc.data().content,
      timestamp: doc.data().createdAt.toDate()
    })).reverse();
  }

  async linkThread(threadTs: string, socketId: string): Promise<void> {
    // Explaining: Store bidirectional mapping for easy lookups
    await this.firestore.collection('threads').doc(threadTs).set({ socketId, threadTs });
    // Also store reverse mapping
    await this.firestore.collection('chat_sessions').doc(socketId).set({ threadTs, socketId }, { merge: true });
  }

  async getSocketId(threadTs: string): Promise<string | null> {
    const doc = await this.firestore.collection('threads').doc(threadTs).get();
    return doc.data()?.socketId || null;
  }

  // Explaining: Get thread timestamp by socket session ID (reverse lookup)
  async getThreadBySocketId(socketId: string): Promise<string | null> {
    const doc = await this.firestore.collection('chat_sessions').doc(socketId).get();
    return doc.data()?.threadTs || null;
  }

  // Explaining: Human-in-the-loop mode management.
  async setHumanMode(sessionId: string, enabled: boolean): Promise<void> {
    await this.firestore.collection('chats').doc(sessionId).set(
      { humanMode: enabled, humanModeUpdatedAt: new Date() },
      { merge: true }
    );
  }

  async isHumanMode(sessionId: string): Promise<boolean> {
    const doc = await this.firestore.collection('chats').doc(sessionId).get();
    return doc.data()?.humanMode || false;
  }
}
