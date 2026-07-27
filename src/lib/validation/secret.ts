import { CreateSecretInput } from "@/types/secret";
import { sanitizeInput } from "@/lib/security";

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  error?: string;
}

export function validateCreateSecret(body: unknown): ValidationResult<CreateSecretInput> {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid JSON payload." };
  }

  const p = body as Record<string, unknown>;

  const workspace_id = typeof p.workspace_id === "string" ? p.workspace_id.trim() : "";
  if (!workspace_id || workspace_id.length < 10) {
    return { valid: false, error: "Valid workspace_id is required." };
  }

  const key_name = typeof p.key_name === "string" ? sanitizeInput(p.key_name).toUpperCase() : "";
  if (!key_name || key_name.length < 2 || key_name.length > 50) {
    return { valid: false, error: "Secret key name must be between 2 and 50 uppercase characters." };
  }

  const secret_value = typeof p.secret_value === "string" ? p.secret_value.trim() : "";
  if (!secret_value || secret_value.length < 5) {
    return { valid: false, error: "Secret key value is required and must be at least 5 characters long." };
  }

  return {
    valid: true,
    data: {
      workspace_id,
      key_name,
      secret_value,
      provider: typeof p.provider === "string" ? (p.provider as any) : "custom",
    },
  };
}
