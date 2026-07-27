import { AIProviderType } from "./provider";

export interface WorkspaceSecret {
  id: string;
  workspace_id: string;
  key_name: string;
  key_hint: string;
  provider: AIProviderType | "custom";
  created_at: string;
  updated_at: string;
}

export interface CreateSecretInput {
  workspace_id: string;
  key_name: string;
  secret_value: string;
  provider?: AIProviderType | "custom";
}
