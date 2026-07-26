"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, Cpu, Sparkles, CheckCircle2 } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";

export const WhyUs: React.FC = () => {
  const pillars = [
    {
      icon: <Zap className="h-8 w-8 text-primary-light" />,
      title: "Sub-Millisecond Speed",
      badge: "< 1ms Cold Start",
      description:
        "Built on custom Rust-powered execution runtimes and global edge deployment. Run code, execute prompt chains, and compile builds instantly.",
      stats: [
        { label: "Execution Latency", value: "0.84ms" },
        { label: "Build Acceleration", value: "10x Faster" },
      ],
      glow: "from-primary/30 to-secondary/10",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-success" />,
      title: "Bank-Grade Security",
      badge: "SOC2 Type II",
      description:
        "Your code and sensitive prompts never leave your private environment. Zero model training on customer data, end-to-end AES-256 encryption.",
      stats: [
        { label: "Data Retention", value: "0 Days" },
        { label: "Compliance Rate", value: "100% Audit" },
      ],
      glow: "from-emerald-500/30 to-teal-500/10",
    },
    {
      icon: <Cpu className="h-8 w-8 text-secondary" />,
      title: "AI-Native Architecture",
      badge: "Multi-Model Swarm",
      description:
        "Not a legacy IDE with a chatbot plugin. Antigravity was architected from line one for deep multi-agent coordination and infinite context windows.",
      stats: [
        { label: "Context Window", value: "2.0M Tokens" },
        { label: "Supported Models", value: "All Top LLMs" },
      ],
      glow: "from-purple-500/30 to-violet-500/10",
    },
  ];

  return (
    <section id="why-us" className="py-24 relative overflow-hidden bg-surface-subtle/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="primary">
            <Sparkles className="h-3.5 w-3.5 text-primary-light" /> Uncompromising Performance
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Why Teams Switch to <span className="text-gradient-purple">Antigravity</span>
          </h2>
          <p className="text-text-secondary text-base sm:text-lg">
            Designed for engineering organizations demanding maximum speed, rock-solid security, and true AI intelligence.
          </p>
        </div>

        {/* 3 Column Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard glowOnHover className="h-full flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${pillar.glow} border border-white/10`}>
                      {pillar.icon}
                    </div>
                    <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-white/5 text-white border border-border">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-text-secondary leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-border/60">
                  {pillar.stats.map((stat, sIdx) => (
                    <div key={sIdx} className="p-3 rounded-xl bg-surface-subtle border border-border">
                      <div className="text-xs text-text-secondary">{stat.label}</div>
                      <div className="text-lg font-extrabold text-white mt-0.5">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
