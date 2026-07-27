import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { KnowledgeService } from "@/lib/services/knowledge.service";
import { validateUploadKnowledge } from "@/lib/validation/knowledge";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

/**
  POST /api/knowledge/upload
  Uploads a document, chunks text, and generates vector embeddings.
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
    const validation = validateUploadKnowledge(body);

    if (!validation.valid || !validation.data) {
      return apiErrorResponse(validation.error || "Invalid document payload.", 400);
    }

    const doc = await KnowledgeService.uploadDocument(user.id, validation.data);

    return apiSuccessResponse(doc, 201);
  } catch (err: any) {
    logger.error("POST /api/knowledge/upload error", err);
    return apiErrorResponse(err?.message || "Internal server error while uploading knowledge document.", 500);
  }
}
