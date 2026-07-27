"use client";

import React, { useState, useEffect } from "react";
import { Key, Plus, Trash2, ShieldCheck, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { WorkspaceSecret } from "@/types/secret";
import { useAuth } from "@/context/AuthContext";

export const SecretsView: React.FC = () => {
  const { user } = useAuth();
  const [secrets, setSecrets] = useState<WorkspaceSecret[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Secret Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [secretVal, setSecretVal] = useState("");
  const [provider, setProvider] = useState("openai");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchSecrets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/secrets");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSecrets(json.data);
      }
    } catch (err) {
      console.error("Failed to load workspace secrets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecrets();
  }, []);

  const handleAddSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim() || !secretVal.trim()) return;

    setSaving(true);
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
        setSaving(false);
        return;
      }

      const res = await fetch("/api/secrets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspaceId,
          key_name: keyName.trim().toUpperCase(),
          secret_value: secretVal.trim(),
          provider,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setAddModalOpen(false);
        setKeyName("");
        setSecretVal("");
        fetchSecrets();
      } else {
        setError(json.error || "Failed to store secret key.");
      }
    } catch (err: any) {
      setError(err?.message || "Error storing secret key.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSecret = async (id: string) => {
    try {
      const res = await fetch(`/api/secrets?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchSecrets();
      }
    } catch (err) {
      console.error("Failed to delete secret", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary-light" />
            Encrypted Workspace Secrets Manager
          </h1>
          <p className="text-xs text-text-secondary">
            Store AES-256-GCM encrypted provider credentials for OpenAI, Anthropic, Gemini, Groq, and Ollama.
          </p>
        </div>

        <Button
          variant="glow"
          onClick={() => setAddModalOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Add API Secret
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-text-secondary font-mono animate-pulse">
          Decrypting workspace secret headers...
        </div>
      ) : secrets.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-3">
          <Key className="h-10 w-10 text-primary-light mx-auto opacity-50" />
          <h3 className="text-base font-bold text-white">No Encrypted Secrets Stored</h3>
          <p className="text-xs text-text-secondary">
            Store your provider API keys securely for multi-LLM swarm executions.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddModalOpen(true)}
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            Add API Secret
          </Button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {secrets.map((s) => (
            <GlassCard key={s.id} glowOnHover className="space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-2 font-mono">
                    <Key className="h-4 w-4 text-primary-light" /> {s.key_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">AES-256-GCM</Badge>
                    <button
                      onClick={() => handleDeleteSecret(s.id)}
                      className="p-1 text-text-secondary hover:text-red-400"
                      title="Delete secret"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-text-secondary font-mono bg-black/40 p-2.5 rounded-xl border border-border">
                  Key Hint: {s.key_hint} &bull; Provider: {s.provider.toUpperCase()}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add Secret Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-surface border border-border-bright rounded-3xl p-6 space-y-4 shadow-glow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-light" />
                Store Encrypted API Key
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 text-text-secondary hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSecret} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Secret Key Name (Uppercase)
                </label>
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="OPENAI_API_KEY"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white bg-surface"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="groq">Groq</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="ollama">Ollama (Local)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  API Key Secret Value
                </label>
                <input
                  type="password"
                  required
                  value={secretVal}
                  onChange={(e) => setSecretVal(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white font-mono"
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
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="glow" disabled={saving} className="flex-1">
                  {saving ? "Encrypting..." : "Encrypt & Store"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
