"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Check, Zap, ArrowRight, ShieldCheck, Star } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { GlassCard } from "../ui/GlassCard";

interface PricingProps {
  onOpenAuth: (tab: "signin" | "signup") => void;
}

export const Pricing: React.FC<PricingProps> = ({ onOpenAuth }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for independent developers and AI enthusiasts.",
      monthlyPrice: "$29",
      annualPrice: "$22",
      period: "per user / month",
      featured: false,
      cta: "Start Free Trial",
      features: [
        "Up to 5 active agent swarms",
        "100,000 token memory context",
        "Access to Gemini 3.6 & Claude 3.5",
        "Sub-millisecond code execution",
        "Community support & docs",
      ],
    },
    {
      name: "Pro Workspace",
      description: "For growing engineering teams and power builders.",
      monthlyPrice: "$79",
      annualPrice: "$62",
      period: "per user / month",
      featured: true,
      badge: "MOST POPULAR",
      cta: "Upgrade to Pro",
      features: [
        "Unlimited parallel subagent swarms",
        "2,000,000 token context window",
        "Custom prompt engineering library",
        "Scheduled cron tasks & automated workflows",
        "Knowledge Vault RAG indexing",
        "Priority 24/7 support & API keys",
      ],
    },
    {
      name: "Enterprise",
      description: "For large organizations with strict security & SLA needs.",
      monthlyPrice: "$199",
      annualPrice: "$159",
      period: "per user / month",
      featured: false,
      cta: "Contact Enterprise Team",
      features: [
        "Everything in Pro Workspace",
        "Dedicated isolated cloud cluster",
        "SOC2 Type II & HIPAA compliance",
        "Zero data model training guarantee",
        "Custom SSO (SAML/Okta) & RBAC",
        "Dedicated AI Solutions Architect",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <Badge variant="primary">
            <Sparkles className="h-3.5 w-3.5 text-primary-light" /> Transparent Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Simple Plans for <span className="text-gradient-purple">Every Team</span>
          </h2>
          <p className="text-text-secondary text-base sm:text-lg">
            Start with a 14-day free trial. Scale as your AI workflows and team expand.
          </p>

          {/* Billing Toggle */}
          <div className="pt-6 flex items-center justify-center gap-3">
            <span
              className={`text-sm font-medium transition-colors ${
                !isAnnual ? "text-white font-bold" : "text-text-secondary"
              }`}
            >
              Monthly Billing
            </span>

            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-8 rounded-full bg-surface border border-border p-1 transition-colors cursor-pointer"
            >
              <div
                className={`w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary transition-transform ${
                  isAnnual ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>

            <span
              className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                isAnnual ? "text-white font-bold" : "text-text-secondary"
              }`}
            >
              Annual Billing
              <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-semibold border border-success/30">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex"
            >
              <div
                className={`relative w-full rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.featured
                    ? "bg-surface/90 border-2 border-primary shadow-glow ring-1 ring-primary/50"
                    : "bg-surface/60 border border-border backdrop-blur-xl hover:border-border-bright"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-extrabold uppercase tracking-wider shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Plan Name & Description */}
                  <div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-text-secondary mt-1 min-h-[32px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price Display */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white">
                      {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-xs text-text-secondary font-medium">
                      / {plan.period}
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="text-xs font-bold text-white uppercase tracking-wider">
                      Included Capabilities:
                    </div>
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-text-secondary">
                        <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-8 mt-6">
                  <Button
                    variant={plan.featured ? "glow" : "secondary"}
                    size="lg"
                    onClick={() => onOpenAuth("signup")}
                    className="w-full"
                    icon={<ArrowRight className="h-4 w-4" />}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
