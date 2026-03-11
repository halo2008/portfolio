import { Controller, Post, Body, HttpCode, HttpStatus, Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { RelayHumanResponseUseCase } from '../../../chat/application/relay-human-response.use-case';
import { SlackService } from '../../slack.service';
import { FirestorePersistenceAdapter } from '../../../chat/infrastructure/adapters/firestore-persistence.adapter';
import { SlackSignatureGuard } from '../guards/slack-signature.guard';

interface SlackEventPayload {
    type?: string;
    challenge?: string;
    event?: {
        bot_id?: string;
        text?: string;
        thread_ts?: string;
        ts?: string;
    };
}

@Controller('slack')
export class SlackController {
    private readonly logger = new Logger(SlackController.name);

    constructor(
        private readonly relayHumanResponse: RelayHumanResponseUseCase,
        private readonly slackService: SlackService,
        private readonly persistence: FirestorePersistenceAdapter,
    ) { }

    @Post('events')
    @UseGuards(SlackSignatureGuard)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: false, whitelist: false, forbidNonWhitelisted: false }))
    async handleEvent(@Body() body: SlackEventPayload) {
        if (body.type === 'url_verification') return { challenge: body.challenge };

        const event = body.event;
        if (!event) return;

        if (event.bot_id) {
            this.logger.debug('Ignoring bot message');
            return;
        }

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
            const socketId = await this.persistence.getSocketId(threadTs);

            if (!socketId) {
                await this.slackService.logSystemEvent(threadTs, '❌ Takeover failed: No active session found');
                return;
            }

            await this.persistence.setHumanMode(socketId, true);

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
            const socketId = await this.persistence.getSocketId(threadTs);

            if (!socketId) {
                await this.slackService.logSystemEvent(threadTs, '❌ Release failed: No active session found');
                return;
            }

            await this.persistence.setHumanMode(socketId, false);

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
}

