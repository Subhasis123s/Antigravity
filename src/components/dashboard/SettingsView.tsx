"use client";

import React, { useState } from "react";
import { User, Bell, Palette, Layers, ShieldCheck, Key, CreditCard } from "lucide-react";
import { ProfileSettings } from "../settings/ProfileSettings";
import { NotificationSettings } from "../settings/NotificationSettings";
import { AppearanceSettings } from "../settings/AppearanceSettings";
import { WorkspaceSettings } from "../settings/WorkspaceSettings";
import { SecuritySettings } from "../settings/SecuritySettings";
import { ApiKeysSettings } from "../settings/ApiKeysSettings";
import { BillingSettings } from "../settings/BillingSettings";

interface SettingsViewProps {
  initialTab?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ initialTab = "profile" }) => {
  const [subTab, setSubTab] = useState(initialTab);

  const tabs = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" /> },
    { id: "workspace", label: "Workspace", icon: <Layers className="h-4 w-4" /> },
    { id: "security", label: "Security", icon: <ShieldCheck className="h-4 w-4" /> },
    { id: "apikeys", label: "API Keys", icon: <Key className="h-4 w-4" /> },
    { id: "billing", label: "Billing", icon: <CreditCard className="h-4 w-4" /> },
  ];

  const renderContent = () => {
    switch (subTab) {
      case "profile":
        return <ProfileSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "workspace":
        return <WorkspaceSettings />;
      case "security":
        return <SecuritySettings />;
      case "apikeys":
        return <ApiKeysSettings />;
      case "billing":
        return <BillingSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
              subTab === t.id
                ? "bg-primary text-white font-bold shadow-glow"
                : "text-text-secondary hover:text-white hover:bg-surface-hover"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Sub Tab Content */}
      {renderContent()}
    </div>
  );
};
