"use client";

import React from "react";
import { CreditCard, Zap, CheckCircle2, ArrowRight, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";

export const BillingView: React.FC = () => {
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
          Manage your workspace plan, subagent quotas, payment methods, and invoice receipts.
        </p>
      </div>

      {/* Active Plan Card */}
      <GlassCard glowOnHover className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">CURRENT PLAN</Badge>
              <h2 className="text-xl font-bold text-white">Pro Workspace</h2>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Billed annually at <strong className="text-white">$62 / month</strong> &bull; Renews Aug 01, 2026
            </p>
          </div>

          <Button variant="glow" icon={<ArrowRight className="h-4 w-4" />}>
            Upgrade to Enterprise
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-1">
            <span className="text-text-muted">Subagent Swarms</span>
            <div className="text-white font-bold text-sm">Unlimited Swarm Access</div>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-1">
            <span className="text-text-muted">Token Context Capacity</span>
            <div className="text-primary-light font-bold text-sm">2,000,000 Tokens</div>
          </div>
        </div>
      </GlassCard>

      {/* Invoice History */}
      <div className="p-6 rounded-2xl bg-surface/70 border border-border space-y-4">
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
