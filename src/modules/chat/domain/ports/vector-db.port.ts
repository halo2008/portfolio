export interface VectorDbPort {
  search(vector: number[], threshold: number, filters?: { category?: string; technologies?: string[] }): Promise<string>;
}
