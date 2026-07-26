"use client";

import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowOnHover?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hoverEffect = true,
  glowOnHover = false,
  onClick,
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverEffect ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={clsx(
        "relative rounded-2xl bg-surface/70 backdrop-blur-xl border border-border p-6 transition-all duration-300 shadow-glass overflow-hidden",
        glowOnHover && "hover:border-primary/40 hover:shadow-glow",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Subtle top inner gradient highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {children}
    </motion.div>
  );
};
