import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { GenerateChatResponseUseCase } from '../../application/generate-chat-response.use-case';
import { CaptchaGuard } from '../guards/captcha.guard';

// Explaining: DTO (Data Transfer Object) for the incoming HTTP request.
class ChatDto {
    message: string;
    sessionId: string;
    captcha: string; // Explaining: Ideally handled by a Guard, but kept here for simplicity for now.
}

@Controller('chat')
export class ChatController {
    constructor(private readonly generateChatResponse: GenerateChatResponseUseCase) {}

    @Post()
    @UseGuards(CaptchaGuard)
    @HttpCode(HttpStatus.OK)
    async chat(@Body() chatDto: ChatDto) {
        // Explaining: We call the Use Case. Since HTTP is request-response, we collect the stream.
        let fullResponse = "";
        const stream = this.generateChatResponse.execute(chatDto.message, chatDto.sessionId);
        
        for await (const chunk of stream) {
            fullResponse += chunk;
        }
        
        return { response: fullResponse };
    }
}