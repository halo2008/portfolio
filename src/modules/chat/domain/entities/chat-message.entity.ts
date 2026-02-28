export interface ChatMessage {
  role: 'user' | 'model' | 'system'; // Explaining: Strict typing for AI roles.
  content: string; // Explaining: The text content of the message.
  timestamp: Date; // Explaining: Metadata for ordering history.
}