export const TELEMETRY_PORT = 'TELEMETRY_PORT';

export interface TelemetryPort {
    /**
     * Observe the time it takes for the LLM to generate a response.
     * @param durationMs - The duration in milliseconds
     */
    observeLlmLatency(durationMs: number): void;

    /**
     * Observe the time it takes to search the vector database.
     * @param durationMs - The duration in milliseconds
     */
    observeVectorSearchLatency(durationMs: number): void;

    /**
     * Increment the count of total AI requests handled.
     */
    incrementLlmRequests(): void;

    /**
     * Increment the count of active WebSocket connections.
     */
    incrementActiveWebSockets(): void;

    /**
     * Decrement the count of active WebSocket connections.
     */
    decrementActiveWebSockets(): void;
}
