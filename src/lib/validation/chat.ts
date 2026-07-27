import { CreateChatMessageInput } from "@/types/chat";
import { sanitizeInput } from "@/lib/security";
import { ValidationResult } from "./agent";

export function validateCreateChatMessage(body: unknown): ValidationResult<CreateChatMessageInput> {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid JSON payload." };
  }

  const p = body as Record<string, unknown>;

  const workspace_id = typeof p.workspace_id === "string" ? p.workspace_id.trim() : "";
  if (!workspace_id || workspace_id.length < 10) {
    return { valid: false, error: "Valid workspace_id is required." };
  }

  const message = typeof p.message === "string" ? sanitizeInput(p.message) : "";
  if (!message || message.trim().length === 0) {
    return { valid: false, error: "Message content cannot be empty." };
  }

  return {
    valid: true,
    data: {
      session_id: typeof p.session_id === "string" ? p.session_id : undefined,
      workspace_id,
      project_id: typeof p.project_id === "string" ? p.project_id : undefined,
      message,
      model: typeof p.model === "string" ? sanitizeInput(p.model) : "gemini-3.6-pro",
    },
  };
}
