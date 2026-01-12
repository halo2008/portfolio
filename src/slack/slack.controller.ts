import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ConversationStateService } from '../chat/conversation-state.service'; 
// Zakładam, że masz już ChatGateway, jeśli nie - zostawiam komentarz gdzie to wpiąć
// import { ChatGateway } from '../chat/chat.gateway'; 

@Controller('slack')
export class SlackController {
    private readonly logger = new Logger(SlackController.name);

    constructor(
        private readonly conversationState: ConversationStateService,
        // private readonly chatGateway: ChatGateway, 
    ) {}

    @Post('events')
    @HttpCode(HttpStatus.OK)
    async handleSlackEvent(@Body() body: any) {
        // 1. WERYFIKACJA URL (To jest to, czego Slack potrzebuje na początku)
        if (body.type === 'url_verification') {
            this.logger.log('Slack URL verification challenge received.');
            return { challenge: body.challenge };
        }

        // 2. Obsługa zdarzeń (Events)
        const event = body.event;

        // Ignoruj wiadomości, które nie mają treści lub są od botów (np. Twojego własnego)
        if (!event || event.bot_id) {
            return; 
        }

        // Sprawdzamy, czy to odpowiedź w wątku (czyli Ty odpisujesz użytkownikowi)
        if (event.thread_ts && event.text) {
            this.logger.log(`Mentor Konrad is typing via Slack! Thread: ${event.thread_ts}`);
            
            // Pobierz SocketID z Firestore na podstawie wątku
            const socketId = await this.conversationState.getSocketId(event.thread_ts);

            if (socketId) {
                this.logger.log(`Found SocketID ${socketId} for this thread. Sending message to user...`);
                
                // TU JEST MIEJSCE NA WEBSOCKET GATEWAY
                // To wyśle wiadomość do frontendu użytkownika
                // this.chatGateway.sendMessageToClient(socketId, {
                //     sender: 'Konrad (Human)',
                //     message: event.text
                // });
                
                this.logger.log(`Message sent to user: "${event.text}"`);
            } else {
                this.logger.warn(`Orphaned thread! No active socket found for thread ${event.thread_ts}`);
                // Opcjonalnie: Odpisz na Slacku, że użytkownik się rozłączył
            }
        }
    }
}