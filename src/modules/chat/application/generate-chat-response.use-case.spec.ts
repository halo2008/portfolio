import { GenerateChatResponseUseCase } from './generate-chat-response.use-case';
import { ChatProviderPort } from '../domain/ports/chat-provider.port';
import { PersistencePort } from '../domain/ports/persistence.port';
import { VectorDbPort } from '../domain/ports/vector-db.port';
import { NotificationPort } from '../domain/ports/notification.port';
import { ChatMessage } from '../domain/entities/chat-message.entity';

describe('GenerateChatResponseUseCase', () => {
    let useCase: GenerateChatResponseUseCase;
    let chatProvider: jest.Mocked<ChatProviderPort>;
    let persistence: jest.Mocked<PersistencePort>;
    let vectorDb: jest.Mocked<VectorDbPort>;
    let notification: jest.Mocked<NotificationPort>;

    beforeEach(() => {
        // Mocking implementations
        chatProvider = {
            generateResponseStream: jest.fn(),
            generateEmbedding: jest.fn(),
        };

        // Explicitly casting to any or partial because we only mock used methods
        persistence = {
            saveMessage: jest.fn(),
            getHistory: jest.fn(),
            linkThread: jest.fn(),
            getSocketId: jest.fn(),
        } as any;

        vectorDb = {
            search: jest.fn(),
        };

        notification = {
            logConversationStart: jest.fn(),
            logAiResponse: jest.fn(),
        };

        useCase = new GenerateChatResponseUseCase(chatProvider, persistence, vectorDb, notification);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should orchestrate the chat flow correctly', async () => {
        // Arrange
        const message = 'Hello AI';
        const sessionId = 'test-session';
        const history: ChatMessage[] = [];
        const embedding = [0.1, 0.2];
        const context = 'Relevant context from vector DB';

        // Mock async generator
        async function* mockStream() {
            yield 'Hello';
            yield ' World';
        }

        notification.logConversationStart.mockResolvedValue('slack-thread-id');
        persistence.getHistory.mockResolvedValue(history);
        chatProvider.generateEmbedding.mockResolvedValue(embedding);
        vectorDb.search.mockResolvedValue(context);
        chatProvider.generateResponseStream.mockReturnValue(mockStream());
        persistence.saveMessage.mockResolvedValue(undefined);
        notification.logAiResponse.mockResolvedValue(undefined);

        // Act
        const resultStream = useCase.execute(message, sessionId);
        let fullResponse = '';
        for await (const chunk of resultStream) {
            fullResponse += chunk;
        }

        // Assert
        expect(notification.logConversationStart).toHaveBeenCalledWith(message, sessionId);
        expect(persistence.getHistory).toHaveBeenCalledWith(sessionId, 6);
        expect(chatProvider.generateEmbedding).toHaveBeenCalledWith(message);
        expect(vectorDb.search).toHaveBeenCalledWith(embedding, 0.6);
        expect(persistence.saveMessage).toHaveBeenCalledWith(sessionId, 'user', message);
        expect(chatProvider.generateResponseStream).toHaveBeenCalled();
        expect(fullResponse).toBe('Hello World');
        expect(persistence.saveMessage).toHaveBeenCalledWith(sessionId, 'model', 'Hello World');
        expect(notification.logAiResponse).toHaveBeenCalledWith('slack-thread-id', 'Hello World');
    });
});
