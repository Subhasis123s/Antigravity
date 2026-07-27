import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { KnowledgeService } from "@/lib/services/knowledge.service";
import { validateSemanticQuery } from "@/lib/validation/knowledge";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

/**
  POST /api/knowledge/query
  Performs vector similarity search across indexed document chunks.
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
    const validation = validateSemanticQuery(body);

    if (!validation.valid || !validation.data) {
      return apiErrorResponse(validation.error || "Invalid search query.", 400);
    }

    const results = await KnowledgeService.semanticSearch(user.id, validation.data);

    return apiSuccessResponse(results, 200);
  } catch (err: any) {
    logger.error("POST /api/knowledge/query error", err);
    return apiErrorResponse(err?.message || "Internal server error while executing semantic search.", 500);
  }
}
