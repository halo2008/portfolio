import { ChatMessage } from "../entities/chat-message.entity";

export interface PersistencePort {
  saveMessage(sessionId: string, role: string, content: string): Promise<void>;
  getHistory(sessionId: string, limit: number): Promise<ChatMessage[]>;
  linkThread(threadTs: string, socketId: string): Promise<void>;
  getSocketId(threadTs: string): Promise<string | null>;
  getThreadBySocketId(socketId: string): Promise<string | null>;
  setHumanMode(sessionId: string, enabled: boolean): Promise<void>;
  isHumanMode(sessionId: string): Promise<boolean>;
}
