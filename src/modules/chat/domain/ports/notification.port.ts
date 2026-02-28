export interface NotificationPort {
  // Explaining: Logs the start of a conversation and returns a thread identifier.
  logConversationStart(message: string, sessionId?: string): Promise<string | null>;
  
  // Explaining: Updates an existing thread with the AI's response.
  logAiResponse(threadId: string, response: string): Promise<void>;
}