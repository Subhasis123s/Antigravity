"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  Bot,
  BookOpen,
  Database,
  FileText,
  Clock,
  Settings,
  User,
  CreditCard,
  Plus,
  Zap,
  ArrowRight,
  X,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tabId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const items = [
    { id: "dashboard", label: "Dashboard Overview", category: "Navigation", icon: <LayoutDashboard className="h-4 w-4 text-primary-light" /> },
    { id: "chat", label: "AI Chat & Swarms", category: "Navigation", icon: <MessageSquare className="h-4 w-4 text-primary-light" /> },
    { id: "projects", label: "Projects & Repositories", category: "Navigation", icon: <FolderKanban className="h-4 w-4 text-secondary" /> },
    { id: "agents", label: "Agents & Subagent Swarms", category: "Navigation", icon: <Bot className="h-4 w-4 text-success" /> },
    { id: "prompts", label: "Prompt Engineering Library", category: "Navigation", icon: <BookOpen className="h-4 w-4 text-yellow-400" /> },
    { id: "knowledge", label: "Knowledge Base RAG", category: "Navigation", icon: <Database className="h-4 w-4 text-cyan-400" /> },
    { id: "files", label: "Files & Code Assets", category: "Navigation", icon: <FileText className="h-4 w-4 text-pink-400" /> },
    { id: "tasks", label: "Scheduled Cron Tasks", category: "Navigation", icon: <Clock className="h-4 w-4 text-violet-400" /> },
    { id: "settings", label: "Workspace Settings", category: "Navigation", icon: <Settings className="h-4 w-4 text-text-secondary" /> },
    { id: "profile", label: "User Profile", category: "Navigation", icon: <User className="h-4 w-4 text-text-secondary" /> },
    { id: "billing", label: "Billing & Plans", category: "Navigation", icon: <CreditCard className="h-4 w-4 text-text-secondary" /> },
    { id: "action_new_project", label: "Create New Project", category: "Quick Actions", icon: <Plus className="h-4 w-4 text-success" />, actionTab: "projects" },
    { id: "action_run_agent", label: "Deploy New Subagent", category: "Quick Actions", icon: <Zap className="h-4 w-4 text-primary-light" />, actionTab: "agents" },
  ];

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: typeof items[0]) => {
    onSelectTab(item.actionTab || item.id);
    onClose();
    setQuery("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-xl rounded-2xl bg-surface border border-border-bright shadow-glow overflow-hidden"
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center border-b border-border px-4 py-3 bg-surface-subtle">
              <Search className="h-5 w-5 text-text-secondary mr-3" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search workspace... (Esc to cancel)"
                className="w-full bg-transparent text-sm text-white placeholder-text-muted focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-1 rounded text-text-secondary hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-muted">
                  No matching commands found.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary/15 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-surface border border-border group-hover:border-primary/40">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-primary-light">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-text-muted">{item.category}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))
              )}
            </div>

            {/* Footer Keyboard Hints */}
            <div className="px-4 py-2 border-t border-border bg-surface-subtle flex justify-between text-[10px] text-text-muted font-mono">
              <span>Navigation & Actions</span>
              <span className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border">↑↓</kbd> navigate
                <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border">↵</kbd> select
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
