"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambient Radial Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Top Navigation Back Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface/80 border border-border hover:border-border-bright text-xs font-medium text-text-secondary hover:text-white backdrop-blur-md transition-all shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Glass Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-3xl bg-surface/80 backdrop-blur-2xl border border-border-bright shadow-glow p-8 sm:p-10 my-8"
      >
        {/* Top Gradient Edge Highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <Link href="/" className="flex items-center gap-2 group mb-1">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-glow group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-surface rounded-[14px] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-light" />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Antigravity<span className="text-primary-light">.ai</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-xs text-text-secondary max-w-xs">{subtitle}</p>
        </div>

        {children}
      </motion.div>
    </div>
  );
};
