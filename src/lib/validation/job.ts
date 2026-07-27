import { CreateJobInput } from "@/types/job";
import { ValidationResult } from "./secret";

export function validateCreateJob(body: unknown): ValidationResult<CreateJobInput> {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid JSON payload." };
  }

  const p = body as Record<string, unknown>;

  const workspace_id = typeof p.workspace_id === "string" ? p.workspace_id.trim() : "";
  if (!workspace_id || workspace_id.length < 10) {
    return { valid: false, error: "Valid workspace_id is required." };
  }

  const job_type = typeof p.job_type === "string" ? p.job_type : "";
  if (!["embedding_generation", "knowledge_indexing", "agent_execution", "cleanup_job"].includes(job_type)) {
    return { valid: false, error: "Invalid job_type specified." };
  }

  const payload = typeof p.payload === "object" && p.payload !== null ? (p.payload as Record<string, unknown>) : {};

  return {
    valid: true,
    data: {
      workspace_id,
      job_type: job_type as any,
      payload,
      max_attempts: typeof p.max_attempts === "number" ? Math.min(10, Math.max(1, p.max_attempts)) : 3,
    },
  };
}
