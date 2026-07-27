import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { AuditService } from "./audit.service";
import {
  Agent,
  AgentRun,
  CreateAgentInput,
  UpdateAgentInput,
  RunAgentInput,
} from "@/types/agent";

export class AgentService {
  /**
    Create a new autonomous AI subagent.
   */
  static async createAgent(userId: string, input: CreateAgentInput): Promise<Agent> {
    const supabase = await createClient();

    const { data: agent, error } = await (supabase as any)
      .from("agents")
      .insert({
        workspace_id: input.workspace_id,
        project_id: input.project_id || null,
        owner_id: userId,
        name: input.name,
        description: input.description || "",
        model: input.model || "gemini-3.6-pro",
        provider: input.provider || "google",
        system_prompt: input.system_prompt || "You are an autonomous AI coding subagent.",
        temperature: input.temperature ?? 0.7,
        max_tokens: input.max_tokens || 4096,
        avatar: input.avatar || "bot",
        color: input.color || "#6E56CF",
        tools_enabled: input.tools_enabled || ["code_search", "file_edit"],
        memory_enabled: input.memory_enabled ?? true,
      })
      .select()
      .single();

    if (error || !agent) {
      logger.error("[AgentService.createAgent] Insert failed", error, { userId, input });
      throw new Error(error?.message || "Failed to create subagent.");
    }

    await AuditService.logAiAction(
      input.workspace_id,
      userId,
      "AGENT_CREATED",
      { name: agent.name, model: agent.model },
      agent.id
    );

    return agent as Agent;
  }

  /**
    List subagents in a workspace.
   */
  static async getAgents(userId: string, workspaceId: string): Promise<Agent[]> {
    const supabase = await createClient();

    const { data: agents, error } = await (supabase as any)
      .from("agents")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("[AgentService.getAgents] Fetch failed", error, { userId, workspaceId });
      throw new Error("Failed to fetch subagents list.");
    }

    return (agents as Agent[]) || [];
  }

  /**
    Get subagent by ID.
   */
  static async getAgentById(userId: string, agentId: string): Promise<Agent> {
    const supabase = await createClient();

    const { data: agent, error } = await (supabase as any)
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .single();

    if (error || !agent) {
      throw new Error("AGENT_NOT_FOUND");
    }

    return agent as Agent;
  }

  /**
    Update subagent parameters.
   */
  static async updateAgent(userId: string, agentId: string, input: UpdateAgentInput): Promise<Agent> {
    const supabase = await createClient();

    const existing = await this.getAgentById(userId, agentId);

    const { data: updated, error } = await (supabase as any)
      .from("agents")
      .update(input)
      .eq("id", agentId)
      .select()
      .single();

    if (error || !updated) {
      logger.error("[AgentService.updateAgent] Update failed", error, { userId, agentId });
      throw new Error("Failed to update agent.");
    }

    await AuditService.logAiAction(
      existing.workspace_id,
      userId,
      "AGENT_UPDATED",
      { previousName: existing.name, newName: updated.name },
      agentId
    );

    return updated as Agent;
  }

  /**
    Delete a subagent.
   */
  static async deleteAgent(userId: string, agentId: string): Promise<{ success: boolean }> {
    const supabase = await createClient();

    const existing = await this.getAgentById(userId, agentId);

    const { error } = await (supabase as any)
      .from("agents")
      .delete()
      .eq("id", agentId);

    if (error) {
      logger.error("[AgentService.deleteAgent] Delete failed", error, { userId, agentId });
      throw new Error("Failed to delete agent.");
    }

    await AuditService.logAiAction(
      existing.workspace_id,
      userId,
      "AGENT_DELETED",
      { name: existing.name },
      agentId
    );

    return { success: true };
  }

  /**
    Execute a subagent run.
   */
  static async executeAgent(userId: string, agentId: string, input: RunAgentInput): Promise<AgentRun> {
    const supabase = await createClient();

    const agent = await this.getAgentById(userId, agentId);
    const startTime = Date.now();

    // 1. Create Run Record in Queued State
    const { data: run, error: runErr } = await (supabase as any)
      .from("agent_runs")
      .insert({
        agent_id: agentId,
        user_id: userId,
        status: "running",
        input: { prompt: input.prompt, ...(input.input_data || {}) },
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (runErr || !run) {
      logger.error("[AgentService.executeAgent] Run insert failed", runErr, { agentId, userId });
      throw new Error("Failed to initialize subagent execution run.");
    }

    await AuditService.logAiAction(
      agent.workspace_id,
      userId,
      "PROMPT_SENT",
      { prompt: input.prompt.slice(0, 100) },
      agentId
    );

    await AuditService.logAiAction(
      agent.workspace_id,
      userId,
      "AGENT_EXECUTED",
      { runId: run.id, model: agent.model },
      agentId
    );

    // Simulate Autonomous Subagent Swarm Execution & Code Response
    const latency = Math.floor(Math.random() * 400) + 250;
    const tokensPrompt = Math.floor(input.prompt.length / 4) + 20;
    const tokensCompletion = 140;

    const mockOutput = {
      result: `Subagent "${agent.name}" executed prompt successfully using ${agent.model}.`,
      code: `// Automated code response generated by ${agent.name}\nconst execution = await SwarmRuntime.run({\n  model: "${agent.model}",\n  task: "${input.prompt.replace(/"/g, '\\"')}"\n});\nconsole.log("Subagent task complete with 0 errors");`,
      status: "200_OK",
    };

    // Update Run to Completed
    const { data: completedRun, error: updateErr } = await (supabase as any)
      .from("agent_runs")
      .update({
        status: "completed",
        output: mockOutput,
        tokens_prompt: tokensPrompt,
        tokens_completion: tokensCompletion,
        latency_ms: latency,
        cost: Number(((tokensPrompt + tokensCompletion) * 0.000002).toFixed(6)),
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id)
      .select()
      .single();

    await AuditService.logAiAction(
      agent.workspace_id,
      userId,
      "RESPONSE_RECEIVED",
      { runId: run.id, latencyMs: latency, totalTokens: tokensPrompt + tokensCompletion },
      agentId
    );

    return (completedRun || run) as AgentRun;
  }

  /**
    Cancel an active agent run.
   */
  static async cancelExecution(userId: string, agentId: string, runId: string): Promise<AgentRun> {
    const supabase = await createClient();

    const { data: run, error } = await (supabase as any)
      .from("agent_runs")
      .update({
        status: "cancelled",
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId)
      .select()
      .single();

    if (error || !run) {
      throw new Error("Failed to cancel agent run.");
    }

    return run as AgentRun;
  }

  /**
    Get status of an agent run.
   */
  static async getExecutionStatus(userId: string, runId: string): Promise<AgentRun> {
    const supabase = await createClient();

    const { data: run, error } = await (supabase as any)
      .from("agent_runs")
      .select("*")
      .eq("id", runId)
      .single();

    if (error || !run) {
      throw new Error("RUN_NOT_FOUND");
    }

    return run as AgentRun;
  }
}
