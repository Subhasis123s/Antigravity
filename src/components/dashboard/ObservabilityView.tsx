"use client";

import React, { useState, useEffect } from "react";
import { Activity, Cpu, DollarSign, Database, Server, Zap } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { ObservabilityMetrics, WorkspaceQuota } from "@/types/observability";
import { ProviderHealth } from "@/types/provider";
import { useAuth } from "@/context/AuthContext";

export const ObservabilityView: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ObservabilityMetrics | null>(null);
  const [quota, setQuota] = useState<WorkspaceQuota | null>(null);
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/observability/metrics");
      const json = await res.json();
      if (json.success && json.data) {
        setMetrics(json.data.metrics);
        setQuota(json.data.quota);
        setProviders(json.data.providerHealth || []);
      }
    } catch (err) {
      console.error("Failed to load telemetry metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-400" />
            AI OS Observability & Telemetry Engine
          </h1>
          <p className="text-xs text-text-secondary">
            Real-time monitoring for token counts, latencies, storage quotas, costs, and AI provider circuits.
          </p>
        </div>

        <Badge variant="success">Circuit Breakers: Active</Badge>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-text-secondary font-mono animate-pulse">
          Loading telemetry and provider health signals...
        </div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Monthly Tokens</span>
                <Cpu className="h-4 w-4 text-primary-light" />
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {metrics?.totalTokens.toLocaleString() || "0"}
              </div>
              <div className="text-[10px] text-text-muted">
                Limit: {quota?.monthlyTokenLimit.toLocaleString() || "10,000,000"}
              </div>
            </GlassCard>

            <GlassCard className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Estimated Cost</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                ${metrics?.totalCost.toFixed(3) || "0.000"}
              </div>
              <div className="text-[10px] text-text-muted">Calculated across prompt & completion tokens</div>
            </GlassCard>

            <GlassCard className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Average Latency</span>
                <Zap className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">
                {metrics?.averageLatencyMs || 245} ms
              </div>
              <div className="text-[10px] text-text-muted">P95 streaming response latency</div>
            </GlassCard>

            <GlassCard className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Storage Quota</span>
                <Database className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {((metrics?.storageBytesUsed || 0) / (1024 * 1024)).toFixed(1)} MB
              </div>
              <div className="text-[10px] text-text-muted">RAG Vector Vault storage bytes</div>
            </GlassCard>
          </div>

          {/* Provider Health Circuits */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-primary-light" /> AI Provider Circuit Breaker Health
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {providers.map((p) => (
                <GlassCard key={p.providerName} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white uppercase">{p.providerName}</span>
                    <Badge variant={p.status === "healthy" ? "success" : "outline"}>
                      {p.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-text-secondary font-mono space-y-1">
                    <div>Latency: {p.latencyMs} ms</div>
                    <div>Error Rate: {(p.errorRate * 100).toFixed(1)}%</div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
