"use client";

import React, { useState, useEffect } from "react";
import { Clock, Plus, Play, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { BackgroundJob } from "@/types/job";

export const ScheduledTasksView: React.FC = () => {
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setJobs(json.data);
      }
    } catch (err) {
      console.error("Failed to load background jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleEnqueueJob = async (type: string) => {
    try {
      const wsRes = await fetch("/api/workspace");
      const wsJson = await wsRes.json();
      const workspaceId =
        wsJson.data?.id ||
        wsJson.workspace?.id ||
        (Array.isArray(wsJson.workspaces) && wsJson.workspaces[0]?.id) ||
        null;

      if (!workspaceId) return;

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspaceId,
          job_type: type,
          payload: { trigger: "manual_dashboard_action" },
        }),
      });

      const json = await res.json();
      if (json.success) {
        fetchJobs();
      }
    } catch (err) {
      console.error("Failed to enqueue job", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Clock className="h-6 w-6 text-violet-400" />
            Background Processing Jobs
          </h1>
          <p className="text-xs text-text-secondary">
            Asynchronous background worker queue, vector re-indexing, and agent swarm runs.
          </p>
        </div>

        <Button
          variant="glow"
          onClick={() => handleEnqueueJob("knowledge_indexing")}
          icon={<Plus className="h-4 w-4" />}
        >
          Enqueue Re-Index Job
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-text-secondary font-mono animate-pulse">
          Fetching background jobs...
        </div>
      ) : jobs.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-3">
          <Clock className="h-10 w-10 text-violet-400 mx-auto opacity-50" />
          <h3 className="text-base font-bold text-white">No Active Background Jobs</h3>
          <p className="text-xs text-text-secondary">
            Enqueue background processing tasks for offline subagent execution or vector embedding updates.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEnqueueJob("knowledge_indexing")}
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            Enqueue Re-Index Job
          </Button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <GlassCard key={job.id} glowOnHover className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={job.status === "completed" ? "success" : "primary"}>
                    {job.status.toUpperCase()}
                  </Badge>
                  <h3 className="text-sm font-bold text-white font-mono">{job.job_type}</h3>
                </div>
                <p className="text-xs text-text-secondary font-mono">
                  Job ID: {job.id} &bull; Attempts: {job.attempts} / {job.max_attempts} &bull; Created: {new Date(job.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEnqueueJob(job.job_type)}
                  icon={<Play className="h-3.5 w-3.5" />}
                >
                  Run Worker
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
