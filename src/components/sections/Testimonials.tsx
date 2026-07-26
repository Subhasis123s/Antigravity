"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Sparkles, Quote } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: "Marcus Vance",
      role: "VP of Engineering at CloudScale",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      content:
        "Antigravity completely transformed how our 40+ engineering team builds software. Parallel subagent swarms handle code reviews and integration tests 10x faster than our old pipeline.",
      rating: 5,
      company: "CloudScale",
    },
    {
      name: "Elena Rostova",
      role: "Principal AI Architect at NexaLabs",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
      content:
        "The Knowledge Vault RAG indexing is incredible. We loaded our entire 2-million-line C++ codebase and Antigravity's agents answered complex cross-dependency queries in seconds.",
      rating: 5,
      company: "NexaLabs",
    },
    {
      name: "David Chen",
      role: "Co-Founder & CTO at Veloce",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      content:
        "The interface feels like standard-setting software from Apple and Linear combined. It's clean, lightning-fast, and distraction-free. Easily worth 10x the price.",
      rating: 5,
      company: "Veloce",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-surface-subtle/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="primary">
            <Sparkles className="h-3.5 w-3.5 text-primary-light" /> Loved by Builders
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Trusted by Engineers at <span className="text-gradient-purple">Top Startups</span>
          </h2>
          <p className="text-text-secondary text-base sm:text-lg">
            Here is what engineering leaders say about their daily workflow with Antigravity.
          </p>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard glowOnHover className="h-full flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Rating Stars */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <Quote className="h-6 w-6 text-primary/30" />
                  </div>

                  {/* Review Text */}
                  <p className="text-sm text-text-secondary leading-relaxed italic">
                    &quot;{review.content}&quot;
                  </p>
                </div>

                {/* Author Details */}
                <div className="flex items-center gap-3 pt-6 border-t border-border/60">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="h-11 w-11 rounded-full object-cover border border-primary/30 shadow-md"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{review.name}</h4>
                    <p className="text-xs text-text-secondary">{review.role}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
