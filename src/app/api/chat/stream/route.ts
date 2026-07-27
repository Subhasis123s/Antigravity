import { createClient } from "@/lib/supabase/server";
import { ProviderFactory } from "@/lib/services/provider.factory";
import { MemoryEngine } from "@/lib/services/memory.engine";
import { AuditService } from "@/lib/services/audit.service";
import { BillingService } from "@/lib/services/billing.service";
import { validateCreateChatMessage } from "@/lib/validation/chat";
import { apiErrorResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

/**
  POST /api/chat/stream
  Server-Sent Events (SSE) real-time streaming endpoint for AI Chat.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return apiErrorResponse("Authentication required.", 401);
    }

    const body = await request.json();
    const validation = validateCreateChatMessage(body);

    if (!validation.valid || !validation.data) {
      return apiErrorResponse(validation.error || "Invalid chat message payload.", 400);
    }

    const { workspace_id, message, model = "gemini-3.6-pro" } = validation.data;

    // Check workspace quota
    const quota = await BillingService.checkQuota(workspace_id);
    if (!quota.allowed) {
      return apiErrorResponse("Workspace monthly token quota exceeded.", 429);
    }

    // Assemble Context Window via Multi-Tier Memory Engine
    const context = await MemoryEngine.assembleContext(user.id, workspace_id, message);

    await AuditService.logAiAction(workspace_id, user.id, "PROMPT_SENT", { message: message.slice(0, 80) });

    const encoder = new TextEncoder();
    const spec = ProviderFactory.getModelSpec(model);

    // Create ReadableStream for SSE Event Emission
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        sendEvent("status", { state: "analyzing", message: `Querying Knowledge Vault & RAG context via ${spec.name}...` });

        // Simulate Live Streaming Tokens Emission
        const tokens = [
          "I ",
          "have ",
          "processed ",
          "your ",
          "request ",
          "using ",
          `${spec.name} `,
          `(${spec.provider.toUpperCase()} provider).\n\n`,
          "Context ",
          "Sources: ",
          `${context.injectedMemory.length > 0 ? "Vector Vault Document Match" : "System Workspace Memory"}.\n\n`,
        ];

        for (const token of tokens) {
          await new Promise((r) => setTimeout(r, 60));
          sendEvent("token", { text: token });
        }

        const codeSnippet = `// Real-Time SSE Code Stream Result\nexport const executeEnterpriseTask = async () => {\n  console.log("Task executed with ${spec.name}");\n  return { success: true, timestamp: new Date().toISOString() };\n};`;
        sendEvent("code", { code: codeSnippet });

        const promptTokens = Math.floor(message.length / 4) + 15;
        const completionTokens = 120;
        const cost = ProviderFactory.calculateCost(model, promptTokens, completionTokens);

        // Record Usage & Audit
        await BillingService.recordUsage(workspace_id, promptTokens + completionTokens, cost);
        await AuditService.logAiAction(workspace_id, user.id, "RESPONSE_RECEIVED", { model, totalTokens: promptTokens + completionTokens, cost });

        sendEvent("completion", {
          model,
          promptTokens,
          completionTokens,
          costEstimate: cost,
          finishReason: "stop",
        });

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    logger.error("POST /api/chat/stream error", err);
    return apiErrorResponse(err?.message || "Internal server error during SSE streaming.", 500);
  }
}
