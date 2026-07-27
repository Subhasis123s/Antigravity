export type AgentStatus = "active" | "idle" | "paused" | "running" | "error";

export type AgentRunStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface Agent {
  id: string;
  workspace_id: string;
  project_id?: string | null;
  owner_id: string;
  name: string;
  description: string;
  model: string;
  provider: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  status: AgentStatus;
  avatar: string;
  color: string;
  tools_enabled: string[];
  permissions: Record<string, unknown>;
  memory_enabled: boolean;
  vector_namespace: string;
  created_at: string;
  updated_at: string;
}

export interface AgentRun {
  id: string;
  agent_id: string;
  user_id?: string | null;
  status: AgentRunStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error?: string | null;
  tokens_prompt: number;
  tokens_completion: number;
  latency_ms: number;
  cost: number;
  started_at: string;
  completed_at?: string | null;
}

export interface AgentMemory {
  id: string;
  agent_id: string;
  memory_key: string;
  memory_value: Record<string, unknown>;
  importance: number;
  created_at: string;
  updated_at: string;
}

export interface AgentTool {
  id: string;
  agent_id: string;
  tool_name: string;
  enabled: boolean;
  permissions: Record<string, unknown>;
  configuration: Record<string, unknown>;
  created_at: string;
}

export interface CreateAgentInput {
  workspace_id: string;
  project_id?: string;
  name: string;
  description?: string;
  model?: string;
  provider?: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
  avatar?: string;
  color?: string;
  tools_enabled?: string[];
  memory_enabled?: boolean;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  model?: string;
  provider?: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
  status?: AgentStatus;
  avatar?: string;
  color?: string;
  tools_enabled?: string[];
  memory_enabled?: boolean;
}

export interface RunAgentInput {
  prompt: string;
  input_data?: Record<string, unknown>;
}
