"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";

interface CTASectionProps {
  onOpenAuth: (tab: "signin" | "signup") => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onOpenAuth }) => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl bg-gradient-to-tr from-surface via-surface-hover to-surface border border-border-bright p-8 sm:p-12 lg:p-16 overflow-hidden text-center shadow-glow">
          {/* Ambient Lighting Background */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/25 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/25 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center justify-center">
              <span className="px-4 py-1.5 rounded-full bg-primary/20 text-primary-light text-xs font-semibold border border-primary/40 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" /> Ready for the Future?
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Build Faster with Your Intelligent <br />
              <span className="text-gradient-purple">AI Subagent Swarm</span>
            </h2>

            <p className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto">
              Join thousands of high-velocity developers and startups orchestrating software with Antigravity AI OS.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                variant="glow"
                size="lg"
                onClick={() => onOpenAuth("signup")}
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Get Started Free
              </Button>
              <Button variant="secondary" size="lg" onClick={() => onOpenAuth("signin")}>
                Talk to Enterprise Team
              </Button>
            </div>

            <div className="pt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-text-secondary">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> Instant Setup
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> 14-Day Free Trial
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
