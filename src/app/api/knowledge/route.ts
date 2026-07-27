import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { KnowledgeService } from "@/lib/services/knowledge.service";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

/**
  GET /api/knowledge?workspace_id=uuid
  Lists all knowledge documents in a workspace.
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
    const workspaceId = searchParams.get("workspace_id");

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

    const docs = await KnowledgeService.getDocuments(user.id, wsId);

    return apiSuccessResponse(docs, 200);
  } catch (err: any) {
    logger.error("GET /api/knowledge error", err);
    return apiErrorResponse(err?.message || "Internal server error while fetching knowledge documents.", 500);
  }
}
