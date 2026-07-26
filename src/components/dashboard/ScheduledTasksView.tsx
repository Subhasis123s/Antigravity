"use client";

import React, { useState } from "react";
import { Clock, Plus, Play, Pause, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";

export const ScheduledTasksView: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: "t1", name: "Nightly Security Vulnerability Audit", cron: "0 0 * * *", status: "Active", nextRun: "In 9 hours", agent: "Security Auditor" },
    { id: "t2", name: "Weekly Knowledge Vault Vector Re-index", cron: "0 2 * * 0", status: "Active", nextRun: "In 4 days", agent: "RAG Indexer" },
    { id: "t3", name: "Hourly Dependency Vulnerability Scanner", cron: "0 * * * *", status: "Active", nextRun: "In 15 mins", agent: "Test Runner" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Clock className="h-6 w-6 text-violet-400" />
            Scheduled Cron Tasks
          </h1>
          <p className="text-xs text-text-secondary">
            Schedule recurring subagent workflows, code audits, and automated reporting.
          </p>
        </div>

        <Button variant="glow" icon={<Plus className="h-4 w-4" />}>
          Schedule Cron Task
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tasks.map((task) => (
          <GlassCard key={task.id} glowOnHover className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="success">{task.status}</Badge>
                <h3 className="text-sm font-bold text-white">{task.name}</h3>
              </div>
              <p className="text-xs text-text-secondary font-mono">
                Cron: <code className="text-primary-light">{task.cron}</code> &bull; Next Run: {task.nextRun} &bull; Agent: {task.agent}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" icon={<Play className="h-3.5 w-3.5" />}>
                Run Now
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
