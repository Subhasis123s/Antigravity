"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { FloatingInput } from "@/components/auth/FloatingInput";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordPage() {
  const { sendForgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await sendForgotPassword(email);
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthCard
      title="Reset Your Password"
      subtitle="Enter your email address and we'll send you instructions to reset your password."
    >
      {sent ? (
        <div className="p-6 rounded-2xl bg-success/10 border border-success/30 text-center space-y-4">
          <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
          <h3 className="text-lg font-bold text-white">Reset Link Sent</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            If an account exists for <strong className="text-white">{email}</strong>, you will receive an email with instructions to set a new password within a few minutes.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="outline" className="w-full" icon={<ArrowLeft className="h-4 w-4" />} iconPosition="left">
                Return to Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            label="Account Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-4 w-4" />}
            required
          />

          <Button
            type="submit"
            variant="glow"
            disabled={loading}
            className="w-full mt-2"
            icon={<ArrowRight className="h-4 w-4" />}
          >
            {loading ? "Sending Reset Link..." : "Send Password Reset Link"}
          </Button>

          <div className="pt-4 text-center">
            <Link
              href="/login"
              className="text-xs text-text-secondary hover:text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
