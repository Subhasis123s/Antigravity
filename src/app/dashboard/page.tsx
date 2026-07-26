"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { AIChatView } from "@/components/dashboard/AIChatView";
import { ProjectsView } from "@/components/dashboard/ProjectsView";
import { AgentsView } from "@/components/dashboard/AgentsView";
import { PromptLibraryView } from "@/components/dashboard/PromptLibraryView";
import { KnowledgeBaseView } from "@/components/dashboard/KnowledgeBaseView";
import { FilesView } from "@/components/dashboard/FilesView";
import { ScheduledTasksView } from "@/components/dashboard/ScheduledTasksView";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { ProfileView } from "@/components/dashboard/ProfileView";
import { BillingView } from "@/components/dashboard/BillingView";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Authentication protective check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center animate-spin">
          <Sparkles className="h-5 w-5 text-primary-light" />
        </div>
        <p className="text-xs text-text-secondary font-mono animate-pulse">
          Authenticating Antigravity Session...
        </p>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardHome user={user} onSelectTab={setActiveTab} />;
      case "chat":
        return <AIChatView />;
      case "projects":
        return <ProjectsView />;
      case "agents":
        return <AgentsView />;
      case "prompts":
        return <PromptLibraryView />;
      case "knowledge":
        return <KnowledgeBaseView />;
      case "files":
        return <FilesView />;
      case "tasks":
        return <ScheduledTasksView />;
      case "settings":
        return <SettingsView />;
      case "profile":
        return <ProfileView />;
      case "billing":
        return <BillingView />;
      default:
        return <DashboardHome user={user} onSelectTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onSelectTab={setActiveTab}
        />

        {/* View Content Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Ctrl + K Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
      />
    </div>
  );
}
