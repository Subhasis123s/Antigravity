import { NextResponse } from "next/server";
import { apiSuccessResponse } from "@/lib/api-response";

/**
  GET /api/docs
  Generates OpenAPI 3.0.3 documentation specification for all Antigravity AI OS backend endpoints.
 */
export async function GET() {
  const openApiSpec = {
    openapi: "3.0.3",
    info: {
      title: "Antigravity AI Operating System REST & SSE API Engine",
      version: "5.0.0",
      description: "Production Enterprise AI OS Backend APIs supporting multi-provider AI swarms, vector RAG vault, SSE streaming, encrypted secrets, observability telemetry, and background worker queues.",
      contact: { name: "Antigravity Engineering Team", email: "engineering@antigravity.ai" },
    },
    servers: [{ url: "http://localhost:3000/api", description: "Local Development Server" }],
    paths: {
      "/auth/session": { get: { summary: "Fetch current user session" } },
      "/workspace": { get: { summary: "Fetch active user workspace" } },
      "/projects": { get: { summary: "List workspace projects" }, post: { summary: "Create new project" } },
      "/agents": { get: { summary: "List AI subagent swarms" }, post: { summary: "Deploy AI subagent" } },
      "/agents/{id}/run": { post: { summary: "Execute subagent run" } },
      "/agents/{id}/stream": { post: { summary: "Real-time SSE streaming subagent run" } },
      "/knowledge": { get: { summary: "List knowledge base documents" } },
      "/knowledge/upload": { post: { summary: "Upload and embed document into vector vault" } },
      "/knowledge/query": { post: { summary: "Vector similarity cosine search RAG" } },
      "/chat": { get: { summary: "List chat sessions & history" }, post: { summary: "Send AI chat prompt" } },
      "/chat/stream": { post: { summary: "Real-time SSE token streaming AI response" } },
      "/secrets": { get: { summary: "List workspace secret hints" }, post: { summary: "Encrypt API credential" }, delete: { summary: "Delete API secret" } },
      "/jobs": { get: { summary: "List background queue jobs" }, post: { summary: "Enqueue background job" } },
      "/observability/metrics": { get: { summary: "Fetch latency, tokens, cost, & provider health telemetry" } },
    },
  };

  return NextResponse.json(openApiSpec, { status: 200 });
}
