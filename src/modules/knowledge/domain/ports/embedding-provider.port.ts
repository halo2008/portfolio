export const EMBEDDING_PROVIDER_PORT = Symbol('EMBEDDING_PROVIDER_PORT');

export interface EmbeddingProviderPort {
    /**
     * Generates a batch of vector embeddings for the provided chunks of text.
     */
    generateEmbeddings(chunks: string[]): Promise<number[][]>;
}
