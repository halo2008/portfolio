export interface ChatGatewayPort {
    // Explaining: Abstract method to send a message to a specific client.
    sendMessageToClient(socketId: string, payload: { sender: string; message: string }): void;
}