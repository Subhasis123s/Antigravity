"use client";

import React, { useState } from "react";
import { Moon, Sun, Laptop, Palette, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export const AppearanceSettings: React.FC = () => {
  const { showToast } = useToast();
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">("dark");
  const [accentColor, setAccentColor] = useState("#6E56CF");
  const [enableMotion, setEnableMotion] = useState(true);

  const colors = [
    { name: "Antigravity Violet", hex: "#6E56CF" },
    { name: "Electric Blue", hex: "#3B82F6" },
    { name: "Emerald Cyber", hex: "#10B981" },
    { name: "Amber Glow", hex: "#F59E0B" },
    { name: "Neon Pink", hex: "#EC4899" },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="p-6 rounded-2xl bg-surface/70 border border-border space-y-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary-light" /> Theme & Visual Customization
        </h3>

        {/* Theme Mode Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary">Interface Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "dark", label: "Dark Theme", icon: <Moon className="h-4 w-4" /> },
              { id: "light", label: "Light Preview", icon: <Sun className="h-4 w-4" /> },
              { id: "system", label: "System Sync", icon: <Laptop className="h-4 w-4" /> },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setThemeMode(t.id as any);
                  showToast(`Theme set to ${t.label}`, "info");
                }}
                className={`p-3.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  themeMode === t.id
                    ? "bg-primary/20 border-primary text-white shadow-glow"
                    : "bg-surface-subtle border-border text-text-secondary hover:text-white"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color Picker */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary">Accent Color</label>
          <div className="flex flex-wrap items-center gap-3">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => {
                  setAccentColor(c.hex);
                  showToast(`Accent color updated to ${c.name}`, "info");
                }}
                className={`h-9 w-9 rounded-full border-2 flex items-center justify-center transition-transform cursor-pointer ${
                  accentColor === c.hex ? "border-white scale-110 shadow-glow" : "border-transparent"
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Motion Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary" /> Framer Motion Micro-Animations
            </div>
            <div className="text-[10px] text-text-secondary">Enable smooth page transitions and hover effects</div>
          </div>
          <button
            onClick={() => {
              setEnableMotion(!enableMotion);
              showToast(`Animations ${!enableMotion ? "enabled" : "disabled"}.`, "info");
            }}
            className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
              enableMotion ? "bg-primary" : "bg-white/10"
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${enableMotion ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
