export interface VectorDbPort {
  // Explaining: Searches for relevant context chunks based on a vector.
  // We use a scoreThreshold to filter out weak matches and save LLM tokens.
  // Optional filters allow metadata-based filtering (category, technologies).
  search(vector: number[], threshold: number, filters?: { category?: string; technologies?: string[] }): Promise<string>;
}
