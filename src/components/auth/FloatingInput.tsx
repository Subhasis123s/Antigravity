"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  type = "text",
  error,
  icon,
  value,
  onChange,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const isFloating = focused || hasValue;

  return (
    <div className="space-y-1 w-full">
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary z-10">
            {icon}
          </div>
        )}

        <input
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full ${
            icon ? "pl-11" : "pl-4"
          } pr-10 pt-5 pb-2 text-sm rounded-xl bg-surface-subtle/80 border text-white transition-all duration-200 placeholder-transparent focus:outline-none ${
            error
              ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              : focused
              ? "border-primary shadow-glow ring-1 ring-primary/40"
              : "border-border hover:border-border-bright"
          }`}
          placeholder={label}
          {...props}
        />

        {/* Floating Label */}
        <label
          className={`absolute pointer-events-none transition-all duration-200 ${
            icon ? "left-11" : "left-4"
          } ${
            isFloating
              ? "top-1.5 text-[10px] font-semibold text-primary-light uppercase tracking-wider"
              : "top-3.5 text-xs text-text-secondary"
          }`}
        >
          {label}
        </label>

        {/* Password Eye Toggle */}
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-400 pl-1">{error}</p>}
    </div>
  );
};
