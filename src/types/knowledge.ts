export type KnowledgeStatus = "uploading" | "processing" | "indexed" | "error";

export interface KnowledgeDocument {
  id: string;
  workspace_id: string;
  project_id?: string | null;
  uploaded_by: string;
  title: string;
  filename: string;
  mime_type: string;
  size: number;
  status: KnowledgeStatus;
  created_at: string;
}

export interface KnowledgeChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  embedding?: number[] | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface UploadKnowledgeInput {
  workspace_id: string;
  project_id?: string;
  title: string;
  filename: string;
  content: string;
  mime_type?: string;
}

export interface SemanticQueryInput {
  workspace_id?: string;
  project_id?: string;
  query: string;
  top_k?: number;
}

export interface SemanticSearchResult {
  chunk_id: string;
  document_id: string;
  title: string;
  filename: string;
  content: string;
  similarity: number;
}
