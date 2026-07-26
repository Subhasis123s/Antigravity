"use client";

import React, { useState } from "react";
import { Key, Plus, Copy, Check, Trash2, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const ApiKeysSettings: React.FC = () => {
  const { showToast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

  const [keys, setKeys] = useState([
    { id: "k1", name: "Production CLI Runner", key: "ag_live_894320984209348...", created: "2026-07-01", lastUsed: "Just now" },
    { id: "k2", name: "GitHub Actions CI/CD Pipeline", key: "ag_live_773409823409823...", created: "2026-06-15", lastUsed: "2 hours ago" },
  ]);

  const handleCopy = (id: string, fullKey: string) => {
    navigator.clipboard.writeText(fullKey);
    setCopiedId(id);
    showToast("API Key copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    showToast("API Key deleted.", "info");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    const newK = {
      id: "k_" + Date.now(),
      name: newKeyName,
      key: `ag_live_${Math.random().toString(36).substring(2, 12)}...`,
      created: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
    };

    setKeys((prev) => [...prev, newK]);
    setNewKeyName("");
    setCreateModalOpen(false);
    showToast(`API Key "${newKeyName}" created successfully!`, "success");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Key className="h-6 w-6 text-primary-light" />
            Workspace API Credentials
          </h1>
          <p className="text-xs text-text-secondary">
            Manage secret API keys for the Antigravity SDK, CLI, and CI/CD pipelines.
          </p>
        </div>

        <Button variant="glow" icon={<Plus className="h-4 w-4" />} onClick={() => setCreateModalOpen(true)}>
          Create API Key
        </Button>
      </div>

      <div className="space-y-3">
        {keys.map((k) => (
          <div key={k.id} className="p-4 rounded-2xl bg-surface/70 border border-border flex items-center justify-between text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{k.name}</span>
                <Badge variant="primary">LIVE</Badge>
              </div>
              <div className="font-mono text-text-secondary">{k.key}</div>
              <div className="text-[10px] text-text-muted">
                Created: {k.created} &bull; Last Used: {k.lastUsed}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(k.id, k.key)}
                className="p-2 rounded-xl bg-surface border border-border hover:border-primary/40 text-text-secondary hover:text-white transition-colors"
                title="Copy Key"
              >
                {copiedId === k.id ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                onClick={() => handleDelete(k.id)}
                className="p-2 rounded-xl bg-surface border border-border hover:border-red-500/40 text-text-secondary hover:text-red-400 transition-colors"
                title="Delete Key"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Key Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleCreate} className="w-full max-w-md p-6 rounded-3xl bg-surface border border-border-bright shadow-glow space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-primary-light" /> Generate New API Key
            </h4>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Key Name / Label</label>
              <input
                type="text"
                required
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Staging CI Runner"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="glow" size="sm">
                Generate Key
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
