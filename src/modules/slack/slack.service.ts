import { Injectable, Inject, Logger } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { SLACK_CLIENT } from './slack.provider';

@Injectable()
export class SlackService {
    private readonly logger = new Logger(SlackService.name);
    private readonly CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

    constructor(@Inject(SLACK_CLIENT) private readonly slackClient: WebClient) {}

    async logNewConversation(userMessage: string, socketId?: string): Promise<string | null> {
        try {
            const result = await this.slackClient.chat.postMessage({
                channel: this.CHANNEL_ID!,
                text: `🆕 *New Chat Started*
Socket: \`${socketId}\`

> ${userMessage}`,
            });
            return result.ts as string;
        } catch (error) {
            this.logger.error('Slack logging failed', error);
            return null;
        }
    }

    async logUserMessage(threadTs: string, message: string): Promise<void> {
        try {
            await this.slackClient.chat.postMessage({
                channel: this.CHANNEL_ID!,
                text: `👤 *User:*\n> ${message}`,
                thread_ts: threadTs,
            });
        } catch (error) {
            this.logger.error('Slack user message logging failed', error);
        }
    }

    async logAiResponse(threadTs: string, aiResponse: string): Promise<void> {
        try {
            await this.slackClient.chat.postMessage({
                channel: this.CHANNEL_ID!,
                text: `🤖 *AI:*\n${aiResponse}`,
                thread_ts: threadTs,
            });
        } catch (error) {
            this.logger.error('Slack AI response logging failed', error);
        }
    }

    async logSystemEvent(threadTs: string, event: string): Promise<void> {
        try {
            await this.slackClient.chat.postMessage({
                channel: this.CHANNEL_ID!,
                text: `⚙️ *System:* ${event}`,
                thread_ts: threadTs,
            });
        } catch (error) {
            this.logger.error('Slack system event logging failed', error);
        }
    }
}
