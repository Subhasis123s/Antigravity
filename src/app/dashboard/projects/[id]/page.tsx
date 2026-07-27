"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FolderKanban,
  ArrowLeft,
  Settings,
  Users,
  Activity,
  Bot,
  Layers,
  Sparkles,
  GitBranch,
  Star,
  Pin,
  Calendar,
  Shield,
  Clock,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { Project, ProjectActivity } from "@/types/project";
import { useAuth } from "@/context/AuthContext";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "activity" | "settings">("overview");

  // Settings State
  const [model, setModel] = useState("gemini-3.6-pro");
  const [temperature, setTemperature] = useState(0.7);
  const [autoAgents, setAutoAgents] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchProjectDetails = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const json = await res.json();

      if (json.success && json.data) {
        setProject(json.data);
        if (json.data.settings?.ai_preferences) {
          setModel(json.data.settings.ai_preferences.model || "gemini-3.6-pro");
          setTemperature(json.data.settings.ai_preferences.temperature ?? 0.7);
          setAutoAgents(json.data.settings.ai_preferences.auto_agents ?? true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch project details", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityTrail = async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const json = await res.json();
      if (json.success && json.data) {
        // Fetch activity if available
      }
    } catch (err) {
      console.error("Failed to fetch activity", err);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const handleSaveSettings = async () => {
    if (!projectId || !project) return;
    setSavingSettings(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            ai_preferences: {
              model,
              temperature,
              auto_agents: autoAgents,
            },
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchProjectDetails();
      }
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-white">
        <div className="h-10 w-10 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center animate-spin mb-4">
          <Sparkles className="h-5 w-5 text-primary-light" />
        </div>
        <p className="text-xs font-mono text-text-secondary animate-pulse">
          Loading Project Workspace...
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background p-8 text-white max-w-4xl mx-auto space-y-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
        <GlassCard className="p-12 text-center space-y-4">
          <FolderKanban className="h-12 w-12 text-red-400 mx-auto opacity-70" />
          <h2 className="text-xl font-bold">Project Not Found</h2>
          <p className="text-xs text-text-secondary">
            The project does not exist or you do not have permission to view its workspace.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="space-y-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-xs text-text-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects Dashboard
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-2xl shadow-glow"
              style={{ borderColor: project.color || "#6E56CF" }}
            >
              {project.emoji || "🚀"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-white">{project.name}</h1>
                <Badge variant={project.status === "active" ? "success" : "secondary"}>
                  {project.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-secondary font-mono mt-1">
                <span className="flex items-center gap-1">
                  <GitBranch className="h-3.5 w-3.5 text-primary-light" /> {project.slug}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Created{" "}
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Bot className="h-4 w-4 text-primary-light" />}
              onClick={() => router.push("/dashboard")}
            >
              Assign Subagent
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: Layers },
          { id: "members", label: "Team & Members", icon: Users },
          { id: "activity", label: "Audit Trail", icon: Activity },
          { id: "settings", label: "AI Settings", icon: Settings },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-glow"
                  : "text-text-secondary hover:text-white hover:bg-surface-subtle"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-white">Project Description</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {project.description || "No description provided for this project."}
            </p>

            <div className="pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-surface-subtle border border-border">
                <span className="text-[10px] text-text-secondary block font-mono">VISIBILITY</span>
                <span className="font-bold text-white capitalize">{project.visibility}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-subtle border border-border">
                <span className="text-[10px] text-text-secondary block font-mono">STATUS</span>
                <span className="font-bold text-white capitalize">{project.status}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-subtle border border-border">
                <span className="text-[10px] text-text-secondary block font-mono">AI MODEL</span>
                <span className="font-bold text-primary-light">{model}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary-light" /> Quick Metadata
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-border text-text-secondary">
                <span>Favorite</span>
                <span className="text-white font-mono">{project.favorite ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border text-text-secondary">
                <span>Pinned</span>
                <span className="text-white font-mono">{project.pinned ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between py-2 text-text-secondary">
                <span>Archived</span>
                <span className="text-white font-mono">{project.archived ? "Yes" : "No"}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === "members" && (
        <GlassCard className="space-y-4">
          <h3 className="text-base font-bold text-white">Project Members & Access</h3>
          {project.members && project.members.length > 0 ? (
            <div className="divide-y divide-border">
              {project.members.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary-light">
                      {m.user?.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {m.user?.display_name || m.user?.full_name || m.user?.email}
                      </div>
                      <div className="text-[10px] text-text-secondary font-mono">{m.user?.email}</div>
                    </div>
                  </div>
                  <Badge variant="primary">{m.role}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-secondary">No members assigned yet.</p>
          )}
        </GlassCard>
      )}

      {activeTab === "activity" && (
        <GlassCard className="space-y-4">
          <h3 className="text-base font-bold text-white">Audit Trail Logs</h3>
          <p className="text-xs text-text-secondary">
            System audit log history for project mutations and subagent executions.
          </p>
        </GlassCard>
      )}

      {activeTab === "settings" && (
        <GlassCard className="max-w-2xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-light" /> AI Workspace Preferences
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Primary LLM Model Engine
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white bg-surface"
              >
                <option value="gemini-3.6-pro">Gemini 3.6 Pro (Recommended)</option>
                <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                <option value="gpt-4o">OpenAI GPT-4o</option>
                <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                AI Temperature ({temperature})
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="block text-xs font-bold text-white">Automated Subagent Swarms</span>
                <span className="block text-[10px] text-text-secondary">
                  Allow autonomous subagents to execute project workflows automatically.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoAgents}
                onChange={(e) => setAutoAgents(e.target.checked)}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> AI Preferences updated successfully.
              </div>
            )}

            <Button
              variant="glow"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              icon={<Save className="h-4 w-4" />}
            >
              {savingSettings ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
