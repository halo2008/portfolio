import { Injectable } from '@nestjs/common';
import { NotificationPort } from '../../domain/ports/notification.port';
import { SlackService } from '../../../../modules/slack/slack.service';

@Injectable()
export class SlackNotificationAdapter implements NotificationPort {
  constructor(private readonly slackService: SlackService) {}

  async logConversationStart(message: string, sessionId?: string): Promise<string | null> {
    // Explaining: Using existing SlackService to log a new thread.
    return this.slackService.logNewConversation(message, sessionId);
  }

  async logAiResponse(threadId: string, response: string): Promise<void> {
    // Explaining: Sending the final AI response to the specific Slack thread.
    await this.slackService.logAiResponse(threadId, response);
  }
}