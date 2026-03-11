export interface ChatGatewayPort {
    sendMessageToClient(socketId: string, payload: { sender: string; message: string }): void;
}
