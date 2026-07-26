"use client";

import React, { useState } from "react";
import { User as UserIcon, Mail, Lock, Upload, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { FloatingInput } from "@/components/auth/FloatingInput";

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(user?.name || "Alex Dev");
  const [email, setEmail] = useState(user?.email || "alex@company.com");
  const [username, setUsername] = useState("alex_antigravity");
  const [avatar, setAvatar] = useState(user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Profile details updated successfully!", "success");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast("Please enter current and new password.", "error");
      return;
    }
    showToast("Password updated successfully!", "success");
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
      showToast("Avatar image updated!", "success");
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Avatar & Basic Info */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-surface/70 border border-border space-y-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-primary-light" /> Profile Information
        </h3>

        <div className="flex items-center gap-6">
          <div className="relative group">
            <img
              src={avatar}
              alt="Avatar"
              className="h-20 w-20 rounded-full object-cover border-2 border-primary/40 shadow-glow"
            />
            <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
              <Upload className="h-5 w-5 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          <div>
            <div className="text-sm font-bold text-white">{displayName}</div>
            <div className="text-xs text-text-secondary">JPG, PNG or GIF. Max 2MB.</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingInput
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <FloatingInput
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <FloatingInput
          label="Work Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />}
        />

        <div className="flex justify-end">
          <Button type="submit" variant="glow" size="sm">
            Save Profile Changes
          </Button>
        </div>
      </form>

      {/* Password Change */}
      <form onSubmit={handleChangePassword} className="p-6 rounded-2xl bg-surface/70 border border-border space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="h-4 w-4 text-secondary" /> Change Password
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingInput
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <FloatingInput
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="secondary" size="sm">
            Update Password
          </Button>
        </div>
      </form>

      {/* Danger Zone: Delete Account */}
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-4">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
          <AlertTriangle className="h-4 w-4" /> Danger Zone
        </div>
        <p className="text-xs text-text-secondary">
          Permanently delete your account and all associated workspace agent data. This action cannot be undone.
        </p>
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-semibold transition-colors flex items-center gap-2"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete Account
        </button>
      </div>

      {/* Delete Account Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-surface border border-red-500/40 space-y-4 shadow-glow">
            <h4 className="text-base font-bold text-white">Confirm Account Deletion</h4>
            <p className="text-xs text-text-secondary">
              Are you sure you want to permanently erase your profile and active subagent swarms?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-500 hover:bg-red-600 border-red-400"
                onClick={() => {
                  setDeleteModalOpen(false);
                  showToast("Account deletion request submitted.", "error");
                }}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
