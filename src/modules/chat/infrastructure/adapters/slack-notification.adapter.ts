import { Injectable } from '@nestjs/common';
import { NotificationPort } from '../../domain/ports/notification.port';
import { SlackService } from '../../../../modules/slack/slack.service';

@Injectable()
export class SlackNotificationAdapter implements NotificationPort {
  constructor(private readonly slackService: SlackService) {}

  async logConversationStart(message: string, sessionId?: string): Promise<string | null> {
    return this.slackService.logNewConversation(message, sessionId);
  }

  async logUserMessage(threadId: string, message: string): Promise<void> {
    await this.slackService.logUserMessage(threadId, message);
  }

  async logAiResponse(threadId: string, response: string): Promise<void> {
    await this.slackService.logAiResponse(threadId, response);
  }

  async logSystemEvent(threadId: string, event: string): Promise<void> {
    await this.slackService.logSystemEvent(threadId, event);
  }
}
