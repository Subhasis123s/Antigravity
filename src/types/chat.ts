export type ChatRole = "user" | "assistant" | "system" | "tool";

export interface ChatSession {
  id: string;
  workspace_id: string;
  project_id?: string | null;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id?: string | null;
  role: ChatRole;
  content: string;
  code_snippet?: string | null;
  tokens: number;
  cost: number;
  latency_ms: number;
  attachments?: Record<string, unknown>[];
  created_at: string;
}

export interface CreateChatMessageInput {
  session_id?: string;
  workspace_id: string;
  project_id?: string;
  message: string;
  model?: string;
}
