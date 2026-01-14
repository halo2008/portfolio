import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';

class ChatDto {
    message: string;
    captcha: string;
}

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    async chat(@Body() chatDto: ChatDto) {
        const stream = this.chatService.generateResponseStream(chatDto.message, chatDto.captcha);
        let fullResponse = "";
        for await (const chunk of stream) {
            fullResponse += chunk;
        }
        return { response: fullResponse };
    }
}
