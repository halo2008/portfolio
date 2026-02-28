import { PersistencePort } from '../../domain/ports/persistence.port';
import { ChatMessage } from '../../domain/entities/chat-message.entity';
import { Injectable, Inject } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';

@Injectable()
export class FirestorePersistenceAdapter implements PersistencePort {
  constructor(@Inject('FIRESTORE_CLIENT') private readonly firestore: Firestore) {}

  async saveMessage(sessionId: string, role: 'user' | 'model', content: string): Promise<void> {
    // Explaining: Decoupling DB structure from domain. We save with a timestamp for sorting.
    await this.firestore.collection('chats').doc(sessionId).collection('messages').add({
      role,
      content,
      createdAt: new Date()
    });
  }

  async getHistory(sessionId: string, limit: number): Promise<ChatMessage[]> {
    // Explaining: Mapping Firestore documents back to our Domain Entities.
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
    // Explaining: Logic for SRE/DevOps observability - linking Slack threads to users.
    await this.firestore.collection('threads').doc(threadTs).set({ socketId });
  }

  async getSocketId(threadTs: string): Promise<string | null> {
    const doc = await this.firestore.collection('threads').doc(threadTs).get();
    return doc.data()?.socketId || null;
  }
}