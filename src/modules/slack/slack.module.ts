import { Module, Global } from '@nestjs/common';
import { SlackProvider } from './slack.provider';
import { SlackService } from './slack.service';
import { SlackController } from './infrastructure/delivery/slack.controller';

@Global() // Explaining: Making it Global so ChatModule can easily access the Slack client/service.
@Module({
    providers: [SlackProvider, SlackService],
    controllers: [SlackController],
    exports: [SlackProvider, SlackService], // Explaining: Exporting both to allow usage in other modules' adapters.
})
export class SlackModule { }