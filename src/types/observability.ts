export interface ObservabilityMetrics {
  workspaceId: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalCost: number;
  totalRequests: number;
  activeAgentsCount: number;
  indexedDocumentsCount: number;
  storageBytesUsed: number;
  averageLatencyMs: number;
  errorRatePercentage: number;
  periodStart: string;
  periodEnd: string;
}

export interface WorkspaceQuota {
  workspaceId: string;
  plan: string;
  monthlyTokenLimit: number;
  tokensUsedThisMonth: number;
  storageLimitBytes: number;
  storageBytesUsed: number;
  maxAgentsAllowed: number;
  activeAgentsCount: number;
}
