"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/ui/Button";
import { useAuth, AuthErrorDetails } from "@/context/AuthContext";

export default function LoginPage() {
  const { signInWithEmail, sendMagicLink, loading } = useAuth();
  const [authMethod, setAuthMethod] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [magicSent, setMagicSent] = useState(false);
  const [errorDetails, setErrorDetails] = useState<AuthErrorDetails | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);

    if (!email) {
      setErrorDetails({ message: "Please enter your work email." });
      return;
    }

    if (authMethod === "magic") {
      const res = await sendMagicLink(email);
      if (res.success) {
        setMagicSent(true);
      } else {
        setErrorDetails(
          res.errorDetails || { message: res.error || "Failed to send magic link." }
        );
      }
    } else {
      if (!password) {
        setErrorDetails({ message: "Please enter your password." });
        return;
      }
      const res = await signInWithEmail(email, password, rememberMe);
      if (!res.success) {
        setErrorDetails(
          res.errorDetails || { message: res.error || "Authentication failed. Please check your credentials." }
        );
      }
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
            setErrorDetails(null);
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
            setErrorDetails(null);
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

          {errorDetails && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs space-y-1.5 font-mono leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-red-300">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span>Supabase Login Error</span>
              </div>
              <p><strong className="text-white">Message:</strong> {errorDetails.message || "Unknown error"}</p>
              {errorDetails.code && <p><strong className="text-white">Code / Status:</strong> {String(errorDetails.code)}</p>}
            </div>
          )}

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
