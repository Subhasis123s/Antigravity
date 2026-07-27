import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { WorkspaceSecret, CreateSecretInput } from "@/types/secret";

const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET_KEY || "antigravity_master_secret_32bytes!!"; // 32 bytes key

export class SecretsService {
  /**
    Encrypts a secret string using AES-256-GCM.
   */
  private static encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${tag}:${encrypted}`;
  }

  /**
    Decrypts an AES-256-GCM encrypted payload string.
   */
  private static decrypt(encryptedData: string): string {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) return textFallback(encryptedData);
    const iv = Buffer.from(parts[0], "hex");
    const tag = Buffer.from(parts[1], "hex");
    const encryptedText = parts[2];
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  /**
    Generates masked key hint for display (e.g. `sk-proj-...8a1f`).
   */
  private static maskSecret(secret: string): string {
    if (secret.length <= 8) return "••••••••";
    return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
  }

  /**
    Stores a new workspace API secret in `workspace_secrets` with AES-256 encryption.
   */
  static async createSecret(userId: string, input: CreateSecretInput): Promise<WorkspaceSecret> {
    const supabase = await createClient();

    const encrypted = this.encrypt(input.secret_value);
    const hint = this.maskSecret(input.secret_value);

    const { data: secret, error } = await (supabase as any)
      .from("workspace_secrets")
      .upsert({
        workspace_id: input.workspace_id,
        key_name: input.key_name,
        encrypted_value: encrypted,
        key_hint: hint,
        provider: input.provider || "custom",
      })
      .select("id, workspace_id, key_name, key_hint, provider, created_at, updated_at")
      .single();

    if (error || !secret) {
      logger.error("[SecretsService.createSecret] Insert failed", error, { userId, input });
      throw new Error("Failed to store workspace secret.");
    }

    return secret as WorkspaceSecret;
  }

  /**
    Retrieves all secret headers (hints only, no plain text) for a workspace.
   */
  static async getSecrets(userId: string, workspaceId: string): Promise<WorkspaceSecret[]> {
    const supabase = await createClient();

    const { data: secrets, error } = await (supabase as any)
      .from("workspace_secrets")
      .select("id, workspace_id, key_name, key_hint, provider, created_at, updated_at")
      .eq("workspace_id", workspaceId)
      .order("key_name", { ascending: true });

    if (error) {
      logger.error("[SecretsService.getSecrets] Fetch failed", error, { userId, workspaceId });
      throw new Error("Failed to fetch workspace secrets list.");
    }

    return (secrets as WorkspaceSecret[]) || [];
  }

  /**
    Retrieves decrypted raw secret value for internal backend LLM provider initialization.
   */
  static async getDecryptedSecret(workspaceId: string, keyName: string): Promise<string | null> {
    try {
      const supabase = await createClient();

      const { data: secret, error } = await (supabase as any)
        .from("workspace_secrets")
        .select("encrypted_value")
        .eq("workspace_id", workspaceId)
        .eq("key_name", keyName)
        .single();

      if (error || !secret) return null;

      return this.decrypt(secret.encrypted_value);
    } catch (err) {
      logger.error("[SecretsService.getDecryptedSecret] Decryption failed", err, { workspaceId, keyName });
      return null;
    }
  }

  /**
    Deletes a workspace secret.
   */
  static async deleteSecret(userId: string, secretId: string): Promise<{ success: boolean }> {
    const supabase = await createClient();

    const { error } = await (supabase as any)
      .from("workspace_secrets")
      .delete()
      .eq("id", secretId);

    if (error) {
      logger.error("[SecretsService.deleteSecret] Delete failed", error, { userId, secretId });
      throw new Error("Failed to delete workspace secret.");
    }

    return { success: true };
  }
}

function textFallback(text: string): string {
  try {
    return Buffer.from(text, "base64").toString("utf8");
  } catch {
    return text;
  }
}
