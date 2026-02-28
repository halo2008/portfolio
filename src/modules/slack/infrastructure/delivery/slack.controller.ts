import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { RelayHumanResponseUseCase } from '../../../chat/application/relay-human-response.use-case';

@Controller('slack')
export class SlackController {
    private readonly logger = new Logger(SlackController.name);

    constructor(private readonly relayHumanResponse: RelayHumanResponseUseCase) {}

    @Post('events')
    @HttpCode(HttpStatus.OK)
    async handleEvent(@Body() body: any) {
        // Explaining: Slack URL verification challenge.
        if (body.type === 'url_verification') return { challenge: body.challenge };

        const event = body.event;
        // Explaining: Security - ignore bot messages to prevent loops.
        if (!event || event.bot_id || !event.thread_ts) return;

        try {
            this.logger.log(`Human reply detected in thread ${event.thread_ts}`);
            await this.relayHumanResponse.execute(event.thread_ts, event.text);
        } catch (error) {
            this.logger.warn(error.message);
        }
    }
}