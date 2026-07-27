export type AIProviderType =
  | "gemini"
  | "openai"
  | "anthropic"
  | "groq"
  | "openrouter"
  | "ollama";

export interface ModelSpec {
  id: string;
  name: string;
  provider: AIProviderType;
  contextWindow: number;
  maxCompletionTokens: number;
  costPer1kPromptTokens: number;
  costPer1kCompletionTokens: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
}

export interface CompletionRequest {
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

export interface CompletionResponse {
  id: string;
  model: string;
  provider: AIProviderType;
  content: string;
  codeSnippet?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costEstimate: number;
  latencyMs: number;
}

export interface StreamChunk {
  id: string;
  type: "token" | "code" | "completion" | "error";
  text: string;
  finishReason?: string;
}

export interface ProviderHealth {
  providerName: AIProviderType;
  status: "healthy" | "degraded" | "down";
  latencyMs: number;
  errorRate: number;
  lastCheckAt: string;
}
