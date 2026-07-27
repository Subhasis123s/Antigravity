export type MemoryTier =
  | "short_term"
  | "long_term"
  | "workspace"
  | "agent"
  | "semantic";

export interface MemoryRecord {
  id: string;
  tier: MemoryTier;
  key: string;
  value: Record<string, unknown>;
  importance: number;
  tags?: string[];
  ttlSeconds?: number;
  createdAt: string;
}

export interface ContextWindow {
  maxTokens: number;
  usedTokens: number;
  systemPrompt: string;
  injectedMemory: string[];
  messages: Array<{ role: string; content: string }>;
}
