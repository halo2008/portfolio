export interface ChatProviderPort {
  /**
   * Generates a stream of text chunks from an AI provider.
   * Explaining: We define an AsyncGenerator to handle streaming in a non-blocking way.
   */
  generateResponseStream(
    message: string, 
    context: string, 
    history: any[]
  ): AsyncGenerator<string>;

  /**
   * Transforms text into a vector representation for RAG.
   * Explaining: This is required for our vector search logic in the Use Case.
   */
  generateEmbedding(text: string): Promise<number[]>;
}