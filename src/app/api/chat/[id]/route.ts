import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ChatService } from "@/lib/services/chat.service";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
  DELETE /api/chat/[id]
  Deletes a chat session and its history.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return apiErrorResponse("Authentication required.", 401);
    }

    const result = await ChatService.deleteSession(user.id, sessionId);

    return apiSuccessResponse(result, 200);
  } catch (err: any) {
    logger.error("DELETE /api/chat/[id] error", err);
    return apiErrorResponse(err?.message || "Internal server error while deleting session.", 500);
  }
}
