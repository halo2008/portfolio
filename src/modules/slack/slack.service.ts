import { Injectable, Inject, Logger } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { SLACK_CLIENT } from './slack.provider';

@Injectable()
export class SlackService {
    private readonly logger = new Logger(SlackService.name);
    private readonly CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

    // Explaining: Injecting the pre-configured Slack client via our custom token.
    constructor(@Inject(SLACK_CLIENT) private readonly slackClient: WebClient) {}

    async logNewConversation(userMessage: string, socketId?: string): Promise<string | null> {
        try {
            const result = await this.slackClient.chat.postMessage({
                channel: this.CHANNEL_ID!,
                text: `🆕 *New Connection*\nSocket: \`${socketId}\`\n\n> ${userMessage}`,
            });
            return result.ts as string;
        } catch (error) {
            this.logger.error('Slack logging failed', error);
            return null;
        }
    }

    async logAiResponse(threadTs: string, aiResponse: string): Promise<void> {
        try {
            await this.slackClient.chat.postMessage({
                channel: this.CHANNEL_ID!,
                text: `🤖 *AI:*
${aiResponse}`,
                thread_ts: threadTs,
            });
        } catch (error) {
            this.logger.error('Slack reply failed', error);
        }
    }
}