"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight, Github, Mail, ShieldCheck } from "lucide-react";
import { Button } from "../ui/Button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "signin" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = "signup",
}) => {
  const [tab, setTab] = useState<"signin" | "signup">(initialTab);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md rounded-3xl bg-surface border border-border-bright shadow-glow overflow-hidden p-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1 text-text-secondary hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Logo Mark */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-glow">
                <div className="h-full w-full bg-surface rounded-[10px] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-light" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Antigravity<span className="text-primary-light">.ai</span>
              </span>
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-surface-subtle border border-border rounded-xl mb-6">
              <button
                onClick={() => {
                  setTab("signup");
                  setSubmitted(false);
                }}
                className={`py-2 text-sm font-medium rounded-lg transition-all ${
                  tab === "signup"
                    ? "bg-primary text-white shadow-md"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                Create Account
              </button>
              <button
                onClick={() => {
                  setTab("signin");
                  setSubmitted(false);
                }}
                className={`py-2 text-sm font-medium rounded-lg transition-all ${
                  tab === "signin"
                    ? "bg-primary text-white shadow-md"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                Sign In
              </button>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-8 text-center space-y-4"
              >
                <div className="h-16 w-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto border border-success/30">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Check Your Inbox</h3>
                <p className="text-sm text-text-secondary">
                  We sent a magic login link to <strong className="text-white">{email}</strong>.
                  Click it to access your Antigravity workspace.
                </p>
                <Button variant="outline" className="w-full mt-4" onClick={() => setSubmitted(false)}>
                  Use a different email
                </Button>
              </motion.div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-2">
                  {tab === "signup"
                    ? "Experience the future of AI workspace"
                    : "Welcome back to your workspace"}
                </h2>
                <p className="text-xs text-text-secondary mb-6">
                  {tab === "signup"
                    ? "Get 14 days free trial. No credit card required."
                    : "Enter your credentials to continue to your dashboard."}
                </p>

                {/* Social Login Buttons */}
                <div className="space-y-3 mb-6">
                  <button className="w-full py-2.5 px-4 rounded-xl bg-surface-subtle border border-border hover:border-border-bright text-white text-sm font-medium flex items-center justify-center gap-3 transition-colors">
                    <Github className="h-4 w-4" />
                    Continue with GitHub
                  </button>
                  <button className="w-full py-2.5 px-4 rounded-xl bg-surface-subtle border border-border hover:border-border-bright text-white text-sm font-medium flex items-center justify-center gap-3 transition-colors">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.35 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </div>

                <div className="relative my-6 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <span className="relative bg-surface px-3 text-xs text-text-secondary uppercase tracking-wider font-mono">
                    Or email
                  </span>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-text-secondary" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@company.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="glow"
                    className="w-full"
                    icon={<ArrowRight className="h-4 w-4" />}
                  >
                    {tab === "signup" ? "Get Started Free" : "Sign In with Magic Link"}
                  </Button>
                </form>

                <p className="mt-4 text-center text-xs text-text-secondary">
                  By continuing, you agree to our{" "}
                  <a href="#terms" className="underline hover:text-white">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#privacy" className="underline hover:text-white">
                    Privacy Policy
                  </a>
                  .
                </p>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
