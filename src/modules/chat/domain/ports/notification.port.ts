export interface NotificationPort {
  logConversationStart(message: string, sessionId?: string): Promise<string | null>;
  logUserMessage(threadId: string, message: string): Promise<void>;
  logAiResponse(threadId: string, response: string): Promise<void>;
  logSystemEvent(threadId: string, event: string): Promise<void>;
}
