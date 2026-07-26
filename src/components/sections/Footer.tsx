"use client";

import React, { useState } from "react";
import { Sparkles, Github, Twitter, Disc as Discord, Linkedin, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail("");
    }
  };

  return (
    <footer className="bg-surface-subtle border-t border-border pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-border">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <a href="#hero" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-glow">
                <div className="h-full w-full bg-surface rounded-[10px] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-light" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Antigravity<span className="text-primary-light">.ai</span>
              </span>
            </a>

            <p className="text-xs text-text-secondary max-w-sm leading-relaxed">
              The next-generation AI workspace engineered for hyper-productive developers, software architects, and AI research teams.
            </p>

            {/* Live Operational Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs text-text-secondary">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span>All Systems Operational</span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-surface border border-border text-text-secondary hover:text-white transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-surface border border-border text-text-secondary hover:text-white transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-surface border border-border text-text-secondary hover:text-white transition-colors"
              >
                <Discord className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-surface border border-border text-text-secondary hover:text-white transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#workspace" className="hover:text-white transition-colors">Agent Studio</a></li>
              <li><a href="#workspace" className="hover:text-white transition-colors">Code Sandbox</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#docs" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#why-us" className="hover:text-white transition-colors">Security Whitepaper</a></li>
              <li><a href="#why-us" className="hover:text-white transition-colors">SOC2 Compliance</a></li>
              <li><a href="https://github.com" className="hover:text-white transition-colors">GitHub Repo</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Stay Ahead of AI Release Cycles
            </h4>
            <p className="text-xs text-text-secondary">
              Subscribe to get product updates, engineering deep dives, and subagent workflow tips.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-3 pr-24 py-2.5 rounded-xl glass-input text-xs"
                />
                <button
                  type="submit"
                  className="absolute right-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors"
                >
                  Subscribe
                </button>
              </div>
              {subscribed && (
                <div className="text-xs text-success flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Subscribed successfully!
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <div>
            &copy; {new Date().getFullYear()} Antigravity AI Technologies Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
