"use client";

import React, { useState, useEffect } from "react";
import { Database, Search, Upload, FileText, Trash2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { KnowledgeDocument, SemanticSearchResult } from "@/types/knowledge";
import { useAuth } from "@/context/AuthContext";

export const KnowledgeBaseView: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SemanticSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docFilename, setDocFilename] = useState("");
  const [docContent, setDocContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/knowledge");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDocuments(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch knowledge documents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSemanticQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch("/api/knowledge/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), top_k: 5 }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSearchResults(json.data);
      }
    } catch (err) {
      console.error("Semantic search failed", err);
    } finally {
      setSearching(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    setUploading(true);
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
        setUploading(false);
        return;
      }

      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspaceId,
          title: docTitle.trim(),
          filename: docFilename.trim() || `${docTitle.toLowerCase().replace(/\s+/g, "_")}.txt`,
          content: docContent.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setUploadModalOpen(false);
        setDocTitle("");
        setDocFilename("");
        setDocContent("");
        fetchDocuments();
      } else {
        setError(json.error || "Failed to upload document.");
      }
    } catch (err: any) {
      setError(err?.message || "Error uploading document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchDocuments();
      }
    } catch (err) {
      console.error("Document delete failed", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Database className="h-6 w-6 text-cyan-400" />
            Knowledge Base & RAG Vault
          </h1>
          <p className="text-xs text-text-secondary">
            Vector semantic search across your codebase, documentation, and technical specs using 1536-dim embeddings.
          </p>
        </div>

        <Button
          variant="glow"
          onClick={() => setUploadModalOpen(true)}
          icon={<Upload className="h-4 w-4" />}
        >
          Upload Document
        </Button>
      </div>

      {/* Semantic Search Form */}
      <form onSubmit={handleSemanticQuery} className="relative">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Perform cosine similarity search across indexed document chunks..."
          className="w-full pl-11 pr-24 py-3.5 rounded-2xl glass-input text-xs"
        />
        <button
          type="submit"
          disabled={searching}
          className="absolute right-3 top-2 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-glow"
        >
          {searching ? "Searching..." : "Vector Search"}
        </button>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Vector Search Matches ({searchResults.length})
          </h3>
          <div className="space-y-3">
            {searchResults.map((res, i) => (
              <GlassCard key={i} className="p-4 space-y-2 border-cyan-500/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-400" /> {res.title} ({res.filename})
                  </span>
                  <Badge variant="success">Similarity: {(res.similarity * 100).toFixed(1)}%</Badge>
                </div>
                <p className="text-xs text-text-secondary font-mono leading-relaxed bg-black/40 p-3 rounded-xl">
                  {res.content}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Document Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-text-secondary font-mono animate-pulse">
          Loading RAG Knowledge Vault documents...
        </div>
      ) : documents.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-3">
          <Database className="h-10 w-10 text-cyan-400 mx-auto opacity-50" />
          <h3 className="text-base font-bold text-white">No Knowledge Documents Indexed</h3>
          <p className="text-xs text-text-secondary">
            Upload text files or technical specs to enable semantic vector RAG search.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            icon={<Upload className="h-3.5 w-3.5" />}
          >
            Upload Document
          </Button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <GlassCard key={doc.id} glowOnHover className="space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <Database className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">{doc.status}</Badge>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1 text-text-secondary hover:text-red-400"
                      title="Delete document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-base font-bold text-white">{doc.title}</h3>
                <div className="text-xs text-text-secondary font-mono space-y-1">
                  <div>File: {doc.filename}</div>
                  <div>Size: {(doc.size / 1024).toFixed(1)} KB &bull; 1536-dim</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-surface border border-border-bright rounded-3xl p-6 space-y-4 shadow-glow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                Upload Knowledge Vault Document
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1 text-text-secondary hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. System Architecture Guidelines"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Filename
                </label>
                <input
                  type="text"
                  value={docFilename}
                  onChange={(e) => setDocFilename(e.target.value)}
                  placeholder="architecture_v2.txt"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Text Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Paste document text content to be chunked into 1536-dim vector embeddings..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white resize-none"
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
                  onClick={() => setUploadModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="glow" disabled={uploading} className="flex-1">
                  {uploading ? "Indexing..." : "Upload & Embed"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
