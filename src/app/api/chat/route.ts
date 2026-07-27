import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ChatService } from "@/lib/services/chat.service";
import { validateCreateChatMessage } from "@/lib/validation/chat";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

/**
  GET /api/chat?workspace_id=uuid&session_id=uuid
  Lists chat sessions or session messages.
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return apiErrorResponse("Authentication required.", 401);
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const workspaceId = searchParams.get("workspace_id");

    if (sessionId) {
      const messages = await ChatService.getMessages(user.id, sessionId);
      return apiSuccessResponse(messages, 200);
    }

    let wsId = workspaceId;
    if (!wsId) {
      const { data: ws } = await (supabase as any)
        .from("workspaces")
        .select("id")
        .limit(1)
        .single();
      wsId = ws?.id;
    }

    if (!wsId) {
      return apiSuccessResponse([], 200);
    }

    const sessions = await ChatService.getSessions(user.id, wsId);
    return apiSuccessResponse(sessions, 200);
  } catch (err: any) {
    logger.error("GET /api/chat error", err);
    return apiErrorResponse(err?.message || "Internal server error while fetching chat data.", 500);
  }
}

/**
  POST /api/chat
  Sends a prompt message and generates an AI subagent response.
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

    const result = await ChatService.sendMessage(user.id, validation.data);

    return apiSuccessResponse(result, 201);
  } catch (err: any) {
    logger.error("POST /api/chat error", err);
    return apiErrorResponse(err?.message || "Internal server error while sending message.", 500);
  }
}
