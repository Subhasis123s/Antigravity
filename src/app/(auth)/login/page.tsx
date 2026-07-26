"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { signInWithEmail, sendMagicLink, loading } = useAuth();
  const [authMethod, setAuthMethod] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your work email.");
      return;
    }

    if (authMethod === "magic") {
      const success = await sendMagicLink(email);
      if (success) setMagicSent(true);
    } else {
      if (!password) {
        setError("Please enter your password.");
        return;
      }
      await signInWithEmail(email, password, rememberMe);
    }
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to your Antigravity AI workspace to continue building."
    >
      {/* Mode Switcher */}
      <div className="grid grid-cols-2 p-1 bg-surface-subtle border border-border rounded-xl mb-6">
        <button
          type="button"
          onClick={() => {
            setAuthMethod("password");
            setMagicSent(false);
          }}
          className={`py-2 text-xs font-medium rounded-lg transition-all ${
            authMethod === "password"
              ? "bg-primary text-white shadow-md"
              : "text-text-secondary hover:text-white"
          }`}
        >
          Password Login
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMethod("magic");
            setMagicSent(false);
          }}
          className={`py-2 text-xs font-medium rounded-lg transition-all ${
            authMethod === "magic"
              ? "bg-primary text-white shadow-md"
              : "text-text-secondary hover:text-white"
          }`}
        >
          Magic Link
        </button>
      </div>

      {/* Social OAuth Options */}
      <SocialAuthButtons />

      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-surface px-3 text-[10px] text-text-secondary uppercase tracking-widest font-mono">
          Or continue with email
        </span>
      </div>

      {magicSent ? (
        <div className="p-6 rounded-2xl bg-success/10 border border-success/30 text-center space-y-3">
          <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
          <h3 className="text-base font-bold text-white">Check Your Inbox</h3>
          <p className="text-xs text-text-secondary">
            We dispatched a single-use login link to <strong className="text-white">{email}</strong>.
          </p>
          <button
            type="button"
            onClick={() => setMagicSent(false)}
            className="text-xs text-primary-light underline hover:text-white pt-2"
          >
            Use a different email address
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            label="Work Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-4 w-4" />}
            required
          />

          {authMethod === "password" && (
            <FloatingInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              required
            />
          )}

          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

          {/* Remember Me & Forgot Password Row */}
          {authMethod === "password" && (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border bg-surface text-primary focus:ring-primary/40"
                />
                Remember me for 30 days
              </label>

              <Link
                href="/forgot-password"
                className="text-xs text-primary-light hover:text-white transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          )}

          <Button
            type="submit"
            variant="glow"
            disabled={loading}
            className="w-full mt-2"
            icon={<ArrowRight className="h-4 w-4" />}
          >
            {loading
              ? "Signing In..."
              : authMethod === "password"
              ? "Sign In to Workspace"
              : "Send Magic Login Link"}
          </Button>
        </form>
      )}

      {/* Footer Switch Link */}
      <div className="mt-8 text-center text-xs text-text-secondary">
        Don&apos;t have a workspace yet?{" "}
        <Link href="/signup" className="text-white font-semibold underline hover:text-primary-light">
          Create Account Free
        </Link>
      </div>
    </AuthCard>
  );
}
