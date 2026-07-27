import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export class BillingService {
  /**
    Record token and storage usage for a workspace in `workspace_usage`.
   */
  static async recordUsage(
    workspaceId: string,
    tokens: number,
    cost: number,
    storageDeltaBytes = 0
  ): Promise<void> {
    try {
      const supabase = await createClient();

      const { data: existing } = await (supabase as any)
        .from("workspace_usage")
        .select("id, tokens_used, cost_estimate, storage_bytes, executions_count")
        .eq("workspace_id", workspaceId)
        .limit(1)
        .maybeSingle();

      if (existing) {
        await (supabase as any)
          .from("workspace_usage")
          .update({
            tokens_used: Number(existing.tokens_used || 0) + tokens,
            cost_estimate: Number(existing.cost_estimate || 0) + cost,
            storage_bytes: Number(existing.storage_bytes || 0) + storageDeltaBytes,
            executions_count: Number(existing.executions_count || 0) + 1,
          })
          .eq("id", existing.id);
      } else {
        await (supabase as any).from("workspace_usage").insert({
          workspace_id: workspaceId,
          tokens_used: tokens,
          cost_estimate: cost,
          storage_bytes: storageDeltaBytes,
          executions_count: 1,
        });
      }
    } catch (err) {
      logger.error("[BillingService.recordUsage] Failed to record usage", err, { workspaceId, tokens });
    }
  }

  /**
    Verifies if workspace is within monthly token quota limits.
   */
  static async checkQuota(workspaceId: string): Promise<{ allowed: boolean; remainingTokens: number }> {
    try {
      const supabase = await createClient();

      const { data: usage } = await (supabase as any)
        .from("workspace_usage")
        .select("tokens_used")
        .eq("workspace_id", workspaceId)
        .limit(1)
        .maybeSingle();

      const limit = 10000000; // 10M token limit for Pro Workspace
      const used = Number(usage?.tokens_used || 0);

      return {
        allowed: used < limit,
        remainingTokens: Math.max(0, limit - used),
      };
    } catch (err) {
      return { allowed: true, remainingTokens: 1000000 };
    }
  }
}
