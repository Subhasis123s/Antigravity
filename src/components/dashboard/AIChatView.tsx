"use client";

import React, { useState, useEffect } from "react";
import { Bot, Send, Sparkles, Copy, Check, Trash2, Cpu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChatMessage } from "@/types/chat";
import { useAuth } from "@/context/AuthContext";

export const AIChatView: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gemini-3.6-pro");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [streamingStatus, setStreamingStatus] = useState<string | null>(null);

  const fetchChatData = async () => {
    try {
      const res = await fetch("/api/chat");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const activeSession = json.data[0];
        setSessionId(activeSession.id);
        if (activeSession.messages) {
          setMessages(activeSession.messages);
        }
      }
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  };

  useEffect(() => {
    fetchChatData();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userPrompt = input.trim();
    setInput("");
    setIsTyping(true);
    setStreamingStatus("Initializing SSE Stream...");

    try {
      const wsRes = await fetch("/api/workspace");
      const wsJson = await wsRes.json();
      const workspaceId =
        wsJson.data?.id ||
        wsJson.workspace?.id ||
        (Array.isArray(wsJson.workspaces) && wsJson.workspaces[0]?.id) ||
        null;

      if (!workspaceId) {
        setIsTyping(false);
        return;
      }

      // Add optimistic User Message
      const userMsg: ChatMessage = {
        id: "usr_" + Date.now(),
        session_id: sessionId || "temp_session",
        role: "user",
        content: userPrompt,
        tokens: 0,
        cost: 0,
        latency_ms: 0,
        created_at: new Date().toISOString(),
      };

      const assistantMsgId = "ast_" + Date.now();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        session_id: sessionId || "temp_session",
        role: "assistant",
        content: "",
        code_snippet: "",
        tokens: 0,
        cost: 0,
        latency_ms: 0,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      // Connect to Real-Time SSE Stream Endpoint
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId || undefined,
          workspace_id: workspaceId,
          message: userPrompt,
          model,
        }),
      });

      if (!response.body) throw new Error("No SSE response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let accumulatedCode = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value);
        const lines = chunkText.split("\n\n");

        for (const line of lines) {
          if (!line.trim()) continue;

          if (line.includes("event: status")) {
            const dataMatch = line.match(/data: (.*)/);
            if (dataMatch) {
              const data = JSON.parse(dataMatch[1]);
              setStreamingStatus(data.message);
            }
          } else if (line.includes("event: token")) {
            const dataMatch = line.match(/data: (.*)/);
            if (dataMatch) {
              const data = JSON.parse(dataMatch[1]);
              accumulatedText += data.text;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsgId ? { ...m, content: accumulatedText } : m))
              );
            }
          } else if (line.includes("event: code")) {
            const dataMatch = line.match(/data: (.*)/);
            if (dataMatch) {
              const data = JSON.parse(dataMatch[1]);
              accumulatedCode = data.code;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsgId ? { ...m, code_snippet: accumulatedCode } : m))
              );
            }
          }
        }
      }
    } catch (err) {
      console.error("SSE stream error", err);
    } finally {
      setIsTyping(false);
      setStreamingStatus(null);
    }
  };

  const handleClearChat = async () => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    try {
      await fetch(`/api/chat/${sessionId}`, { method: "DELETE" });
      setMessages([]);
      setSessionId(null);
    } catch (err) {
      console.error("Failed to clear chat session", err);
    }
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
              AI Swarm Chat <Badge variant="success">SSE Streaming</Badge>
            </div>
            <div className="text-[10px] text-text-secondary">Connected to Multi-Provider Engine & RAG Vault</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-white focus:outline-none"
          >
            <option value="gemini-3.6-pro">Gemini 3.6 Pro</option>
            <option value="gpt-4o">OpenAI GPT-4o</option>
            <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            <option value="llama-3.3-70b">Groq Llama 3.3 70B</option>
            <option value="deepseek-r1">OpenRouter DeepSeek R1</option>
            <option value="ollama-local-llama3">Ollama Local Llama 3</option>
          </select>

          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl bg-surface border border-border text-text-secondary hover:text-white"
            title="Clear Chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-text-secondary">
            <Sparkles className="h-10 w-10 text-primary-light opacity-40 animate-pulse" />
            <h3 className="text-base font-bold text-white">Start Multi-Provider AI OS Chat</h3>
            <p className="text-xs max-w-sm">
              Real-time SSE token streaming across Gemini, OpenAI, Claude, Groq, DeepSeek, and Ollama.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`max-w-2xl space-y-2 ${m.role === "user" ? "text-right" : "text-left"}`}>
                <div className="text-[10px] text-text-muted font-mono mb-1">
                  {m.role === "user" ? "You" : "AI Swarm Architect"} &bull;{" "}
                  {new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-white shadow-md inline-block text-left"
                      : "bg-surface border border-border text-white space-y-3"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content || (isTyping && m.role === "assistant" ? "..." : "")}</p>

                  {m.code_snippet && (
                    <div className="relative rounded-xl bg-black/60 border border-border p-3 font-mono text-[11px] text-primary-light overflow-x-auto">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(m.code_snippet!);
                          setCopiedId(m.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="absolute top-2 right-2 p-1 rounded bg-surface border border-border text-text-secondary hover:text-white"
                      >
                        {copiedId === m.id ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                      </button>
                      <pre>{m.code_snippet}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-text-secondary font-mono animate-pulse">
            <Cpu className="h-4 w-4 text-emerald-400 animate-spin" />
            <span>{streamingStatus || "Streaming AI tokens..."}</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-border bg-surface-subtle flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Swarm across Gemini, OpenAI, Claude, Groq, DeepSeek, or Ollama..."
          className="flex-1 px-4 py-3 rounded-xl glass-input text-xs"
        />
        <Button type="submit" variant="glow" icon={<Send className="h-4 w-4" />}>
          Send
        </Button>
      </form>
    </div>
  );
};
