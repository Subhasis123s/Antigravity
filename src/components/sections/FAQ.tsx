"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, HelpCircle } from "lucide-react";
import { Badge } from "../ui/Badge";

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does Antigravity differ from existing AI IDEs and extensions?",
      answer:
        "Antigravity is designed from the ground up as an AI-native workspace rather than a text editor plugin. It features parallel subagent swarms that run autonomously in isolated background tasks, sub-millisecond execution engines, and deep RAG knowledge indexing across your entire software ecosystem.",
    },
    {
      question: "Can I bring my own API keys or models?",
      answer:
        "Yes! Antigravity supports native API keys for Gemini, Claude 3.5, OpenAI GPT-4, and custom open-weight models running on Ollama, vLLM, or AWS Bedrock. Enterprise plans also support custom private deployments.",
    },
    {
      question: "Is my codebase used to train AI models?",
      answer:
        "Never. We maintain a zero-data-retention policy and enforce strict enterprise encryption protocols. Your source code and intellectual property remain 100% private to your workspace environment.",
    },
    {
      question: "How do subagent swarms execute code in parallel?",
      answer:
        "When you issue a complex task (e.g. 'Build auth & write tests'), Antigravity orchestrates background worker instances. Each agent handles a specialized sub-task concurrently and streams results back through a unified trajectory transcript.",
    },
    {
      question: "What happens after the 14-day free trial?",
      answer:
        "You can choose to upgrade to a Pro or Enterprise workspace plan. If you choose not to upgrade, your account automatically reverts to a free tier with basic features and standard execution quotas.",
    },
  ];

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="primary">
            <Sparkles className="h-3.5 w-3.5 text-primary-light" /> Clear Answers
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked <span className="text-gradient-purple">Questions</span>
          </h2>
          <p className="text-text-secondary text-base sm:text-lg">
            Everything you need to know about Antigravity AI OS.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="rounded-2xl bg-surface/70 border border-border overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-white hover:text-primary-light transition-colors cursor-pointer"
                >
                  <span className="text-base sm:text-lg flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-primary-light shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-text-secondary shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary-light" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-sm text-text-secondary leading-relaxed border-t border-border/40 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
