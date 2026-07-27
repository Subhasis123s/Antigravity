"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  Plus,
  Search,
  GitBranch,
  ExternalLink,
  Bot,
  Star,
  Pin,
  Archive,
  Layers,
  Sparkles,
  X,
  Edit2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { Project } from "@/types/project";
import { useAuth } from "@/context/AuthContext";

export const ProjectsView: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "archived" | "favorite">("all");

  // Create Project Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit / Rename Project Modal State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [updating, setUpdating] = useState(false);

  // Delete Confirmation Modal State
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (filter === "archived") query.set("archived", "true");
      if (filter === "favorite") query.set("favorite", "true");
      if (filter === "active") query.set("status", "active");

      const res = await fetch(`/api/projects?${query.toString()}`);
      const json = await res.json();

      if (json.success && json.data?.projects) {
        setProjects(json.data.projects);
      }
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filter, search]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreating(true);
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
        setCreating(false);
        return;
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspaceId,
          name: newProjectName.trim(),
          description: newProjectDesc.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCreateModalOpen(false);
        setNewProjectName("");
        setNewProjectDesc("");
        fetchProjects();
      } else {
        setError(json.error || "Failed to create project.");
      }
    } catch (err: any) {
      setError(err?.message || "Error creating project.");
    } finally {
      setCreating(false);
    }
  };

  const handleRenameProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editName.trim()) return;

    setUpdating(true);
    setError("");

    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDesc.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setEditingProject(null);
        fetchProjects();
      } else {
        setError(json.error || "Failed to rename project.");
      }
    } catch (err: any) {
      setError(err?.message || "Error renaming project.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/projects/${deletingProject.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.success) {
        setDeletingProject(null);
        fetchProjects();
      } else {
        setError(json.error || "Failed to delete project.");
      }
    } catch (err: any) {
      setError(err?.message || "Error deleting project.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFavorite = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/favorite`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        fetchProjects();
      }
    } catch (err) {
      console.error("Favorite toggle failed", err);
    }
  };

  const handleTogglePin = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/pin`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        fetchProjects();
      }
    } catch (err) {
      console.error("Pin toggle failed", err);
    }
  };

  const handleArchiveProject = async (projectId: string, isArchived: boolean) => {
    try {
      const endpoint = isArchived ? `/api/projects/${projectId}/restore` : `/api/projects/${projectId}/archive`;
      const res = await fetch(endpoint, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        fetchProjects();
      }
    } catch (err) {
      console.error("Archive/Restore failed", err);
    }
  };

  const openRenameModal = (proj: Project) => {
    setEditingProject(proj);
    setEditName(proj.name);
    setEditDesc(proj.description || "");
    setError("");
  };

  const openDeleteModal = (proj: Project) => {
    setDeletingProject(proj);
    setError("");
  };

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
            Manage your production AI workspace codebases, microservices, and agent swarms.
          </p>
        </div>

        <Button
          variant="glow"
          onClick={() => setCreateModalOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
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
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(["all", "active", "favorite", "archived"] as const).map((f) => (
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
      {loading ? (
        <div className="p-12 text-center text-xs text-text-secondary font-mono animate-pulse">
          Loading production workspace projects...
        </div>
      ) : projects.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-3">
          <Layers className="h-10 w-10 text-primary-light mx-auto opacity-50" />
          <h3 className="text-base font-bold text-white">No Projects Found</h3>
          <p className="text-xs text-text-secondary">
            Create your first AI workspace project to start building.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            Create Project
          </Button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <GlassCard key={proj.id} glowOnHover className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/30 text-primary-light flex items-center justify-center font-mono font-bold"
                      style={{ borderColor: proj.color || "#6E56CF" }}
                    >
                      <span>{proj.emoji || "🚀"}</span>
                    </div>
                    <div>
                      <h3
                        onClick={() => router.push(`/dashboard/projects/${proj.id}`)}
                        className="text-base font-bold text-white hover:text-primary-light cursor-pointer transition-colors flex items-center gap-2"
                      >
                        {proj.name}
                        {proj.pinned && <Pin className="h-3.5 w-3.5 text-primary-light fill-current" />}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-text-secondary font-mono mt-0.5">
                        <GitBranch className="h-3 w-3" /> {proj.slug} &bull; Created{" "}
                        {new Date(proj.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openRenameModal(proj)}
                      title="Rename / Edit Project"
                      className="p-1.5 rounded-lg border bg-surface border-border text-text-secondary hover:text-white hover:border-primary/40 transition-all"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => openDeleteModal(proj)}
                      title="Delete Project"
                      className="p-1.5 rounded-lg border bg-surface border-border text-text-secondary hover:text-red-400 hover:border-red-500/40 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleFavorite(proj.id)}
                      title="Favorite Project"
                      className={`p-1.5 rounded-lg border transition-all ${
                        proj.favorite
                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                          : "bg-surface border-border text-text-secondary hover:text-white"
                      }`}
                    >
                      <Star className={`h-3.5 w-3.5 ${proj.favorite ? "fill-current" : ""}`} />
                    </button>

                    <button
                      onClick={() => handleTogglePin(proj.id)}
                      title="Pin Project"
                      className={`p-1.5 rounded-lg border transition-all ${
                        proj.pinned
                          ? "bg-primary/20 text-primary-light border-primary/40"
                          : "bg-surface border-border text-text-secondary hover:text-white"
                      }`}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>

                    <Badge variant={proj.archived ? "secondary" : "success"}>
                      {proj.archived ? "Archived" : proj.status}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {proj.description || "No description provided."}
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-secondary font-mono">
                <button
                  onClick={() => handleArchiveProject(proj.id, proj.archived)}
                  className="flex items-center gap-1 hover:text-white transition-colors text-[11px]"
                >
                  <Archive className="h-3.5 w-3.5" />
                  {proj.archived ? "Restore" : "Archive"}
                </button>

                <button
                  onClick={() => router.push(`/dashboard/projects/${proj.id}`)}
                  className="flex items-center gap-1 text-white hover:text-primary-light transition-colors font-sans font-semibold text-xs"
                >
                  Open Workspace <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-surface border border-border-bright rounded-3xl p-6 space-y-4 shadow-glow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-light" />
                Create Workspace Project
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-text-secondary hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Subagent Code Reviewer"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Brief description of the project..."
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
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="glow" disabled={creating} className="flex-1">
                  {creating ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename / Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-surface border border-border-bright rounded-3xl p-6 space-y-4 shadow-glow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-primary-light" />
                Rename Project
              </h3>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1 text-text-secondary hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRenameProject} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
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
                  onClick={() => setEditingProject(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="glow" disabled={updating} className="flex-1">
                  {updating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-surface border border-red-500/30 rounded-3xl p-6 space-y-4 shadow-glow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Delete Project
              </h3>
              <button
                onClick={() => setDeletingProject(null)}
                className="p-1 text-text-secondary hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white">{deletingProject.name}</strong>? All subagent settings,
              audit logs, and project metadata will be permanently removed.
            </p>

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
                onClick={() => setDeletingProject(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteProject}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
