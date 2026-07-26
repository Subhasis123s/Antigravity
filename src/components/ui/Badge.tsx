"use client";

import React from "react";
import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "outline";
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  dot = true,
  className,
}) => {
  const variantStyles = {
    primary: "bg-primary/10 text-primary-light border-primary/30",
    secondary: "bg-surface text-text-secondary border-border",
    success: "bg-success/10 text-success border-success/30",
    outline: "bg-white/5 text-white border-white/10",
  };

  const dotColors = {
    primary: "bg-primary-light animate-pulse",
    secondary: "bg-text-secondary",
    success: "bg-success animate-pulse",
    outline: "bg-white",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full border backdrop-blur-md transition-all duration-200 select-none",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={clsx("h-1.5 w-1.5 rounded-full shrink-0", dotColors[variant])} />
      )}
      {children}
    </span>
  );
};
