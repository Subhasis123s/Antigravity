import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { KnowledgeService } from "@/lib/services/knowledge.service";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
  DELETE /api/knowledge/[id]
  Deletes a knowledge document and its vector chunks.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id: documentId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return apiErrorResponse("Authentication required.", 401);
    }

    const result = await KnowledgeService.deleteDocument(user.id, documentId);

    return apiSuccessResponse(result, 200);
  } catch (err: any) {
    if (err?.message === "DOCUMENT_NOT_FOUND") {
      return apiErrorResponse("Knowledge document not found.", 404);
    }
    logger.error("DELETE /api/knowledge/[id] error", err);
    return apiErrorResponse(err?.message || "Internal server error while deleting document.", 500);
  }
}
