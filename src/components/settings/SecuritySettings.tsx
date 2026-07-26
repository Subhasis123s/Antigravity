"use build";
"use client";

import React, { useState } from "react";
import { ShieldCheck, Smartphone, Key, Lock, Laptop, Globe, LogOut, CheckCircle2, QrCode } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const SecuritySettings: React.FC = () => {
  const { showToast } = useToast();
  const [twoFaModalOpen, setTwoFaModalOpen] = useState(false);
  const [isTwoFaEnabled, setIsTwoFaEnabled] = useState(true);

  const [sessions, setSessions] = useState([
    { id: "s1", device: "Chrome / Windows 11", ip: "192.168.1.9", location: "New York, USA", current: true, time: "Active now" },
    { id: "s2", device: "Safari / macOS Sonoma", ip: "74.125.20.10", location: "San Francisco, USA", current: false, time: "2 hours ago" },
  ]);

  const loginHistory = [
    { id: 1, date: "2026-07-26 14:20", method: "Google OAuth2.0", status: "Success", ip: "192.168.1.9" },
    { id: 2, date: "2026-07-25 09:14", method: "Magic Link", status: "Success", ip: "192.168.1.9" },
    { id: 3, date: "2026-07-24 18:32", method: "Password", status: "Success", ip: "74.125.20.10" },
  ];

  const revokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    showToast("Session revoked successfully.", "info");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* 2-Factor Authentication Section */}
      <div className="p-6 rounded-2xl bg-surface/70 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10 text-success border border-success/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Two-Factor Authentication (2FA) <Badge variant="success">Recommended</Badge>
              </h3>
              <p className="text-xs text-text-secondary">
                Add an extra layer of protection using Google Authenticator or 1Password.
              </p>
            </div>
          </div>

          <Button
            variant={isTwoFaEnabled ? "outline" : "glow"}
            size="sm"
            onClick={() => setTwoFaModalOpen(true)}
          >
            {isTwoFaEnabled ? "Manage 2FA" : "Enable 2FA"}
          </Button>
        </div>
      </div>

      {/* Active Sessions & Devices */}
      <div className="p-6 rounded-2xl bg-surface/70 border border-border space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Laptop className="h-4 w-4 text-primary-light" /> Active Sessions & Devices
        </h3>

        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="p-4 rounded-xl bg-surface-subtle border border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Laptop className="h-5 w-5 text-secondary" />
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    {s.device} {s.current && <Badge variant="success">CURRENT DEVICE</Badge>}
                  </div>
                  <div className="text-[10px] text-text-secondary mt-0.5 font-mono">
                    IP: {s.ip} &bull; {s.location} &bull; {s.time}
                  </div>
                </div>
              </div>

              {!s.current && (
                <button
                  onClick={() => revokeSession(s.id)}
                  className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-red-500/40 text-red-400 transition-colors"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Login History */}
      <div className="p-6 rounded-2xl bg-surface/70 border border-border space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="h-4 w-4 text-yellow-400" /> Recent Security Login History
        </h3>

        <div className="space-y-2">
          {loginHistory.map((lh) => (
            <div key={lh.id} className="p-3 rounded-xl bg-surface-subtle border border-border flex items-center justify-between text-xs font-mono">
              <span className="text-white">{lh.date}</span>
              <span className="text-text-secondary">{lh.method}</span>
              <span className="text-text-muted">IP: {lh.ip}</span>
              <Badge variant="success">{lh.status}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* 2FA Modal */}
      {twoFaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-surface border border-border-bright shadow-glow space-y-4">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary-light" /> Two-Factor Authentication Setup
            </h4>

            <p className="text-xs text-text-secondary leading-relaxed">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, or 1Password) to pair 2FA with your account.
            </p>

            <div className="p-4 rounded-2xl bg-white text-black flex flex-col items-center justify-center space-y-2">
              <div className="h-32 w-32 bg-black/10 rounded-xl flex items-center justify-center font-mono text-xs font-bold">
                [ 2FA QR CODE ]
              </div>
              <div className="text-[10px] font-mono text-gray-700">SECRET: JBSWY3DPEHPK3PXP</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setTwoFaModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="glow"
                size="sm"
                onClick={() => {
                  setTwoFaModalOpen(false);
                  setIsTwoFaEnabled(true);
                  showToast("2FA paired and active on your account!", "success");
                }}
              >
                Verify & Enable
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
