import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProjectService } from "@/lib/services/project.service";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { sanitizeInput } from "@/lib/security";
import { logger } from "@/lib/logger";

/**
  GET /api/projects/search?q=query
  Performs full-text and fuzzy search across user accessible projects.
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
    const q = searchParams.get("q") || searchParams.get("query") || "";
    const cleanQuery = sanitizeInput(q.trim());

    if (!cleanQuery || cleanQuery.length < 1) {
      return apiSuccessResponse([], 200);
    }

    const results = await ProjectService.searchProjects(user.id, cleanQuery);

    return apiSuccessResponse(results, 200);
  } catch (err: any) {
    logger.error("GET /api/projects/search error", err);
    return apiErrorResponse(err?.message || "Internal server error while searching projects.", 500);
  }
}
