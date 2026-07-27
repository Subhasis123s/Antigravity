import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AgentService } from "@/lib/services/agent.service";
import { validateRunAgent } from "@/lib/validation/agent";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
  POST /api/agents/[id]/run
  Executes an autonomous subagent run with a prompt input.
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
    const validation = validateRunAgent(body);

    if (!validation.valid || !validation.data) {
      return apiErrorResponse(validation.error || "Invalid agent run prompt input.", 400);
    }

    const run = await AgentService.executeAgent(user.id, agentId, validation.data);

    return apiSuccessResponse(run, 200);
  } catch (err: any) {
    logger.error("POST /api/agents/[id]/run error", err);
    return apiErrorResponse(err?.message || "Internal server error while running agent.", 500);
  }
}
