"use client";

import React, { useState } from "react";
import { Database, Search, Upload, HardDrive, CheckCircle2, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";

export const KnowledgeBaseView: React.FC = () => {
  const [query, setQuery] = useState("");

  const collections = [
    { name: "Codebase AST Embeddings", files: "14,200 source files", size: "1.2 GB", dimension: "1536-dim" },
    { name: "Product Specs & Architecture PDFs", files: "3,400 documents", size: "480 MB", dimension: "1536-dim" },
    { name: "SOC2 Compliance Guidelines", files: "120 policy files", size: "45 MB", dimension: "1536-dim" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Database className="h-6 w-6 text-cyan-400" />
            Knowledge Base & RAG Vault
          </h1>
          <p className="text-xs text-text-secondary">
            Vector semantic search across your entire codebase, documentation, and technical specs.
          </p>
        </div>

        <Button variant="glow" icon={<Upload className="h-4 w-4" />}>
          Upload Document
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Semantic query across 45,000 indexed vector embeddings..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl glass-input text-xs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map((c, i) => (
          <GlassCard key={i} glowOnHover className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Database className="h-5 w-5" />
              </div>
              <Badge variant="success">Indexed</Badge>
            </div>
            <h3 className="text-base font-bold text-white">{c.name}</h3>
            <div className="text-xs text-text-secondary font-mono space-y-1">
              <div>{c.files}</div>
              <div>Storage: {c.size} &bull; {c.dimension}</div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
