"use client";

import React, { useState, useEffect } from "react";
import { Bot, Plus, Play, Pause, X, Sparkles, Terminal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Agent } from "@/types/agent";
import { useAuth } from "@/context/AuthContext";

export const AgentsView: React.FC = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Deploy Subagent Modal State
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentDesc, setAgentDesc] = useState("");
  const [agentModel, setAgentModel] = useState("gemini-3.6-pro");
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState("");

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAgents(json.data);
      }
    } catch (err) {
      console.error("Failed to load agents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleDeployAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim()) return;

    setDeploying(true);
    setError("");

    try {
      const wsRes = await fetch("/api/workspace");
      const wsJson = await wsRes.json();
      const workspaceId =
        wsJson.data?.id ||
        wsJson.workspace?.id ||
        (Array.isArray(wsJson.workspaces) && wsJson.workspaces[0]?.id) ||
        null;

      if (!workspaceId) {
        setError("Default workspace not initialized.");
        setDeploying(false);
        return;
      }

      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspaceId,
          name: agentName.trim(),
          description: agentDesc.trim(),
          model: agentModel,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setDeployModalOpen(false);
        setAgentName("");
        setAgentDesc("");
        fetchAgents();
      } else {
        setError(json.error || "Failed to deploy subagent.");
      }
    } catch (err: any) {
      setError(err?.message || "Error deploying agent.");
    } finally {
      setDeploying(false);
    }
  };

  const toggleAgentRun = async (agentId: string) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Autonomous health check run" }),
      });
      const json = await res.json();
      if (json.success) {
        fetchAgents();
      }
    } catch (err) {
      console.error("Agent execution failed", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary-light" />
            Autonomous Agent Swarms
          </h1>
          <p className="text-xs text-text-secondary">
            Deploy, monitor, and configure multi-agent swarms executing background coding tasks.
          </p>
        </div>

        <Button
          variant="glow"
          onClick={() => setDeployModalOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Deploy Subagent
        </Button>
      </div>

      {/* Agents Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-text-secondary font-mono animate-pulse">
          Loading subagent swarm telemetry...
        </div>
      ) : agents.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-3">
          <Bot className="h-10 w-10 text-primary-light mx-auto opacity-50" />
          <h3 className="text-base font-bold text-white">No Autonomous Agents Deployed</h3>
          <p className="text-xs text-text-secondary">
            Deploy your first AI subagent to automate background workflows.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeployModalOpen(true)}
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            Deploy Subagent
          </Button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <GlassCard key={agent.id} glowOnHover className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-glow">
                    <div className="h-full w-full bg-surface rounded-[10px] flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary-light" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{agent.name}</h3>
                    <p className="text-xs text-text-secondary font-mono mt-0.5">
                      Model: {agent.model}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleAgentRun(agent.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    agent.status === "active" || agent.status === "running"
                      ? "bg-success/20 text-success border border-success/40"
                      : "bg-surface-subtle text-text-secondary border border-border"
                  }`}
                >
                  {agent.status === "active" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  {agent.status}
                </button>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                {agent.description || "No description provided."}
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                  <div className="text-[10px] text-text-muted">Tools</div>
                  <div className="font-bold text-white mt-0.5">
                    {agent.tools_enabled ? agent.tools_enabled.length : 2}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                  <div className="text-[10px] text-text-muted">Temp</div>
                  <div className="font-bold text-success mt-0.5">{agent.temperature}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                  <div className="text-[10px] text-text-muted">Max Tokens</div>
                  <div className="font-bold text-primary-light mt-0.5">{agent.max_tokens}</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Deploy Agent Modal */}
      {deployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-surface border border-border-bright rounded-3xl p-6 space-y-4 shadow-glow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-light" />
                Deploy AI Subagent Swarm
              </h3>
              <button
                onClick={() => setDeployModalOpen(false)}
                className="p-1 text-text-secondary hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDeployAgent} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Agent Name / Role
                </label>
                <input
                  type="text"
                  required
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Fullstack Swarm Architect"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  LLM Model
                </label>
                <select
                  value={agentModel}
                  onChange={(e) => setAgentModel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white bg-surface"
                >
                  <option value="gemini-3.6-pro">Gemini 3.6 Pro</option>
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                  <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={agentDesc}
                  onChange={(e) => setAgentDesc(e.target.value)}
                  placeholder="Responsibilities & tasks..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white resize-none"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeployModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="glow" disabled={deploying} className="flex-1">
                  {deploying ? "Deploying..." : "Deploy Agent"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
