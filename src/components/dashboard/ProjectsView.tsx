"use client";

import React, { useState } from "react";
import { FolderKanban, Plus, Search, GitBranch, ExternalLink, Bot, CheckCircle2, MoreVertical, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";

export const ProjectsView: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const projects = [
    {
      id: "p1",
      name: "Antigravity Workspace App",
      description: "Complete AI workspace landing page and interactive SaaS dashboard.",
      tech: "Next.js 15, React 19, TailwindCSS",
      branch: "main",
      status: "Active",
      agents: 4,
      updated: "10m ago",
    },
    {
      id: "p2",
      name: "Knowledge Vault Vector RAG",
      description: "Pinecone and OpenAI 1536-dim vector embedding semantic search engine.",
      tech: "Python, FastAPI, Pinecone",
      branch: "feat/embeddings",
      status: "Active",
      agents: 2,
      updated: "2h ago",
    },
    {
      id: "p3",
      name: "Rust Execution Microservice",
      description: "Sub-millisecond isolated code sandbox execution runtime for subagent swarms.",
      tech: "Rust, WebAssembly, Docker",
      branch: "release/v2.1",
      status: "Building",
      agents: 3,
      updated: "1d ago",
    },
    {
      id: "p4",
      name: "OAuth2 & SSO Identity Provider",
      description: "Enterprise SAML, Google, and GitHub authentication service layer.",
      tech: "TypeScript, Redis, JWT",
      branch: "main",
      status: "Active",
      agents: 1,
      updated: "3d ago",
    },
  ];

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary-light" />
            Projects & Repositories
          </h1>
          <p className="text-xs text-text-secondary">
            Manage your AI workspace codebases, microservices, and subagent assignments.
          </p>
        </div>

        <Button variant="glow" icon={<Plus className="h-4 w-4" />}>
          New Project
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface/70 border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name or stack..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["all", "active", "building"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                filter === f
                  ? "bg-primary text-white font-bold"
                  : "bg-surface-subtle text-text-secondary hover:text-white border border-border"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((proj) => (
          <GlassCard key={proj.id} glowOnHover className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/30 text-primary-light flex items-center justify-center font-mono font-bold">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white hover:text-primary-light cursor-pointer transition-colors">
                      {proj.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-text-secondary font-mono mt-0.5">
                      <GitBranch className="h-3 w-3" /> {proj.branch} &bull; Updated {proj.updated}
                    </div>
                  </div>
                </div>

                <Badge variant={proj.status === "Active" ? "success" : "primary"}>
                  {proj.status}
                </Badge>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">{proj.description}</p>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-secondary font-mono">
              <span className="flex items-center gap-1.5 text-primary-light">
                <Bot className="h-3.5 w-3.5" /> {proj.agents} Subagents Assigned
              </span>

              <button className="flex items-center gap-1 text-white hover:text-primary-light transition-colors">
                Open Workspace <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
