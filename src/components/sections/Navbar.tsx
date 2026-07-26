"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Github, Menu, X, ArrowRight, Star } from "lucide-react";
import { Button } from "../ui/Button";

interface NavbarProps {
  onOpenAuth: (tab: "signin" | "signup") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "Features", href: "#features" },
    { name: "Workspace", href: "#workspace" },
    { name: "Why Us", href: "#why-us" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border py-3 shadow-glass"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#hero" className="flex items-center gap-2.5 group">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-glow group-hover:scale-105 transition-transform">
            <div className="h-full w-full bg-surface rounded-[10px] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-light group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Antigravity <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary-light border border-primary/40 font-mono">v2.0</span>
            </span>
          </div>
        </a>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-1 px-4 py-1.5 rounded-full bg-surface/60 backdrop-blur-md border border-border">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3.5 py-1.5 text-sm font-medium text-text-secondary hover:text-white rounded-full hover:bg-white/5 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* GitHub Star Badge */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl bg-surface border border-border hover:border-border-bright text-text-secondary hover:text-white transition-all"
          >
            <Github className="h-4 w-4" />
            <span>Star</span>
            <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary-light text-[10px] font-mono flex items-center gap-1">
              <Star className="h-2.5 w-2.5 fill-current" /> 14.8k
            </span>
          </a>

          <button
            onClick={() => onOpenAuth("signin")}
            className="px-3.5 py-2 text-sm font-medium text-text-secondary hover:text-white transition-colors"
          >
            Sign In
          </button>

          <Button
            variant="glow"
            size="sm"
            onClick={() => onOpenAuth("signup")}
            icon={<ArrowRight className="h-3.5 w-3.5" />}
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-text-secondary hover:text-white rounded-xl bg-surface border border-border"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-b border-border overflow-hidden px-6 py-6 space-y-4"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-base font-medium text-text-secondary hover:text-white rounded-xl hover:bg-white/5"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth("signin");
                }}
              >
                Sign In
              </Button>
              <Button
                variant="glow"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth("signup");
                }}
              >
                Get Started Free
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
