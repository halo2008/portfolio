import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';

class ChatDto {
    message: string;
}

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    async chat(@Body() chatDto: ChatDto) {
        const response = await this.chatService.generateResponse(chatDto.message);
        return { response };
    }
}
