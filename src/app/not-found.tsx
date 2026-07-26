"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-md space-y-6">
        <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-glow mx-auto">
          <div className="h-full w-full bg-surface rounded-[22px] flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary-light" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-mono">
            404
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Page Not Found</h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            The workspace vector coordinate you are looking for does not exist or has been relocated by an active subagent thread.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="glow" size="md" icon={<LayoutDashboard className="h-4 w-4" />}>
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="secondary" size="md" icon={<Home className="h-4 w-4" />}>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
