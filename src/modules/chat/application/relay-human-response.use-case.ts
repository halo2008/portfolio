import { PersistencePort } from '../domain/ports/persistence.port';
import { ChatGatewayPort } from '../domain/ports/chat-gateway.port';

export class RelayHumanResponseUseCase {
    constructor(
        private readonly persistence: PersistencePort,
        private readonly gateway: ChatGatewayPort
    ) {}

    async execute(threadTs: string, text: string): Promise<void> {
        // 1. Logic: Map the Slack thread back to the user's socket session.
        const socketId = await this.persistence.getSocketId(threadTs);

        if (!socketId) {
            throw new Error(`Orphaned thread: No active socket found for ${threadTs}`);
        }

        // 2. Logic: Relay the message via the gateway port.
        this.gateway.sendMessageToClient(socketId, {
            sender: 'Konrad (Human)',
            message: text
        });
    }
}