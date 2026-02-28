import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Inject } from '@nestjs/common';
import { RelayHumanResponseUseCase } from '../../../chat/application/relay-human-response.use-case';
import { SlackService } from '../../slack.service';
import { Firestore } from '@google-cloud/firestore';

@Controller('slack')
export class SlackController {
    private readonly logger = new Logger(SlackController.name);

    constructor(
        private readonly relayHumanResponse: RelayHumanResponseUseCase,
        private readonly slackService: SlackService,
        @Inject('FIRESTORE_CLIENT') private readonly firestore: Firestore,
    ) {}

    @Post('events')
    @HttpCode(HttpStatus.OK)
    async handleEvent(@Body() body: any) {
        // Explaining: Slack URL verification challenge.
        if (body.type === 'url_verification') return { challenge: body.challenge };

        const event = body.event;
        if (!event) return;

        // Explaining: Security - ignore bot messages to prevent loops.
        if (event.bot_id) {
            this.logger.debug('Ignoring bot message');
            return;
        }

        // Explaining: Handle slash commands or direct mentions in threads
        const text = event.text?.toLowerCase()?.trim();

        // Command: /takeover - Enable human mode for this thread
        if (text?.includes('/takeover') || text?.includes('takeover')) {
            await this.handleTakeover(event);
            return;
        }

        // Command: /release - Disable human mode, let AI respond again
        if (text?.includes('/release') || text?.includes('release')) {
            await this.handleRelease(event);
            return;
        }

        // Explaining: Handle human replies in existing threads (only if not a command)
        if (event.thread_ts) {
            try {
                this.logger.log(`Human reply detected in thread ${event.thread_ts}`);
                await this.relayHumanResponse.execute(event.thread_ts, event.text);
            } catch (error) {
                this.logger.warn(error.message);
            }
        }
    }

    private async handleTakeover(event: any): Promise<void> {
        const threadTs = event.thread_ts || event.ts;

        try {
            // Get socketId from thread mapping
            const socketId = await this.getSocketId(threadTs);

            if (!socketId) {
                await this.slackService.logSystemEvent(threadTs, '❌ Takeover failed: No active session found');
                return;
            }

            // Enable human mode
            await this.setHumanMode(socketId, true);

            // Notify in Slack
            await this.slackService.logSystemEvent(threadTs,
                '👤 **Konrad has taken over!**\n' +
                'AI responses are now paused.\n' +
                'Type `/release` to let AI respond again.'
            );

            this.logger.log(`Human mode enabled for session ${socketId}`);
        } catch (error) {
            this.logger.error('Takeover command failed:', error.message);
            await this.slackService.logSystemEvent(threadTs, `❌ Takeover error: ${error.message}`);
        }
    }

    private async handleRelease(event: any): Promise<void> {
        const threadTs = event.thread_ts || event.ts;

        try {
            const socketId = await this.getSocketId(threadTs);

            if (!socketId) {
                await this.slackService.logSystemEvent(threadTs, '❌ Release failed: No active session found');
                return;
            }

            // Disable human mode
            await this.setHumanMode(socketId, false);

            await this.slackService.logSystemEvent(threadTs,
                '🤖 **AI is back online!**\n' +
                'Konrad has released the conversation.'
            );

            this.logger.log(`Human mode disabled for session ${socketId}`);
        } catch (error) {
            this.logger.error('Release command failed:', error.message);
            await this.slackService.logSystemEvent(threadTs, `❌ Release error: ${error.message}`);
        }
    }

    private async getSocketId(threadTs: string): Promise<string | null> {
        const doc = await this.firestore.collection('threads').doc(threadTs).get();
        return doc.data()?.socketId || null;
    }

    private async setHumanMode(sessionId: string, enabled: boolean): Promise<void> {
        await this.firestore.collection('chats').doc(sessionId).set(
            { humanMode: enabled, humanModeUpdatedAt: new Date() },
            { merge: true }
        );
    }
}
