import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export type AiAuditAction =
  | "AGENT_CREATED"
  | "AGENT_UPDATED"
  | "AGENT_DELETED"
  | "AGENT_EXECUTED"
  | "PROMPT_SENT"
  | "RESPONSE_RECEIVED"
  | "KNOWLEDGE_UPLOADED"
  | "KNOWLEDGE_DELETED"
  | "SEMANTIC_SEARCH"
  | "DOCUMENT_EMBEDDED";

export class AuditService {
  /**
    Log an AI system action to `ai_audit_logs` table and system logger.
   */
  static async logAiAction(
    workspaceId: string,
    userId: string | null,
    action: AiAuditAction,
    details: Record<string, unknown> = {},
    agentId?: string,
    documentId?: string
  ): Promise<void> {
    try {
      const supabase = await createClient();

      await (supabase as any).from("ai_audit_logs").insert({
        workspace_id: workspaceId,
        user_id: userId,
        agent_id: agentId || null,
        document_id: documentId || null,
        action,
        details,
      });

      logger.info(`[AI Audit] ${action}`, { workspaceId, userId, agentId, documentId, details });
    } catch (err) {
      logger.error(`[AI Audit Exception] Failed to log ${action}`, err, {
        workspaceId,
        userId,
      });
    }
  }
}
