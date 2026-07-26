"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Bot,
  Terminal,
  Cpu,
  CheckCircle2,
  Zap,
  Layers,
  Code2,
  Play,
  Share2,
} from "lucide-react";
import { Badge } from "../ui/Badge";

export const HeroDashboardMockup: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const simulatedSteps = [
    {
      agent: "Architect Agent",
      action: "Analyzing project requirements & dependency graph...",
      status: "complete",
      timestamp: "14:20:01",
    },
    {
      agent: "Frontend Agent",
      action: "Generating Next.js 15 UI with glassmorphism & TailwindCSS...",
      status: "active",
      timestamp: "14:20:03",
    },
    {
      agent: "Security Agent",
      action: "Verifying OAuth2.0 authentication & end-to-end encryption...",
      status: "queued",
      timestamp: "14:20:05",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % simulatedSteps.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [simulatedSteps.length]);

  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-none">
      {/* Background Ambient Radial Glow */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-primary/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-secondary/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating Card 1 - Top Right Stats */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-6 -right-4 z-20 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-surface/90 backdrop-blur-xl border border-border-bright shadow-glow"
      >
        <div className="h-10 w-10 rounded-xl bg-success/10 border border-success/30 flex items-center justify-center text-success">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-text-secondary">Execution Latency</div>
          <div className="text-sm font-bold text-white flex items-center gap-1.5">
            0.84ms <span className="text-[10px] text-success font-medium">99.99% fast</span>
          </div>
        </div>
      </motion.div>

      {/* Floating Card 2 - Bottom Left Active Agents */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-6 -left-4 z-20 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-surface/90 backdrop-blur-xl border border-border-bright shadow-glow"
      >
        <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary-light">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-text-secondary">Active Parallel Subagents</div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <span>4 Agents Working</span>
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          </div>
        </div>
      </motion.div>

      {/* Main Browser Window Mockup */}
      <div className="relative rounded-3xl bg-surface border border-border-bright shadow-2xl overflow-hidden backdrop-blur-2xl">
        {/* Top Window Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-subtle">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-black/40 border border-border text-xs font-mono text-text-secondary">
            <Sparkles className="h-3 w-3 text-primary-light" />
            antigravity.ai/workspace/project-alpha
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <Share2 className="h-4 w-4 hover:text-white cursor-pointer" />
          </div>
        </div>

        {/* Workspace Body Mock */}
        <div className="grid grid-cols-12 min-h-[380px] text-xs">
          {/* Sidebar */}
          <div className="col-span-3 border-r border-border p-3 space-y-4 hidden sm:block bg-surface-subtle/50">
            <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
              Workspaces
            </div>
            <div className="space-y-1">
              <div className="px-2.5 py-1.5 rounded-lg bg-primary/15 text-primary-light font-medium flex items-center gap-2">
                <Layers className="h-3.5 w-3.5" /> Project Alpha
              </div>
              <div className="px-2.5 py-1.5 rounded-lg text-text-secondary hover:bg-white/5 flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5" /> API Gateway
              </div>
              <div className="px-2.5 py-1.5 rounded-lg text-text-secondary hover:bg-white/5 flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5" /> ML Pipeline
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Agents Swarm
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-text-secondary text-[11px]">
                  <span className="flex items-center gap-1.5"><Bot className="h-3 w-3 text-primary-light"/> Code Agent</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                </div>
                <div className="flex items-center justify-between text-text-secondary text-[11px]">
                  <span className="flex items-center gap-1.5"><Terminal className="h-3 w-3 text-secondary"/> Test Runner</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Agent Command Stream */}
          <div className="col-span-12 sm:col-span-9 p-4 flex flex-col justify-between bg-black/30">
            {/* Live Prompt Simulation Header */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-surface border border-border flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-primary-light shrink-0 animate-spin" />
                <div className="text-white font-mono text-[11px] truncate">
                  Prompt: &quot;Build a high-performance Next.js landing page with Framer Motion&quot;
                </div>
              </div>

              {/* Steps timeline */}
              <div className="space-y-2 mt-3">
                {simulatedSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all duration-300 flex items-start justify-between gap-3 ${
                      activeStep === idx
                        ? "bg-primary/10 border-primary/40 shadow-sm"
                        : "bg-surface/50 border-border opacity-75"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {activeStep === idx ? (
                        <div className="h-4 w-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px] mt-0.5 animate-pulse">
                          ●
                        </div>
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-white text-[12px] flex items-center gap-2">
                          {step.agent}
                          {activeStep === idx && (
                            <Badge variant="primary">Processing</Badge>
                          )}
                        </div>
                        <p className="text-text-secondary text-[11px] mt-0.5">
                          {step.action}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-text-muted font-mono shrink-0">
                      {step.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Output Snippet Box */}
            <div className="mt-4 p-3 rounded-xl bg-surface-subtle border border-border font-mono text-[11px] text-text-secondary space-y-1">
              <div className="flex justify-between text-[10px] text-text-muted border-b border-border pb-1 mb-1">
                <span>Output: page.tsx</span>
                <span className="text-success flex items-center gap-1">
                  <Play className="h-2.5 w-2.5 fill-current" /> Compiled in 12ms
                </span>
              </div>
              <p className="text-primary-light">export default function AntigravityApp() &#123;</p>
              <p className="pl-3 text-text-secondary">&lt;HeroSection title=&quot;Your Complete AI Workspace&quot; /&gt;</p>
              <p className="text-primary-light">&#125;</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
