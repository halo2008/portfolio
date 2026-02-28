export interface VectorDbPort {
  // Explaining: Searches for relevant context chunks based on a vector.
  // We use a scoreThreshold to filter out weak matches and save LLM tokens.
  search(vector: number[], threshold: number): Promise<string>;
}