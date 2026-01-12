import { Module, forwardRef } from "@nestjs/common";
import { SlackService } from "./slack.service";
import { SlackController } from "./slack.controller";
import { ChatModule } from "../chat/chat.module";

@Module({
    imports: [forwardRef(() => ChatModule)],
    providers: [SlackService],
    controllers: [SlackController],
    exports: [SlackService],
})
export class SlackModule { }