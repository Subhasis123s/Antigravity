"use client";

import React, { useState, useEffect } from "react";
import { User as UserIcon, Shield, LogOut, CheckCircle2, Save, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const ProfileView: React.FC = () => {
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setDisplayName(user.name || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          display_name: displayName,
          bio,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setMessage("Profile details updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <UserIcon className="h-6 w-6 text-primary-light" />
          User Profile & Security
        </h1>
        <p className="text-xs text-text-secondary">
          Manage your personal user profile, connected OAuth accounts, and security sessions.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface/70 border border-border space-y-6 shadow-glow">
        <div className="flex items-center gap-4 pb-6 border-b border-border">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-16 w-16 rounded-full object-cover border-2 border-primary/50 shadow-glow"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <Badge variant="primary">{user.provider.toUpperCase()} AUTH</Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">{user.email}</p>
            <div className="text-[10px] text-text-muted font-mono mt-1">
              User ID: {user.id} &bull; Member since {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Profile Update Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">User Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Enterprise AI OS engineer & subagent swarm operator..."
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
            />
          </div>

          {message && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              {message}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" variant="glow" disabled={saving} icon={<Save className="h-4 w-4" />}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-border">
          <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-1">
            <span className="text-text-muted">Account Security</span>
            <div className="text-white font-bold flex items-center gap-1.5 mt-0.5">
              <Shield className="h-4 w-4 text-success" /> Two-Factor Authentication Enabled
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-1">
            <span className="text-text-muted">Role & Permissions</span>
            <div className="text-white font-bold flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-primary-light" /> Workspace Admin / Owner
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-between items-center border-t border-border">
          <span className="text-xs text-text-secondary">Need to leave workspace?</span>
          <Button variant="outline" onClick={signOut} icon={<LogOut className="h-4 w-4" />}>
            Sign Out of Account
          </Button>
        </div>
      </div>
    </div>
  );
};
