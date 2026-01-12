import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
    cors: {
        origin: '*', // In production, restrict this to your frontend domain
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);

    constructor(private readonly chatService: ChatService) { }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('messageToServer')
    async handleMessage(
        @MessageBody() payload: { text: string },
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        this.logger.log(`Received message from ${client.id}: ${payload.text}`);

        try {
            const stream = this.chatService.generateResponseStream(payload.text, client.id);

            for await (const chunk of stream) {
                client.emit('messageToClient', { sender: 'AI', message: chunk, isChunk: true });
            }

            // Optional: Emit a 'done' event if the client needs to know explicitly
            client.emit('streamComplete', { sender: 'AI' });

        } catch (error) {
            this.logger.error(`Error processing message: ${error.message}`);
            client.emit('messageToClient', { sender: 'System', message: 'Error processing your request.' });
        }
    }

    // Method to send a message to a specific client (used by SlackController)
    sendMessageToClient(socketId: string, payload: { sender: string; message: string }) {
        this.server.to(socketId).emit('messageToClient', payload);
    }
}
