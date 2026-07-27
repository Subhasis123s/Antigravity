export type JobType =
  | "embedding_generation"
  | "knowledge_indexing"
  | "agent_execution"
  | "cleanup_job";

export type JobStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";

export interface BackgroundJob {
  id: string;
  workspace_id: string;
  job_type: JobType;
  payload: Record<string, unknown>;
  status: JobStatus;
  attempts: number;
  max_attempts: number;
  error?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export interface JobLog {
  id: string;
  job_id: string;
  log_level: "info" | "warn" | "error" | "debug";
  message: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface CreateJobInput {
  workspace_id: string;
  job_type: JobType;
  payload: Record<string, unknown>;
  max_attempts?: number;
}
