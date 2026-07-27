import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AgentService } from "@/lib/services/agent.service";
import { validateUpdateAgent } from "@/lib/validation/agent";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
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

    const agent = await AgentService.getAgentById(user.id, agentId);

    return apiSuccessResponse(agent, 200);
  } catch (err: any) {
    if (err?.message === "AGENT_NOT_FOUND") {
      return apiErrorResponse("Agent not found or access denied.", 404);
    }
    logger.error("GET /api/agents/[id] error", err);
    return apiErrorResponse(err?.message || "Internal server error.", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
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
    const validation = validateUpdateAgent(body);

    if (!validation.valid || !validation.data) {
      return apiErrorResponse(validation.error || "Invalid agent update payload.", 400);
    }

    const updated = await AgentService.updateAgent(user.id, agentId, validation.data);

    return apiSuccessResponse(updated, 200);
  } catch (err: any) {
    if (err?.message === "AGENT_NOT_FOUND") {
      return apiErrorResponse("Agent not found or access denied.", 404);
    }
    logger.error("PATCH /api/agents/[id] error", err);
    return apiErrorResponse(err?.message || "Internal server error.", 500);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
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

    const result = await AgentService.deleteAgent(user.id, agentId);

    return apiSuccessResponse(result, 200);
  } catch (err: any) {
    if (err?.message === "AGENT_NOT_FOUND") {
      return apiErrorResponse("Agent not found or access denied.", 404);
    }
    logger.error("DELETE /api/agents/[id] error", err);
    return apiErrorResponse(err?.message || "Internal server error.", 500);
  }
}
