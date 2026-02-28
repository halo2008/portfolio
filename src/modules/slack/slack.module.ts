import { Module, Global, forwardRef } from '@nestjs/common';
import { SlackProvider } from './slack.provider';
import { SlackService } from './slack.service';
import { SlackController } from './infrastructure/delivery/slack.controller';
import { ChatModule } from '../chat/chat.module';

@Global() // Explaining: Making it Global so ChatModule can easily access the Slack client/service.
@Module({
    imports: [forwardRef(() => ChatModule)],
    providers: [SlackProvider, SlackService],
    controllers: [SlackController],
    exports: [SlackProvider, SlackService], // Explaining: Exporting both to allow usage in other modules' adapters.
})
export class SlackModule { }