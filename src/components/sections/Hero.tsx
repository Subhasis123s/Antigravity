"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Play, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { HeroDashboardMockup } from "./HeroDashboardMockup";

interface HeroProps {
  onOpenAuth: (tab: "signin" | "signup") => void;
  onOpenDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuth, onOpenDemo }) => {
  return (
    <section id="hero" className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-radial-gradient pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
          >
            {/* Top Announcement Pill */}
            <div className="inline-flex items-center">
              <Badge variant="primary" className="py-1.5 px-4 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-primary-light" />
                Introducing Antigravity AI OS v2.0 &bull; Next-Gen Intelligence
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Your Complete <br />
              <span className="text-gradient-purple">AI Workspace</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl font-normal leading-relaxed">
              Create, organize, and automate your work with intelligent AI agents in one beautiful workspace.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                variant="glow"
                size="lg"
                onClick={() => onOpenAuth("signup")}
                icon={<ArrowRight className="h-4 w-4" />}
                className="w-full sm:w-auto"
              >
                Start Free
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={onOpenDemo}
                icon={<Play className="h-4 w-4 fill-current text-primary-light" />}
                iconPosition="left"
                className="w-full sm:w-auto"
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-border/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary-light" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-secondary" />
                <span>SOC2 Type II Certified</span>
              </div>
            </div>
          </motion.div>

          {/* Right Interactive Hero Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-6"
          >
            <HeroDashboardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
