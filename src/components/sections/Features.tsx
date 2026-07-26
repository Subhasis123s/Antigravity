"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  FolderKanban,
  Clock,
  BookOpen,
  Database,
  Image as ImageIcon,
  Video,
  Workflow,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";

export const Features: React.FC = () => {
  const featureItems = [
    {
      icon: <MessageSquare className="h-6 w-6 text-primary-light" />,
      title: "AI Chat & Multi-Agent Swarm",
      description:
        "Context-aware AI conversational interface powered by Claude, GPT-4, and Gemini with sub-agent delegation.",
      badge: "Real-time",
      gradient: "from-primary/20 to-secondary/10",
    },
    {
      icon: <FolderKanban className="h-6 w-6 text-secondary" />,
      title: "Project Management Hub",
      description:
        "Organize codebases, prompts, and team assets into unified workspace environments with fine-grained access control.",
      badge: "Smart Workspace",
      gradient: "from-purple-500/20 to-indigo-500/10",
    },
    {
      icon: <Clock className="h-6 w-6 text-success" />,
      title: "Scheduled Cron Tasks",
      description:
        "Automate recurring AI jobs, nightly code audits, dataset scraping, and automated reporting on cron schedules.",
      badge: "Automated",
      gradient: "from-emerald-500/20 to-teal-500/10",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-yellow-400" />,
      title: "Prompt Engineering Library",
      description:
        "Save, version, and share production-tested system prompts with variables, dynamic templates, and benchmark scores.",
      badge: "Versioned",
      gradient: "from-amber-500/20 to-orange-500/10",
    },
    {
      icon: <Database className="h-6 w-6 text-cyan-400" />,
      title: "Knowledge Vault & RAG",
      description:
        "Index your entire documentation, PDF repositories, and GitHub repos with instant vector semantic search.",
      badge: "Vector DB",
      gradient: "from-cyan-500/20 to-blue-500/10",
    },
    {
      icon: <ImageIcon className="h-6 w-6 text-pink-400" />,
      title: "AI Image Generation",
      description:
        "Generate UI mockups, brand assets, icon sets, and visual diagrams natively inside your workspace context.",
      badge: "Imagen & FLUX",
      gradient: "from-pink-500/20 to-rose-500/10",
    },
    {
      icon: <Video className="h-6 w-6 text-violet-400" />,
      title: "Video Generation",
      description:
        "Turn text prompts or product specs into crisp motion videos, feature walkthroughs, and animated visual assets.",
      badge: "Sora & Veo 2",
      gradient: "from-violet-500/20 to-purple-500/10",
    },
    {
      icon: <Workflow className="h-6 w-6 text-emerald-400" />,
      title: "Autonomous Workflows",
      description:
        "Drag-and-drop visual pipeline builder connecting webhooks, APIs, code execution nodes, and AI subagents.",
      badge: "Visual Canvas",
      gradient: "from-teal-500/20 to-emerald-500/10",
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-surface-subtle/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="primary">
            <Sparkles className="h-3.5 w-3.5 text-primary-light" /> Intelligent Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Engineered for <span className="text-gradient-purple">Maximum Productivity</span>
          </h2>
          <p className="text-text-secondary text-base sm:text-lg">
            Everything you need to orchestrate complex AI workflows, write production code, and scale software development.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <GlassCard glowOnHover className="h-full flex flex-col justify-between group">
                <div className="space-y-4">
                  {/* Top Header */}
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${item.gradient} border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-white/5 text-text-secondary border border-border">
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white group-hover:text-primary-light transition-colors flex items-center gap-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-border/50 flex items-center justify-between text-xs text-text-secondary group-hover:text-white transition-colors">
                  <span>Explore module</span>
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
