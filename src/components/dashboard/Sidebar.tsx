"use client";

import React from "react";
import {
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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
  Zap,
} from "lucide-react";

import Link from "next/link";

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  section?: string;
}

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const mainItems: SidebarItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "chat", label: "AI Chat", icon: <MessageSquare className="h-4 w-4" />, badge: "Swarm" },
    { id: "projects", label: "Projects", icon: <FolderKanban className="h-4 w-4" /> },
    { id: "agents", label: "Agents", icon: <Bot className="h-4 w-4" />, badge: "4 Active" },
    { id: "prompts", label: "Prompt Library", icon: <BookOpen className="h-4 w-4" /> },
    { id: "knowledge", label: "Knowledge Base", icon: <Database className="h-4 w-4" /> },
    { id: "files", label: "Files", icon: <FileText className="h-4 w-4" /> },
    { id: "tasks", label: "Scheduled Tasks", icon: <Clock className="h-4 w-4" /> },
  ];

  const systemItems: SidebarItem[] = [
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { id: "billing", label: "Billing", icon: <CreditCard className="h-4 w-4" />, badge: "Pro" },
  ];

  const renderNavList = (items: SidebarItem[]) => (
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              onSelectTab(item.id);
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-primary text-white shadow-glow font-bold border border-primary/40"
                : "text-text-secondary hover:text-white hover:bg-surface-hover"
            }`}
            title={collapsed ? item.label : undefined}
          >
            <div className="flex items-center gap-3">
              <span className={isActive ? "text-white" : "text-text-secondary"}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </div>

            {!collapsed && item.badge && (
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-primary/15 text-primary-light border border-primary/30"
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-surface/90 backdrop-blur-xl border-r border-border flex flex-col justify-between transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Top Brand & Workspace Switcher */}
        <div className="p-4 space-y-4 border-b border-border">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-glow shrink-0">
                <div className="h-full w-full bg-surface rounded-[10px] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-light" />
                </div>
              </div>
              {!collapsed && (
                <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                  Antigravity<span className="text-primary-light">.ai</span>
                </span>
              )}
            </Link>

            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-white transition-colors"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {!collapsed && (
            <div className="p-2.5 rounded-xl bg-surface-subtle border border-border flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-2 truncate">
                <Layers className="h-4 w-4 text-primary-light shrink-0" />
                <span className="font-semibold truncate">Production Swarm</span>
              </div>
              <span className="h-2 w-2 rounded-full bg-success animate-pulse shrink-0" />
            </div>
          )}
        </div>

        {/* Middle Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          <div>
            {!collapsed && (
              <div className="px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">
                Workspace
              </div>
            )}
            {renderNavList(mainItems)}
          </div>

          <div className="pt-3 border-t border-border/60">
            {!collapsed && (
              <div className="px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">
                System
              </div>
            )}
            {renderNavList(systemItems)}
          </div>
        </div>

        {/* Bottom Agent Status Pill */}
        {!collapsed && (
          <div className="p-3 border-t border-border bg-surface-subtle/50">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-3">
              <Zap className="h-4 w-4 text-primary-light shrink-0" />
              <div className="text-[11px]">
                <div className="font-bold text-white">4 Subagents Ready</div>
                <div className="text-text-secondary text-[10px]">Latency: 0.84ms</div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
