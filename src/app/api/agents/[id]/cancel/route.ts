import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AgentService } from "@/lib/services/agent.service";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
  POST /api/agents/[id]/cancel
  Cancels a running subagent execution.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: agentId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return apiErrorResponse("Authentication required.", 401);
    }

    const body = await request.json();
    const runId = typeof body?.run_id === "string" ? body.run_id : "";

    if (!runId) {
      return apiErrorResponse("run_id is required.", 400);
    }

    const cancelledRun = await AgentService.cancelExecution(user.id, agentId, runId);

    return apiSuccessResponse(cancelledRun, 200);
  } catch (err: any) {
    logger.error("POST /api/agents/[id]/cancel error", err);
    return apiErrorResponse(err?.message || "Internal server error while cancelling agent run.", 500);
  }
}
