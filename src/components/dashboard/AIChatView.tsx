"use client";

import React, { useState } from "react";
import { Bot, Send, Sparkles, Terminal, Copy, Check, RefreshCw, Trash2, Cpu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const AIChatView: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "user",
      text: "Refactor the TailwindCSS glassmorphism component to support animated border gradients and subagent state triggers.",
      time: "14:30",
    },
    {
      id: 2,
      sender: "agent",
      agentName: "Frontend Swarm Architect",
      text: "I have updated the `GlassCard.tsx` component with an animated top border gradient highlight and smooth state transitions:",
      code: `export const GlassCard: React.FC<GlassCardProps> = ({ children }) => {\n  return (\n    <div className="relative rounded-2xl bg-surface/80 backdrop-blur-xl border border-border hover:border-primary/40 shadow-glow">\n      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />\n      {children}\n    </div>\n  );\n};`,
      time: "14:31",
    },
  ]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gemini-3.6-pro");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: "user", text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    const promptText = input;
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const agentMsg = {
        id: Date.now() + 1,
        sender: "agent",
        agentName: "Code Subagent Swarm",
        text: `Executed your request using ${model}. Built test suite and compiled successfully in 0.82ms.`,
        code: `// Output generated for prompt: "${promptText.slice(0, 30)}..."\nconst result = await Antigravity.runSwarm({ task: "${promptText}" });\nconsole.log("Status: 200 OK");`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col justify-between rounded-3xl bg-surface/70 border border-border backdrop-blur-xl overflow-hidden shadow-glow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-surface-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-glow">
            <div className="h-full w-full bg-surface rounded-[10px] flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-light" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              AI Swarm Chat <Badge variant="success">Active</Badge>
            </div>
            <div className="text-[10px] text-text-secondary">Parallel execution runtime connected</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-white focus:outline-none"
          >
            <option value="gemini-3.6-pro">Gemini 3.6 Pro (Recommended)</option>
            <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            <option value="gpt-4o">OpenAI GPT-4o</option>
          </select>

          <button
            onClick={() => setMessages([])}
            className="p-2 rounded-xl bg-surface border border-border text-text-secondary hover:text-white"
            title="Clear Chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
            <div className={`max-w-2xl space-y-2 ${m.sender === "user" ? "text-right" : "text-left"}`}>
              <div className="text-[10px] text-text-muted font-mono mb-1">
                {m.sender === "user" ? "You" : m.agentName} &bull; {m.time}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-primary text-white shadow-md inline-block text-left"
                    : "bg-surface border border-border text-white space-y-3"
                }`}
              >
                <p>{m.text}</p>

                {m.code && (
                  <div className="relative rounded-xl bg-black/60 border border-border p-3 font-mono text-[11px] text-primary-light overflow-x-auto">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(m.code!);
                        setCopiedId(m.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="absolute top-2 right-2 p-1 rounded bg-surface border border-border text-text-secondary hover:text-white"
                    >
                      {copiedId === m.id ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                    </button>
                    <pre>{m.code}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-text-secondary font-mono animate-pulse">
            <Bot className="h-4 w-4 text-primary-light animate-spin" />
            <span>Subagent Swarm is generating code response...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-border bg-surface-subtle flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Swarm to write code, refactor components, or audit security..."
          className="flex-1 px-4 py-3 rounded-xl glass-input text-xs"
        />
        <Button type="submit" variant="glow" icon={<Send className="h-4 w-4" />}>
          Send
        </Button>
      </form>
    </div>
  );
};
