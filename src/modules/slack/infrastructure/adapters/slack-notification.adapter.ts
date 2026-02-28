import { Injectable, Inject } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { WebClient } from '@slack/web-api';
import { NotificationPort } from '../../../chat/domain/ports/notification.port';
import { SLACK_CLIENT } from '../../slack.provider';

@Injectable()
export class SlackNotificationAdapter implements NotificationPort {
    private readonly CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

    constructor(
        @Inject(SLACK_CLIENT) private readonly slack: WebClient,
        private readonly logger: PinoLogger
    ) {
        this.logger.setContext(SlackNotificationAdapter.name);
    }

    async logConversationStart(message: string, sessionId?: string): Promise<string | null> {
        try {
            const result = await this.slack.chat.postMessage({
                channel: this.CHANNEL_ID!,
                text: `🆕 *New Message*\nSession: \`${sessionId || 'N/A'}\`\n\n> ${message}`,
                mrkdwn: true,
            });
            this.logger.info({
                msg: 'Slack conversation start logged',
                channel: this.CHANNEL_ID,
                sessionId,
                messageLength: message.length
            });
            return result.ts as string;
        } catch (error) {
            this.logger.error({
                msg: 'Slack postMessage failed',
                error: error.message,
                sessionId
            });
            return null;
        }
    }

    async logAiResponse(threadTs: string, aiResponse: string): Promise<void> {
        try {
            await this.slack.chat.postMessage({
                channel: this.CHANNEL_ID!,
                text: `🤖 *AI:*\n${aiResponse}`,
                thread_ts: threadTs,
            });
            this.logger.info({
                msg: 'Slack AI response logged',
                channel: this.CHANNEL_ID,
                thread_ts: threadTs,
                responseLength: aiResponse.length
            });
        } catch (error) {
            this.logger.error({
                msg: 'Slack reply failed',
                error: error.message,
                thread_ts: threadTs
            });
        }
    }
}