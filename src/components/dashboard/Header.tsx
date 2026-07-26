"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Menu,
  Sparkles,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenMobileSidebar: () => void;
  onSelectTab: (tabId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onOpenMobileSidebar,
  onSelectTab,
}) => {
  const { user, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const notifications = [
    { id: 1, title: "Subagent Swarm Completed", desc: "Automated test suite passed (14/14).", time: "2m ago" },
    { id: 2, title: "Knowledge Vault Indexing", desc: "45,000 document vectors generated.", time: "15m ago" },
    { id: 3, title: "Cron Task Executed", desc: "Nightly security scan finished cleanly.", time: "1h ago" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-border py-3 px-4 sm:px-6 flex items-center justify-between">
      {/* Left Items: Mobile Menu & Command Search Trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl bg-surface border border-border text-text-secondary hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Bar (Trigger CTRL+K) */}
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-surface-subtle border border-border hover:border-border-bright text-xs text-text-secondary transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="h-4 w-4 text-text-muted group-hover:text-primary-light transition-colors" />
            <span className="truncate">Search commands, projects, agents...</span>
          </div>

          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-mono text-text-muted">
            <span className="text-[11px]">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 ml-4">
        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-xl bg-surface border border-border text-text-secondary hover:text-white transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Moon className="h-4 w-4 text-secondary" /> : <Sun className="h-4 w-4 text-yellow-400" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="p-2 rounded-xl bg-surface border border-border text-text-secondary hover:text-white transition-colors relative"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-surface border border-border-bright shadow-glow p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-bold text-white">Notifications</span>
                <span className="text-[10px] text-primary-light font-mono">3 Unread</span>
              </div>

              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-surface-subtle border border-border space-y-0.5">
                    <div className="flex justify-between text-xs font-semibold text-white">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-text-muted">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-text-secondary">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-subtle border border-border hover:border-border-bright transition-all cursor-pointer"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="h-7 w-7 rounded-full object-cover border border-primary/40"
              />
              <span className="hidden sm:inline text-xs font-semibold text-white max-w-[100px] truncate">
                {user.name}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface border border-border-bright shadow-glow p-2 z-50 space-y-1">
                <div className="p-3 border-b border-border space-y-1">
                  <div className="text-xs font-bold text-white">{user.name}</div>
                  <div className="text-[11px] text-text-secondary truncate">{user.email}</div>
                  <span className="inline-block px-2 py-0.5 rounded text-[9px] font-mono bg-primary/20 text-primary-light border border-primary/30 uppercase mt-1">
                    {user.provider} Auth
                  </span>
                </div>

                <button
                  onClick={() => {
                    onSelectTab("profile");
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User className="h-4 w-4" /> Profile Settings
                </button>

                <button
                  onClick={() => {
                    onSelectTab("settings");
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="h-4 w-4" /> Workspace Preferences
                </button>

                <div className="border-t border-border pt-1">
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
