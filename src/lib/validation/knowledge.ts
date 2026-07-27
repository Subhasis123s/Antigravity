import { UploadKnowledgeInput, SemanticQueryInput } from "@/types/knowledge";
import { sanitizeInput } from "@/lib/security";
import { ValidationResult } from "./agent";

export function validateUploadKnowledge(body: unknown): ValidationResult<UploadKnowledgeInput> {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid JSON payload." };
  }

  const p = body as Record<string, unknown>;

  const workspace_id = typeof p.workspace_id === "string" ? p.workspace_id.trim() : "";
  if (!workspace_id || workspace_id.length < 10) {
    return { valid: false, error: "Valid workspace_id is required." };
  }

  const title = typeof p.title === "string" ? sanitizeInput(p.title) : "";
  if (!title || title.length < 2 || title.length > 150) {
    return { valid: false, error: "Title must be between 2 and 150 characters." };
  }

  const filename = typeof p.filename === "string" ? sanitizeInput(p.filename) : "document.txt";
  const content = typeof p.content === "string" ? p.content : "";

  if (!content || content.trim().length === 0) {
    return { valid: false, error: "Document content cannot be empty." };
  }

  return {
    valid: true,
    data: {
      workspace_id,
      project_id: typeof p.project_id === "string" ? p.project_id : undefined,
      title,
      filename,
      content,
      mime_type: typeof p.mime_type === "string" ? p.mime_type : "text/plain",
    },
  };
}

export function validateSemanticQuery(body: unknown): ValidationResult<SemanticQueryInput> {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid JSON payload." };
  }

  const p = body as Record<string, unknown>;

  const query = typeof p.query === "string" ? sanitizeInput(p.query) : "";
  if (!query || query.trim().length === 0) {
    return { valid: false, error: "Search query cannot be empty." };
  }

  return {
    valid: true,
    data: {
      workspace_id: typeof p.workspace_id === "string" ? p.workspace_id : undefined,
      project_id: typeof p.project_id === "string" ? p.project_id : undefined,
      query,
      top_k: typeof p.top_k === "number" ? Math.min(50, Math.max(1, p.top_k)) : 10,
    },
  };
}
