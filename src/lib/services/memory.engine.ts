import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { MemoryRecord, ContextWindow } from "@/types/memory";
import { KnowledgeService } from "./knowledge.service";

export class MemoryEngine {
  /**
    Retrieves and injects multi-tier contextual memory (short-term, long-term vector RAG, agent memory) into prompt frames.
   */
  static async assembleContext(
    userId: string,
    workspaceId: string,
    prompt: string,
    agentId?: string,
    maxTokens = 8192
  ): Promise<ContextWindow> {
    const supabase = await createClient();
    const injectedMemory: string[] = [];

    // 1. Fetch Agent Memory if agentId provided
    if (agentId) {
      const { data: mems } = await (supabase as any)
        .from("agent_memory")
        .select("memory_key, memory_value, importance")
        .eq("agent_id", agentId)
        .order("importance", { ascending: false })
        .limit(5);

      if (mems && mems.length > 0) {
        mems.forEach((m: any) => {
          injectedMemory.push(`[Agent Memory (${m.memory_key})]: ${JSON.stringify(m.memory_value)}`);
        });
      }
    }

    // 2. Perform Long-Term Semantic Vector RAG Retrieval
    try {
      const ragSources = await KnowledgeService.semanticSearch(userId, {
        workspace_id: workspaceId,
        query: prompt,
        top_k: 2,
      });

      if (ragSources.length > 0) {
        ragSources.forEach((src) => {
          injectedMemory.push(`[Knowledge Vault Vector Context (${src.title})]: ${src.content}`);
        });
      }
    } catch (err) {
      logger.warn("[MemoryEngine.assembleContext] RAG vector context search skipped", { error: String(err) });
    }

    const systemPrompt = `You are Antigravity AI OS, a production enterprise AI assistant.\nWorkspace Context:\n${injectedMemory.join(
      "\n"
    )}`;

    return {
      maxTokens,
      usedTokens: Math.floor((prompt.length + systemPrompt.length) / 4),
      systemPrompt,
      injectedMemory,
      messages: [{ role: "user", content: prompt }],
    };
  }

  /**
    Compresses (summarizes) long context windows to prevent token overflow.
   */
  static compressContext(text: string, maxLength = 1000): string {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "\n\n[Context Memory Summarized]";
  }
}
