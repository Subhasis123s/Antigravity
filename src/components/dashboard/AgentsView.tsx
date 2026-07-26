"use client";

import React, { useState } from "react";
import { Bot, Zap, Cpu, Terminal, ShieldCheck, Plus, Play, Pause, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";

export const AgentsView: React.FC = () => {
  const [agents, setAgents] = useState([
    {
      id: "agent_1",
      role: "Fullstack Architect Subagent",
      model: "Gemini 3.6 Pro",
      status: "Active",
      tasksCompleted: 142,
      latency: "0.78ms",
      memoryUsed: "84%",
    },
    {
      id: "agent_2",
      role: "Security & Vulnerability Auditor",
      model: "Claude 3.5 Sonnet",
      status: "Active",
      tasksCompleted: 98,
      latency: "0.92ms",
      memoryUsed: "62%",
    },
    {
      id: "agent_3",
      role: "Automated Integration Test Runner",
      model: "GPT-4o",
      status: "Active",
      tasksCompleted: 310,
      latency: "0.64ms",
      memoryUsed: "45%",
    },
    {
      id: "agent_4",
      role: "Vector Database RAG Indexer",
      model: "Gemini 3.6 Flash",
      status: "Idle",
      tasksCompleted: 520,
      latency: "0.45ms",
      memoryUsed: "20%",
    },
  ]);

  const toggleAgent = (id: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "Active" ? "Paused" : "Active" } : a
      )
    );
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

        <Button variant="glow" icon={<Plus className="h-4 w-4" />}>
          Deploy Subagent
        </Button>
      </div>

      {/* Agents Cards */}
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
                  <h3 className="text-base font-bold text-white">{agent.role}</h3>
                  <p className="text-xs text-text-secondary font-mono mt-0.5">Model: {agent.model}</p>
                </div>
              </div>

              <button
                onClick={() => toggleAgent(agent.id)}
                className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  agent.status === "Active"
                    ? "bg-success/20 text-success border border-success/40"
                    : "bg-surface-subtle text-text-secondary border border-border"
                }`}
              >
                {agent.status === "Active" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {agent.status}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                <div className="text-[10px] text-text-muted">Tasks Done</div>
                <div className="font-bold text-white mt-0.5">{agent.tasksCompleted}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                <div className="text-[10px] text-text-muted">Latency</div>
                <div className="font-bold text-success mt-0.5">{agent.latency}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                <div className="text-[10px] text-text-muted">Context Cap</div>
                <div className="font-bold text-primary-light mt-0.5">{agent.memoryUsed}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
