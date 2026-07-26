"use client";

import React, { useState } from "react";
import { Layers, Globe, Clock, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

export const WorkspaceSettings: React.FC = () => {
  const { showToast } = useToast();
  const [workspaceName, setWorkspaceName] = useState("Production Swarm Alpha");
  const [language, setLanguage] = useState("en-US");
  const [timeZone, setTimeZone] = useState("UTC");
  const [autoSave, setAutoSave] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Workspace configuration saved!", "success");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-surface/70 border border-border space-y-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary-light" /> Workspace General Preferences
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-text-secondary mb-1">Default Workspace Name</label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary mb-1 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-secondary" /> Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-xs"
              >
                <option value="en-US">English (United States)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="ja-JP">Japanese</option>
              </select>
            </div>

            <div>
              <label className="block text-text-secondary mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-success" /> Time Zone
              </label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-xs"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">EST (Eastern Standard Time)</option>
                <option value="America/Los_Angeles">PST (Pacific Standard Time)</option>
                <option value="Asia/Tokyo">JST (Japan Standard Time)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle border border-border cursor-pointer">
              <div>
                <div className="font-bold text-white">Auto Save Code & Prompts</div>
                <div className="text-[10px] text-text-secondary">Save changes continuously during agent streams</div>
              </div>
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="rounded border-border bg-surface text-primary"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle border border-border cursor-pointer">
              <div>
                <div className="font-bold text-white">Auto Sync Knowledge Base RAG</div>
                <div className="text-[10px] text-text-secondary">Re-index vector embeddings on file save</div>
              </div>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="rounded border-border bg-surface text-primary"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="glow" size="sm">
            Save Workspace Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
