"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Runtime Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-md space-y-6">
        <div className="h-16 w-16 bg-red-500/10 text-red-400 rounded-3xl flex items-center justify-center mx-auto border border-red-500/30">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Application Exception</h1>
          <p className="text-xs text-text-secondary">
            An unexpected runtime error occurred in the workspace execution thread.
          </p>
        </div>

        {error.message && (
          <div className="p-3 rounded-xl bg-surface border border-red-500/30 text-xs font-mono text-red-400 text-left overflow-x-auto">
            {error.message}
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Button variant="glow" onClick={() => reset()} icon={<RefreshCw className="h-4 w-4" />}>
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button variant="secondary" icon={<Home className="h-4 w-4" />}>
              Dashboard Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
