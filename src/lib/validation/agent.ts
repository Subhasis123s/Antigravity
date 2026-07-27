import { CreateAgentInput, UpdateAgentInput, RunAgentInput } from "@/types/agent";
import { sanitizeInput } from "@/lib/security";

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  error?: string;
}

export function validateCreateAgent(body: unknown): ValidationResult<CreateAgentInput> {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid JSON body." };
  }

  const p = body as Record<string, unknown>;

  const workspace_id = typeof p.workspace_id === "string" ? p.workspace_id.trim() : "";
  if (!workspace_id || workspace_id.length < 10) {
    return { valid: false, error: "Valid workspace_id is required." };
  }

  const name = typeof p.name === "string" ? sanitizeInput(p.name) : "";
  if (!name || name.length < 2 || name.length > 80) {
    return { valid: false, error: "Agent name must be between 2 and 80 characters." };
  }

  const description = typeof p.description === "string" ? sanitizeInput(p.description) : "";
  const model = typeof p.model === "string" ? sanitizeInput(p.model) : "gemini-3.6-pro";
  const provider = typeof p.provider === "string" ? sanitizeInput(p.provider) : "google";
  const system_prompt =
    typeof p.system_prompt === "string"
      ? sanitizeInput(p.system_prompt)
      : "You are an autonomous AI coding subagent.";

  const temperature = typeof p.temperature === "number" ? Math.min(1, Math.max(0, p.temperature)) : 0.7;
  const max_tokens = typeof p.max_tokens === "number" ? Math.min(32000, Math.max(256, p.max_tokens)) : 4096;

  return {
    valid: true,
    data: {
      workspace_id,
      project_id: typeof p.project_id === "string" ? p.project_id : undefined,
      name,
      description,
      model,
      provider,
      system_prompt,
      temperature,
      max_tokens,
      avatar: typeof p.avatar === "string" ? sanitizeInput(p.avatar) : "bot",
      color: typeof p.color === "string" ? p.color : "#6E56CF",
      tools_enabled: Array.isArray(p.tools_enabled) ? p.tools_enabled.map((t) => String(t)) : ["code_search", "file_edit"],
      memory_enabled: typeof p.memory_enabled === "boolean" ? p.memory_enabled : true,
    },
  };
}

export function validateUpdateAgent(body: unknown): ValidationResult<UpdateAgentInput> {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid JSON body." };
  }

  const p = body as Record<string, unknown>;
  const updates: UpdateAgentInput = {};

  if (typeof p.name === "string") {
    const clean = sanitizeInput(p.name);
    if (clean.length < 2 || clean.length > 80) {
      return { valid: false, error: "Agent name must be between 2 and 80 characters." };
    }
    updates.name = clean;
  }

  if (typeof p.description === "string") {
    updates.description = sanitizeInput(p.description);
  }

  if (typeof p.model === "string") {
    updates.model = sanitizeInput(p.model);
  }

  if (typeof p.system_prompt === "string") {
    updates.system_prompt = sanitizeInput(p.system_prompt);
  }

  if (typeof p.temperature === "number") {
    updates.temperature = Math.min(1, Math.max(0, p.temperature));
  }

  if (typeof p.status === "string" && ["active", "idle", "paused", "running", "error"].includes(p.status)) {
    updates.status = p.status as any;
  }

  return { valid: true, data: updates };
}

export function validateRunAgent(body: unknown): ValidationResult<RunAgentInput> {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid JSON body." };
  }

  const p = body as Record<string, unknown>;
  const prompt = typeof p.prompt === "string" ? sanitizeInput(p.prompt) : "";

  if (!prompt || prompt.length < 1) {
    return { valid: false, error: "Prompt is required to run subagent." };
  }

  return {
    valid: true,
    data: {
      prompt,
      input_data: typeof p.input_data === "object" ? (p.input_data as Record<string, unknown>) : undefined,
    },
  };
}
