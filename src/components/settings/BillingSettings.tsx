"use client";

import React, { useState } from "react";
import { CreditCard, Check, ArrowRight, Download, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";

export const BillingSettings: React.FC = () => {
  const { showToast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState("pro");

  const plans = [
    { id: "starter", name: "Starter", price: "$29", features: ["5 Agent Swarms", "100k Token Context", "Community Docs"] },
    { id: "pro", name: "Pro Workspace", price: "$79", features: ["Unlimited Swarms", "2.0M Token Context", "Priority Support"], featured: true },
    { id: "enterprise", name: "Enterprise", price: "$199", features: ["Isolated Cloud Cluster", "SOC2 & HIPAA Compliant", "Dedicated Solutions Architect"] },
  ];

  const invoices = [
    { id: "INV-2026-004", date: "Jul 01, 2026", amount: "$62.00", status: "Paid" },
    { id: "INV-2026-003", date: "Jun 01, 2026", amount: "$62.00", status: "Paid" },
  ];

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName.toLowerCase());
    showToast(`Successfully requested upgrade to ${planName}!`, "success");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary-light" />
          Subscription & Billing
        </h1>
        <p className="text-xs text-text-secondary">
          Manage workspace subscription tiers, payment methods, and downloadable invoices.
        </p>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <GlassCard key={p.id} glowOnHover className={`flex flex-col justify-between space-y-4 ${p.featured ? "border-2 border-primary" : ""}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">{p.name}</h3>
                {p.featured && <Badge variant="primary">CURRENT</Badge>}
              </div>

              <div className="text-2xl font-extrabold text-white">{p.price} <span className="text-xs text-text-secondary font-normal">/ mo</span></div>

              <div className="space-y-2 pt-2 border-t border-border text-xs text-text-secondary">
                {p.features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-success" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant={p.featured ? "glow" : "secondary"}
              size="sm"
              onClick={() => handleUpgrade(p.name)}
              className="w-full"
            >
              {p.featured ? "Manage Plan" : "Upgrade Plan"}
            </Button>
          </GlassCard>
        ))}
      </div>

      {/* Invoices */}
      <div className="p-6 rounded-2xl bg-surface/70 border border-border space-y-4">
        <h3 className="text-sm font-bold text-white">Invoice History</h3>
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-3 rounded-xl bg-surface-subtle border border-border flex items-center justify-between text-xs font-mono">
              <div>
                <div className="font-bold text-white">{inv.id}</div>
                <div className="text-[10px] text-text-muted">{inv.date} &bull; {inv.amount}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">{inv.status}</Badge>
                <button
                  onClick={() => showToast(`Downloaded ${inv.id}`, "info")}
                  className="p-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-white"
                >
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
