export interface NotificationPort {
  // Explaining: Logs the start of a conversation and returns a thread identifier.
  logConversationStart(message: string, sessionId?: string): Promise<string | null>;

  // Explaining: Logs each user message to the Slack thread (full history).
  logUserMessage(threadId: string, message: string): Promise<void>;

  // Explaining: Updates an existing thread with the AI's response.
  logAiResponse(threadId: string, response: string): Promise<void>;

  // Explaining: Sends a system notification (e.g., human takeover).
  logSystemEvent(threadId: string, event: string): Promise<void>;
}
