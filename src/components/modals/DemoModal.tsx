"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Sparkles, CheckCircle2, Bot, Terminal, Cpu } from "lucide-react";
import { Button } from "../ui/Button";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<"overview" | "features">("overview");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-4xl rounded-3xl bg-surface border border-border-bright shadow-glow overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-subtle">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-xs text-text-secondary font-mono">
                  antigravity-workspace-demo.mp4
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-text-secondary hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content area */}
            <div className="p-6">
              {/* Simulated Interactive Video Screen */}
              <div className="relative aspect-video rounded-2xl bg-black border border-border overflow-hidden group">
                {/* Background Ambient Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20" />
                
                {/* Mock Video Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary-light border border-primary/40 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Antigravity AI OS v2.4
                    </span>
                    <div className="px-2.5 py-1 text-xs rounded bg-surface/80 text-text-secondary border border-border font-mono">
                      LIVE PREVIEW MODE
                    </div>
                  </div>

                  {/* Center Play Graphic */}
                  <div className="self-center my-auto flex flex-col items-center">
                    <div className="relative">
                      <div className="absolute -inset-4 rounded-full bg-primary/30 blur-xl animate-pulse" />
                      <div className="relative h-20 w-20 rounded-full bg-primary text-white flex items-center justify-center shadow-glow border border-white/20 transition-transform group-hover:scale-110">
                        <Play className="h-8 w-8 fill-current ml-1" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-text-secondary font-medium text-center">
                      Interactive Workspace Walkthrough (3:15)
                    </p>
                  </div>

                  {/* Video Progress Bar Mock */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-text-secondary font-mono">
                      <span>01:24</span>
                      <span>03:15</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-2/5 bg-gradient-to-r from-primary to-secondary rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-surface-subtle border border-border flex items-start gap-3">
                  <Bot className="h-5 w-5 text-primary-light shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Autonomous Agents</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Multi-agent orchestration doing coding, design & research.
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-surface-subtle border border-border flex items-start gap-3">
                  <Terminal className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Instant Execution</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Sub-millisecond code sandbox execution & live previews.
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-surface-subtle border border-border flex items-start gap-3">
                  <Cpu className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Knowledge Vault</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Deep contextual semantic search across all your codebases.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
                <Button variant="glow" onClick={onClose}>
                  Get Started Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
