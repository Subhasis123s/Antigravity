"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Terminal,
  Workflow,
  Database,
  Sparkles,
  Play,
  Copy,
  Check,
  Search,
  Code2,
  Cpu,
  Layers,
  FileCode,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export const WorkspacePreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"agents" | "code" | "workflow" | "vault">("agents");
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: "agents", label: "Agent Swarm Studio", icon: <Bot className="h-4 w-4" /> },
    { id: "code", label: "Sub-ms Code Sandbox", icon: <Terminal className="h-4 w-4" /> },
    { id: "workflow", label: "Visual Prompt Canvas", icon: <Workflow className="h-4 w-4" /> },
    { id: "vault", label: "Knowledge Vector Vault", icon: <Database className="h-4 w-4" /> },
  ];

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="workspace" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <Badge variant="primary">
            <Sparkles className="h-3.5 w-3.5 text-primary-light" /> Live Interactive Preview
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Inside the <span className="text-gradient-purple">Antigravity Interface</span>
          </h2>
          <p className="text-text-secondary text-base sm:text-lg">
            Experience the fluid, distraction-free environment built for hyper-productive developers and AI teams.
          </p>
        </div>

        {/* Tab Switcher Header */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-glow border border-white/20"
                  : "bg-surface border border-border text-text-secondary hover:text-white hover:bg-surface-hover"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Large Interactive Workspace Browser Window */}
        <div className="rounded-3xl bg-surface border border-border-bright shadow-glass overflow-hidden backdrop-blur-2xl">
          {/* Mac-style Window Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-subtle">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>

            <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-black/50 border border-border text-xs font-mono text-text-secondary">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              antigravity.ai/app/active-session
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-white transition-colors"
                title="Copy Workspace State"
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="p-6 min-h-[460px] bg-black/40">
            <AnimatePresence mode="wait">
              {activeTab === "agents" && (
                <motion.div
                  key="agents"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-12 gap-6"
                >
                  {/* Left Sidebar */}
                  <div className="col-span-12 lg:col-span-4 space-y-4">
                    <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
                        Active Subagent Swarm
                        <span className="px-2 py-0.5 rounded bg-primary/20 text-primary-light font-mono text-[10px]">
                          3 Running
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Bot className="h-4 w-4 text-primary-light" />
                            <div>
                              <div className="text-xs font-semibold text-white">Fullstack Architect</div>
                              <div className="text-[10px] text-text-secondary">Generating API endpoints</div>
                            </div>
                          </div>
                          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        </div>

                        <div className="p-3 rounded-xl bg-surface-subtle border border-border flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Terminal className="h-4 w-4 text-secondary" />
                            <div>
                              <div className="text-xs font-semibold text-white">Unit Test Runner</div>
                              <div className="text-[10px] text-text-secondary">Coverage: 98.4%</div>
                            </div>
                          </div>
                          <span className="h-2 w-2 rounded-full bg-success" />
                        </div>

                        <div className="p-3 rounded-xl bg-surface-subtle border border-border flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Cpu className="h-4 w-4 text-yellow-400" />
                            <div>
                              <div className="text-xs font-semibold text-white">Security Inspector</div>
                              <div className="text-[10px] text-text-secondary">0 vulnerability flags</div>
                            </div>
                          </div>
                          <span className="h-2 w-2 rounded-full bg-success" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
                      <div className="text-xs font-semibold text-text-secondary uppercase">Memory Context</div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-gradient-to-r from-primary to-secondary" />
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted font-mono">
                        <span>Tokens Used: 128k / 200k</span>
                        <span>Compression: Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Chat/Console Area */}
                  <div className="col-span-12 lg:col-span-8 flex flex-col justify-between p-6 rounded-2xl bg-surface border border-border space-y-4">
                    <div className="space-y-4">
                      {/* User message */}
                      <div className="flex items-start gap-3 justify-end">
                        <div className="p-3.5 rounded-2xl bg-primary text-white text-xs max-w-md shadow-md">
                          Deploy a REST API endpoint for user profile authentication with JWT tokens and Redis rate limiting.
                        </div>
                      </div>

                      {/* Agent response */}
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shrink-0 shadow-glow">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="space-y-3 max-w-lg">
                          <div className="p-4 rounded-2xl bg-surface-subtle border border-border text-xs text-text-secondary leading-relaxed space-y-2">
                            <p className="text-white font-medium">
                              I have initialized 2 parallel subagents to generate the route handler and Redis rate-limiting middleware:
                            </p>
                            <div className="p-2.5 rounded-xl bg-black/60 border border-border font-mono text-[11px] text-primary-light">
                              ✓ Created /src/app/api/auth/route.ts (24ms)<br />
                              ✓ Attached Redis RateLimiter [100 req/min]<br />
                              ✓ Passed automated integration test suit (14/14 tests)
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Prompt Bar */}
                    <div className="relative mt-4">
                      <input
                        type="text"
                        readOnly
                        value="Execute security audit & deploy to Vercel production..."
                        className="w-full pl-4 pr-24 py-3 rounded-xl glass-input text-xs font-mono"
                      />
                      <button className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium flex items-center gap-1">
                        <Play className="h-3 w-3 fill-current" /> Run
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "code" && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <FileCode className="h-4 w-4 text-primary-light" />
                      <span className="text-white font-semibold">src/services/ai-orchestrator.ts</span>
                    </div>
                    <span className="text-success flex items-center gap-1">
                      <Play className="h-3 w-3 fill-current" /> Execution: 0.72ms
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-surface-subtle border border-border font-mono text-xs text-text-secondary leading-relaxed space-y-1">
                    <p className="text-primary-light">import &#123; AntigravitySDK &#125; from &quot;@antigravity/ai&quot;;</p>
                    <p className="text-text-muted">&#47;&#47; Initialize multi-agent orchestration pool</p>
                    <p className="text-white"><span className="text-secondary font-bold">const</span> workspace = <span className="text-secondary">new</span> AntigravitySDK(&#123; model: <span className="text-success">&quot;gemini-3.6-pro&quot;</span> &#125;);</p>
                    <br />
                    <p className="text-white"><span className="text-secondary font-bold">const</span> subagents = <span className="text-secondary">await</span> workspace.spawnSwarm([</p>
                    <p className="pl-4 text-text-secondary">&#123; role: <span className="text-success">&quot;CodeArchitect&quot;</span>, memory: <span className="text-purple-400">true</span> &#125;,</p>
                    <p className="pl-4 text-text-secondary">&#123; role: <span className="text-success">&quot;SecurityAuditor&quot;</span>, strictMode: <span className="text-purple-400">true</span> &#125;,</p>
                    <p className="text-white">]);</p>
                    <br />
                    <p className="text-success">&#47;&#47; Output: Swarm initialized with 0.00ms cold start latency.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === "workflow" && (
                <motion.div
                  key="workflow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-surface border border-border"
                >
                  <div className="p-4 rounded-xl bg-surface-subtle border border-primary/30 space-y-2">
                    <Badge variant="primary">Step 1: Trigger</Badge>
                    <h4 className="text-sm font-bold text-white">GitHub Webhook</h4>
                    <p className="text-xs text-text-secondary">Triggers when PR is opened on main branch.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-subtle border border-secondary/30 space-y-2">
                    <Badge variant="secondary">Step 2: Subagent Swarm</Badge>
                    <h4 className="text-sm font-bold text-white">AI Code Review & Lint</h4>
                    <p className="text-xs text-text-secondary">Evaluates security vulnerabilities & performance.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-subtle border border-success/30 space-y-2">
                    <Badge variant="success">Step 3: Action</Badge>
                    <h4 className="text-sm font-bold text-white">Auto-Merge & Deploy</h4>
                    <p className="text-xs text-text-secondary">Deploys build artifact to edge servers.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === "vault" && (
                <motion.div
                  key="vault"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-text-secondary" />
                    <input
                      type="text"
                      readOnly
                      value="Search semantic embeddings across 45,000 indexing files..."
                      className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                      <div className="text-xs font-bold text-primary-light">vector_index_01.bin</div>
                      <p className="text-xs text-text-secondary">Indexed 4,200 PDF docs with 1536-dimensional embeddings.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                      <div className="text-xs font-bold text-secondary">github_repo_context.bin</div>
                      <p className="text-xs text-text-secondary">Full AST representation of all TypeScript definitions.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
