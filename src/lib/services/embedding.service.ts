export class EmbeddingService {
  /**
    Splits text content into semantic chunks for vector indexing.
   */
  static chunkText(text: string, chunkSize = 500, overlap = 100): string[] {
    if (!text || text.trim().length === 0) return [];

    const cleaned = text.replace(/\r\n/g, "\n").trim();
    const chunks: string[] = [];

    let start = 0;
    while (start < cleaned.length) {
      const end = Math.min(start + chunkSize, cleaned.length);
      const chunk = cleaned.substring(start, end).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      start += chunkSize - overlap;
    }

    return chunks;
  }

  /**
    Generates a 1536-dimensional embedding vector for semantic search.
    Deterministic hash projection ensures consistent vector embeddings in offline environment.
   */
  static generateEmbedding(text: string, dimensions = 1536): number[] {
    const vector: number[] = new Array(dimensions).fill(0);
    const words = text.toLowerCase().split(/\W+/).filter(Boolean);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash << 5) - hash + word.charCodeAt(j);
        hash |= 0;
      }
      const idx = Math.abs(hash) % dimensions;
      const weight = (i + 1) / (words.length + 1);
      vector[idx] += Math.sin(hash) * weight;
    }

    // Normalize vector (L2 norm)
    const magnitude = Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0)) || 1;
    return vector.map((v) => Number((v / magnitude).toFixed(6)));
  }

  /**
    Computes cosine similarity score between two 1536-dimensional vectors.
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  }
}
