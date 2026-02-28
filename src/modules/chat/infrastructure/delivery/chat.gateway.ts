import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { GenerateChatResponseUseCase } from '../../application/generate-chat-response.use-case';
import { ChatGatewayPort } from '../../domain/ports/chat-gateway.port';
import { Server } from 'socket.io';
import { WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, ChatGatewayPort {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly generateChatResponse: GenerateChatResponseUseCase) { }

  sendMessageToClient(socketId: string, payload: { sender: string; message: string }): void {
    this.server.to(socketId).emit('messageToClient', payload);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('messageToServer')
  async handleMessage(
    @MessageBody() payload: { text: string; sessionId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      // Explaining: Executing the hexagonal Use Case. 
      // The Use Case yields chunks from the Gemini 2.0 stream.
      const stream = this.generateChatResponse.execute(payload.text, payload.sessionId);

      for await (const chunk of stream) {
        // Explaining: Emitting individual chunks to the client for real-time UI updates.
        client.emit('messageToClient', { sender: 'AI', message: chunk, isChunk: true });
      }

      client.emit('streamComplete', { sender: 'AI' });
    } catch (error) {
      this.logger.error(`Chat error: ${error.message}`);
      client.emit('messageToClient', { sender: 'System', message: 'Error processing your request.' });
    }
  }

  @SubscribeMessage('messageToClient')
  async handleMessageToClient(
    @MessageBody() payload: { text: string; sessionId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      // Explaining: Executing the hexagonal Use Case. 
      // The Use Case yields chunks from the Gemini 2.0 stream.
      const stream = this.generateChatResponse.execute(payload.text, payload.sessionId);

      for await (const chunk of stream) {
        // Explaining: Emitting individual chunks to the client for real-time UI updates.
        client.emit('messageToClient', { sender: 'AI', message: chunk, isChunk: true });
      }

      client.emit('streamComplete', { sender: 'AI' });
    } catch (error) {
      this.logger.error(`Chat error: ${error.message}`);
      client.emit('messageToClient', { sender: 'System', message: 'Error processing your request.' });
    }
  }
}