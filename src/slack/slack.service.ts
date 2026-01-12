import { Injectable, Logger } from '@nestjs/common';
import { WebClient } from '@slack/web-api';

@Injectable()
export class SlackService {
    private readonly logger = new Logger(SlackService.name);
    private slackClient: WebClient;
    private readonly CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

    constructor() {
        const token = process.env.SLACK_BOT_TOKEN;
        if (!token || !this.CHANNEL_ID) {
            this.logger.warn('Slack credentials missing. HITL will be disabled.');
            return;
        }
        this.slackClient = new WebClient(token);
    }

    /**
     * Starts a new thread in Slack with the user's message.
     * Returns the thread timestamp (ts) to maintain context.
     */
    async logNewConversation(userMessage: string, socketId?: string): Promise<string | null> {
        if (!this.slackClient) return null;

        try {
            const result = await this.slackClient.chat.postMessage({
                channel: this.CHANNEL_ID,
                text: `🆕 *New User Message*\nSocketID: \`${socketId || 'N/A'}\`\n\n> ${userMessage}`,
                mrkdwn: true,
            });
            return result.ts as string;
        } catch (error) {
            this.logger.error('Failed to log to Slack', error);
            return null;
        }
    }

    /**
     * Replies to the existing Slack thread with the AI's response.
     */
    async logAiResponse(threadTs: string, aiResponse: string): Promise<void> {
        if (!this.slackClient || !threadTs) return;

        try {
            await this.slackClient.chat.postMessage({
                channel: this.CHANNEL_ID,
                text: `🤖 *AI Response:*\n${aiResponse}`,
                thread_ts: threadTs,
            });
        } catch (error) {
            this.logger.error('Failed to log AI response to Slack', error);
        }
    }
}