"use client";

import React, { useState } from "react";
import { BookOpen, Plus, Copy, Check, Star, Sparkles, Code2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";

export const PromptLibraryView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const prompts = [
    {
      id: "p1",
      title: "Next.js 15 React 19 Component Generator",
      category: "Frontend",
      version: "v2.4",
      score: "99.4%",
      snippet: "Act as a senior frontend architect. Generate production Next.js 15 TypeScript code with Framer Motion animations and glassmorphism styling.",
    },
    {
      id: "p2",
      title: "SOC2 Type II Security Vulnerability Inspector",
      category: "Security",
      version: "v1.8",
      score: "98.8%",
      snippet: "Inspect target code for OWASP Top 10 vulnerabilities, JWT session leaks, unsafe SQL queries, and missing CORS headers.",
    },
    {
      id: "p3",
      title: "PostgreSQL Prisma Schema Builder",
      category: "Database",
      version: "v3.0",
      score: "99.1%",
      snippet: "Design a normalized database schema with indexed foreign keys, UUID primary keys, and automated migration scripts.",
    },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-yellow-400" />
            Prompt Engineering Library
          </h1>
          <p className="text-xs text-text-secondary">
            Version-controlled prompt templates with benchmark scores and model optimizations.
          </p>
        </div>

        <Button variant="glow" icon={<Plus className="h-4 w-4" />}>
          New Prompt Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {prompts.map((p) => (
          <GlassCard key={p.id} glowOnHover className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="primary">{p.category}</Badge>
                <span className="text-[10px] font-mono text-success flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" /> {p.score} Benchmark
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{p.title}</h3>

              <div className="p-3 rounded-xl bg-surface-subtle border border-border text-xs text-text-secondary font-mono leading-relaxed">
                &quot;{p.snippet}&quot;
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-muted font-mono">{p.version}</span>
              <button
                onClick={() => handleCopy(p.id, p.snippet)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-white transition-colors"
              >
                {copiedId === p.id ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedId === p.id ? "Copied" : "Copy Prompt"}</span>
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
