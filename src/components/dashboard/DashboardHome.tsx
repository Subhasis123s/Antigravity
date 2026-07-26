"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Bot,
  Zap,
  Cpu,
  ShieldCheck,
  FolderKanban,
  MessageSquare,
  BookOpen,
  Plus,
  Play,
  ArrowUpRight,
  Clock,
  HardDrive,
  Activity,
  CheckCircle2,
  Bookmark,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { User } from "@/context/AuthContext";

interface DashboardHomeProps {
  user: User;
  onSelectTab: (tabId: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ user, onSelectTab }) => {
  const [loadingSkeleton, setLoadingSkeleton] = useState(false);

  const usageStats = [
    { label: "Storage Usage", value: "24.2 GB / 100 GB", pct: "24%", icon: <HardDrive className="h-4 w-4 text-cyan-400" /> },
    { label: "API Rate Usage", value: "14,200 req / day", pct: "42%", icon: <Activity className="h-4 w-4 text-primary-light" /> },
    { label: "Token Context Quota", value: "1.8M / 2.0M Tokens", pct: "90%", icon: <Cpu className="h-4 w-4 text-secondary" /> },
    { label: "Agent Execution Latency", value: "0.84ms (Avg)", pct: "99.9%", icon: <Zap className="h-4 w-4 text-success" /> },
  ];

  const recentProjects = [
    { id: 1, name: "Antigravity AI OS v2.0", type: "Next.js 15 & React 19", updated: "10m ago", status: "Active Swarm", badge: "success" },
    { id: 2, name: "Knowledge Vault Vector RAG", type: "Pinecone & OpenAI Embeddings", updated: "2h ago", status: "Indexed", badge: "primary" },
    { id: 3, name: "Autonomous Code Review Pipeline", type: "Rust Execution Microservice", updated: "1d ago", status: "Cron Scheduled", badge: "secondary" },
  ];

  const pinnedPrompts = [
    { id: 1, title: "Next.js 15 Component Generator", model: "Gemini 3.6 Pro", score: "99.4%" },
    { id: 2, title: "SOC2 Security Audit Inspector", model: "Claude 3.5 Sonnet", score: "98.8%" },
    { id: 3, title: "SQL Schema & Migration Builder", model: "GPT-4o", score: "99.1%" },
  ];

  const recentChats = [
    { id: 1, title: "JWT Auth Route Handler Review", messages: 14, time: "5m ago" },
    { id: 2, title: "Refactoring TailwindCSS Glassmorphism", messages: 8, time: "42m ago" },
    { id: 3, title: "Optimizing Vector Embeddings Chunking", messages: 23, time: "3h ago" },
  ];

  const activityTimeline = [
    { id: 1, text: "Agent #402 deployed REST API endpoint handler", time: "12m ago", status: "complete" },
    { id: 2, text: "Indexed 45,000 PDF document vector embeddings", time: "1h ago", status: "complete" },
    { id: 3, text: "Cron task executed: Nightly code vulnerability audit", time: "3h ago", status: "complete" },
    { id: 4, text: "User Alex upgraded team workspace to Pro tier", time: "1d ago", status: "complete" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-surface via-surface-hover to-surface border border-border-bright p-6 sm:p-8 overflow-hidden shadow-glow">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge variant="primary">
              <Sparkles className="h-3.5 w-3.5 text-primary-light" /> Intelligent Session Active
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              All 4 subagents are online and ready to execute parallel coding tasks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="glow" onClick={() => onSelectTab("projects")} icon={<Plus className="h-4 w-4" />}>
              Create Project
            </Button>
            <Button variant="secondary" onClick={() => onSelectTab("chat")} icon={<Bot className="h-4 w-4" />}>
              Open Swarm Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Usage Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {usageStats.map((stat, idx) => (
          <GlassCard key={idx} hoverEffect glowOnHover>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">{stat.label}</span>
              <div className="p-2 rounded-xl bg-surface-subtle border border-border">{stat.icon}</div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white mt-3">{stat.value}</div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-text-secondary">
              <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden mr-3">
                <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: stat.pct }} />
              </div>
              <span className="font-mono text-primary-light font-bold">{stat.pct}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Main Grid Section: Recent Projects & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Projects & Pinned Prompts */}
        <div className="lg:col-span-8 space-y-8">
          {/* Recent Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary-light" />
                Recent Projects
              </h2>
              <button onClick={() => onSelectTab("projects")} className="text-xs text-text-secondary hover:text-white flex items-center gap-1 transition-colors">
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => onSelectTab("projects")}
                  className="p-5 rounded-2xl bg-surface/70 border border-border hover:border-primary/40 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary-light border border-primary/30 flex items-center justify-center font-mono font-bold group-hover:scale-105 transition-transform">
                      PROJ
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-primary-light transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5">{project.type} &bull; {project.updated}</p>
                    </div>
                  </div>

                  <Badge variant={project.badge as any}>{project.status}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Pinned Prompts & Recent Chats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pinned Prompts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-yellow-400" /> Pinned Prompts
                </h3>
                <button onClick={() => onSelectTab("prompts")} className="text-xs text-text-secondary hover:text-white">View all</button>
              </div>

              <div className="space-y-2">
                {pinnedPrompts.map((p) => (
                  <div key={p.id} onClick={() => onSelectTab("prompts")} className="p-3.5 rounded-xl bg-surface border border-border hover:border-border-bright transition-all cursor-pointer space-y-1">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{p.title}</span>
                      <span className="text-[10px] text-success font-mono">{p.score}</span>
                    </div>
                    <div className="text-[10px] text-text-secondary font-mono">Model: {p.model}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Chats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary-light" /> Recent AI Chats
                </h3>
                <button onClick={() => onSelectTab("chat")} className="text-xs text-text-secondary hover:text-white">View all</button>
              </div>

              <div className="space-y-2">
                {recentChats.map((c) => (
                  <div key={c.id} onClick={() => onSelectTab("chat")} className="p-3.5 rounded-xl bg-surface border border-border hover:border-border-bright transition-all cursor-pointer flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{c.title}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5">{c.messages} messages &bull; {c.time}</div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-text-muted" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-surface/70 border border-border space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-secondary" /> Activity Timeline
            </h3>

            <div className="relative border-l border-border/80 pl-4 space-y-6">
              {activityTimeline.map((act) => (
                <div key={act.id} className="relative space-y-1">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                  <p className="text-xs text-white leading-relaxed">{act.text}</p>
                  <span className="text-[10px] text-text-muted font-mono">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
