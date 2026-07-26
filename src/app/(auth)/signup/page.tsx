"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/ui/Button";
import { useAuth, AuthErrorDetails } from "@/context/AuthContext";

export default function SignUpPage() {
  const { signUp, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [errorDetails, setErrorDetails] = useState<AuthErrorDetails | null>(null);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);

  const getPasswordScore = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const score = getPasswordScore(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);
    setRequiresConfirmation(false);

    if (!name || !email || !password) {
      setErrorDetails({ message: "Please fill out all required fields." });
      return;
    }

    if (!agreed) {
      setErrorDetails({ message: "You must accept the Terms of Service to continue." });
      return;
    }

    const res = await signUp(name, email, password);

    if (!res.success) {
      setErrorDetails(
        res.errorDetails || {
          message: res.error || "Registration failed. Please check your credentials.",
        }
      );
    } else if (res.requiresConfirmation) {
      setRequiresConfirmation(true);
    }
  };

  return (
    <AuthCard
      title="Create Your Account"
      subtitle="Join thousands of developers using Antigravity AI Workspace."
    >
      <SocialAuthButtons />

      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-surface px-3 text-[10px] text-text-secondary uppercase tracking-widest font-mono">
          Or register with email
        </span>
      </div>

      {requiresConfirmation ? (
        <div className="p-6 rounded-2xl bg-success/10 border border-success/30 text-center space-y-3">
          <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
          <h3 className="text-base font-bold text-white">Confirmation Email Dispatched</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            We sent a verification link to <strong className="text-white">{email}</strong>. Please check your inbox and click the link to activate your Supabase account.
          </p>
          <Link
            href="/login"
            className="inline-block text-xs text-primary-light font-semibold underline hover:text-white pt-2"
          >
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<UserIcon className="h-4 w-4" />}
            required
          />

          <FloatingInput
            label="Work Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-4 w-4" />}
            required
          />

          <div className="space-y-1.5">
            <FloatingInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              required
            />

            {password.length > 0 && (
              <div className="space-y-1 pt-1 px-1">
                <div className="flex gap-1 h-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full flex-1 rounded-full transition-colors ${
                        score >= step
                          ? score <= 1
                            ? "bg-red-500"
                            : score <= 2
                            ? "bg-yellow-500"
                            : "bg-success"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-text-secondary flex justify-between font-mono">
                  <span>Password Strength</span>
                  <span className="font-semibold text-white">
                    {score <= 1 ? "Weak" : score <= 2 ? "Medium" : "Strong"}
                  </span>
                </p>
              </div>
            )}
          </div>

          {errorDetails && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs space-y-1.5 font-mono leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-red-300">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span>Supabase Signup Error</span>
              </div>
              <p><strong className="text-white">Message:</strong> {errorDetails.message || "Unknown error"}</p>
              {errorDetails.code && <p><strong className="text-white">Code / Status:</strong> {String(errorDetails.code)}</p>}
            </div>
          )}

          <label className="flex items-start gap-2 text-xs text-text-secondary cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded border-border bg-surface text-primary focus:ring-primary/40"
            />
            <span>
              I agree to the{" "}
              <a href="#terms" className="text-white underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#privacy" className="text-white underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>

          <Button
            type="submit"
            variant="glow"
            disabled={loading}
            className="w-full mt-2"
            icon={<ArrowRight className="h-4 w-4" />}
          >
            {loading ? "Creating Account..." : "Create Free Account"}
          </Button>
        </form>
      )}

      <div className="mt-8 text-center text-xs text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-white font-semibold underline hover:text-primary-light">
          Sign In
        </Link>
      </div>
    </AuthCard>
  );
}
