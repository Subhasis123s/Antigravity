"use client";

import React, { useState, useEffect, useRef } from "react";
import { FileText, Upload, Search, Download, Trash2, FileCode, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { KnowledgeDocument } from "@/types/knowledge";

export const FilesView: React.FC = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/knowledge");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDocuments(json.data);
      }
    } catch (err) {
      console.error("Failed to load workspace files", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const wsRes = await fetch("/api/workspace");
      const wsJson = await wsRes.json();
      const workspaceId =
        wsJson.data?.id ||
        wsJson.workspace?.id ||
        (Array.isArray(wsJson.workspaces) && wsJson.workspaces[0]?.id) ||
        null;

      if (!workspaceId) {
        setUploading(false);
        return;
      }

      const content = await file.text();

      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspaceId,
          title: file.name,
          filename: file.name,
          content,
          mime_type: file.type || "text/plain",
        }),
      });

      const json = await res.json();
      if (json.success) {
        fetchFiles();
      }
    } catch (err) {
      console.error("File upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const filtered = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".txt,.md,.json,.ts,.tsx,.js,.py,.rs"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-pink-400" />
            Workspace Files & Assets
          </h1>
          <p className="text-xs text-text-secondary">
            Browse and manage code assets and files indexed in your workspace vault.
          </p>
        </div>

        <Button
          variant="glow"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          icon={<Upload className="h-4 w-4" />}
        >
          {uploading ? "Uploading..." : "Upload File"}
        </Button>
      </div>

      <div className="p-4 rounded-2xl bg-surface/70 border border-border space-y-4 shadow-glow">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workspace files..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-text-secondary font-mono animate-pulse">
            Fetching workspace files...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-text-secondary">
            No files found in workspace vault.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((file) => (
              <div
                key={file.id}
                className="p-3.5 rounded-xl bg-surface-subtle border border-border flex items-center justify-between hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileCode className="h-5 w-5 text-primary-light" />
                  <div>
                    <div className="text-xs font-bold text-white">{file.title}</div>
                    <div className="text-[10px] text-text-secondary">
                      {file.mime_type} &bull; {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-text-secondary font-mono">
                  <Badge variant="success">{file.status}</Badge>
                  <span>{new Date(file.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
