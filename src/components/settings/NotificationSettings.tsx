"use client";

import React, { useState } from "react";
import { Bell, Mail, Smartphone, Zap } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export const NotificationSettings: React.FC = () => {
  const { showToast } = useToast();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [marketingNotifs, setMarketingNotifs] = useState(false);
  const [taskAlerts, setTaskAlerts] = useState(true);

  const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, current: boolean, label: string) => {
    setter(!current);
    showToast(`${label} ${!current ? "enabled" : "disabled"}.`, "info");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="p-6 rounded-2xl bg-surface/70 border border-border space-y-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary-light" /> Notification Preferences
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle border border-border">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-secondary" />
              <div>
                <div className="text-xs font-bold text-white">Email Notifications</div>
                <div className="text-[10px] text-text-secondary">Receive daily digests of subagent task runs</div>
              </div>
            </div>
            <button
              onClick={() => toggle(setEmailNotifs, emailNotifs, "Email notifications")}
              className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                emailNotifs ? "bg-primary" : "bg-white/10"
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${emailNotifs ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle border border-border">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-success" />
              <div>
                <div className="text-xs font-bold text-white">Push Notifications</div>
                <div className="text-[10px] text-text-secondary">Real-time browser notifications when builds finish</div>
              </div>
            </div>
            <button
              onClick={() => toggle(setPushNotifs, pushNotifs, "Push notifications")}
              className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                pushNotifs ? "bg-primary" : "bg-white/10"
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${pushNotifs ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle border border-border">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-yellow-400" />
              <div>
                <div className="text-xs font-bold text-white">Subagent Swarm Alerts</div>
                <div className="text-[10px] text-text-secondary">Instant alerts for security vulnerability flags</div>
              </div>
            </div>
            <button
              onClick={() => toggle(setTaskAlerts, taskAlerts, "Subagent swarm alerts")}
              className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                taskAlerts ? "bg-primary" : "bg-white/10"
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${taskAlerts ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
