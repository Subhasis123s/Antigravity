"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, ArrowRight, Download, Cpu, Database, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { ObservabilityMetrics, WorkspaceQuota } from "@/types/observability";

export const BillingView: React.FC = () => {
  const [metrics, setMetrics] = useState<ObservabilityMetrics | null>(null);
  const [quota, setQuota] = useState<WorkspaceQuota | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuotaData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/observability/metrics");
      const json = await res.json();
      if (json.success && json.data) {
        setMetrics(json.data.metrics);
        setQuota(json.data.quota);
      }
    } catch (err) {
      console.error("Failed to load quota metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotaData();
  }, []);

  const tokenPercent = Math.min(
    100,
    Math.round(((quota?.tokensUsedThisMonth || 0) / (quota?.monthlyTokenLimit || 10000000)) * 100)
  );

  const invoices = [
    { id: "INV-2026-004", date: "Jul 01, 2026", amount: "$62.00", status: "Paid" },
    { id: "INV-2026-003", date: "Jun 01, 2026", amount: "$62.00", status: "Paid" },
    { id: "INV-2026-002", date: "May 01, 2026", amount: "$62.00", status: "Paid" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary-light" />
          Subscription & Billing
        </h1>
        <p className="text-xs text-text-secondary">
          Manage your workspace plan, token quotas, agent allocations, and invoice receipts.
        </p>
      </div>

      {/* Active Plan Card */}
      <GlassCard glowOnHover className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">CURRENT PLAN</Badge>
              <h2 className="text-xl font-bold text-white">{quota?.plan || "Pro Workspace"}</h2>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Billed annually at <strong className="text-white">$62 / month</strong> &bull; Renews Aug 01, 2026
            </p>
          </div>

          <Button variant="glow" icon={<ArrowRight className="h-4 w-4" />}>
            Upgrade to Enterprise
          </Button>
        </div>

        {loading ? (
          <div className="p-4 text-center text-xs text-text-secondary font-mono animate-pulse">
            Fetching usage metrics...
          </div>
        ) : (
          <div className="space-y-4 pt-4 border-t border-border">
            {/* Token Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-text-secondary flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-primary-light" /> Monthly Token Usage
                </span>
                <span className="text-white font-bold">
                  {(quota?.tokensUsedThisMonth || 0).toLocaleString()} / {(quota?.monthlyTokenLimit || 10000000).toLocaleString()} ({tokenPercent}%)
                </span>
              </div>
              <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, tokenPercent)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-2">
              <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-1">
                <span className="text-text-muted flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-emerald-400" /> Active Subagent Limit
                </span>
                <div className="text-white font-bold text-sm">
                  {quota?.activeAgentsCount || 0} / {quota?.maxAgentsAllowed || 50} Swarms Active
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-1">
                <span className="text-text-muted flex items-center gap-1">
                  <Database className="h-3.5 w-3.5 text-cyan-400" /> Vector Vault Storage
                </span>
                <div className="text-primary-light font-bold text-sm">
                  {((quota?.storageBytesUsed || 0) / (1024 * 1024)).toFixed(1)} MB / 10 GB
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Invoice History */}
      <div className="p-6 rounded-2xl bg-surface/70 border border-border space-y-4 shadow-glow">
        <h3 className="text-sm font-bold text-white">Billing History & Invoices</h3>

        <div className="space-y-2">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-3.5 rounded-xl bg-surface-subtle border border-border flex items-center justify-between text-xs font-mono">
              <div>
                <div className="font-bold text-white">{inv.id}</div>
                <div className="text-[10px] text-text-muted">{inv.date} &bull; {inv.amount}</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="success">{inv.status}</Badge>
                <button className="p-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-white">
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
