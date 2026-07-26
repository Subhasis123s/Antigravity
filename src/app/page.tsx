"use client";

import React, { useState } from "react";
import { SpotlightEffect } from "@/components/ui/SpotlightEffect";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { WorkspacePreview } from "@/components/sections/WorkspacePreview";
import { WhyUs } from "@/components/sections/WhyUs";
import { Pricing } from "@/components/sections/Pricing";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/sections/Footer";
import { AuthModal } from "@/components/modals/AuthModal";
import { DemoModal } from "@/components/modals/DemoModal";

export default function Home() {
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    tab: "signin" | "signup";
  }>({
    isOpen: false,
    tab: "signup",
  });

  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const handleOpenAuth = (tab: "signin" | "signup") => {
    setAuthModalState({ isOpen: true, tab });
  };

  const handleCloseAuth = () => {
    setAuthModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <main className="relative bg-background text-white min-h-screen selection:bg-primary selection:text-white">
      {/* Interactive Cursor Spotlight Glow */}
      <SpotlightEffect />

      {/* Navigation */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* Hero Section */}
      <Hero
        onOpenAuth={handleOpenAuth}
        onOpenDemo={() => setDemoModalOpen(true)}
      />

      {/* Core Features Grid */}
      <Features />

      {/* Interactive Workspace Simulator */}
      <WorkspacePreview />

      {/* Why Choose Us */}
      <WhyUs />

      {/* Transparent Pricing */}
      <Pricing onOpenAuth={handleOpenAuth} />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ Accordion */}
      <FAQ />

      {/* Call To Action Banner */}
      <CTASection onOpenAuth={handleOpenAuth} />

      {/* Footer */}
      <Footer />

      {/* Interactive Auth Modal */}
      <AuthModal
        isOpen={authModalState.isOpen}
        onClose={handleCloseAuth}
        initialTab={authModalState.tab}
      />

      {/* Interactive Demo Video Modal */}
      <DemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </main>
  );
}
