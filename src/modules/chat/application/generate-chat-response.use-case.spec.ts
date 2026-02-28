import { GenerateChatResponseUseCase } from './generate-chat-response.use-case';
import { ChatProviderPort } from '../domain/ports/chat-provider.port';
import { PersistencePort } from '../domain/ports/persistence.port';
import { VectorDbPort } from '../domain/ports/vector-db.port';
import { NotificationPort } from '../domain/ports/notification.port';

describe('GenerateChatResponseUseCase', () => {
    let useCase: GenerateChatResponseUseCase;
    let ai: jest.Mocked<ChatProviderPort>;
    let repository: jest.Mocked<PersistencePort>;
    let vectorDb: jest.Mocked<VectorDbPort>;
    let notification: jest.Mocked<NotificationPort>;

    beforeEach(() => {
        ai = {
            generateResponseStream: jest.fn(),
            generateEmbedding: jest.fn(),
        } as unknown as jest.Mocked<ChatProviderPort>;

        repository = {
            saveMessage: jest.fn(),
            getHistory: jest.fn(),
            linkThread: jest.fn(),
            getSocketId: jest.fn(),
            setHumanMode: jest.fn(),
            isHumanMode: jest.fn(),
        } as unknown as jest.Mocked<PersistencePort>;

        vectorDb = {
            search: jest.fn(),
        } as unknown as jest.Mocked<VectorDbPort>;

        notification = {
            logConversationStart: jest.fn(),
            logUserMessage: jest.fn(),
            logAiResponse: jest.fn(),
            logSystemEvent: jest.fn(),
        } as unknown as jest.Mocked<NotificationPort>;

        useCase = new GenerateChatResponseUseCase(ai, repository, vectorDb, notification);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should check human mode and skip AI response if active', async () => {
            repository.isHumanMode.mockResolvedValue(true);

            const generator = useCase.execute('Hello', 'session-123');
            const result = await generator.next();

            expect(result.value).toBe('[Konrad has taken over the conversation. AI is paused.]');
            expect(result.done).toBe(true);
            expect(ai.generateResponseStream).not.toHaveBeenCalled();
        });

        it('should generate AI response when human mode is inactive', async () => {
            repository.isHumanMode.mockResolvedValue(false);
            repository.getHistory.mockResolvedValue([]);
            ai.generateEmbedding.mockResolvedValue(new Array(768).fill(0.1));
            vectorDb.search.mockResolvedValue('Some context');
            notification.logConversationStart.mockResolvedValue('thread-123');

            async function* mockStream() {
                yield 'Hello';
                yield ' world';
            }
            ai.generateResponseStream.mockReturnValue(mockStream() as any);

            const generator = useCase.execute('Hi there', 'session-123');
            const chunks: string[] = [];

            for await (const chunk of generator) {
                chunks.push(chunk);
            }

            expect(chunks).toEqual(['Hello', ' world']);
            expect(repository.saveMessage).toHaveBeenCalledWith('session-123', 'user', 'Hi there');
            expect(repository.saveMessage).toHaveBeenCalledWith('session-123', 'model', 'Hello world');
        });
    });
});
