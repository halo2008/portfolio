import { Module, Global, forwardRef } from '@nestjs/common';
import { SlackProvider } from './slack.provider';
import { SlackService } from './slack.service';
import { SlackController } from './infrastructure/delivery/slack.controller';
import { ChatModule } from '../chat/chat.module';
import { Firestore } from '@google-cloud/firestore';

const firestoreProvider = {
  provide: 'FIRESTORE_CLIENT',
  useFactory: () => new Firestore(),
};

@Global() // Explaining: Making it Global so ChatModule can easily access the Slack client/service.
@Module({
    imports: [forwardRef(() => ChatModule)],
    providers: [
        SlackProvider,
        SlackService,
        firestoreProvider,
    ],
    controllers: [SlackController],
    exports: [SlackProvider, SlackService], // Explaining: Exporting both to allow usage in other modules' adapters.
})
export class SlackModule { }
