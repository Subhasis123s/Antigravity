import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProjectService } from "@/lib/services/project.service";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
  POST /api/projects/[id]/pin
  Toggles pin status for a project.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return apiErrorResponse("Authentication required.", 401);
    }

    const updated = await ProjectService.togglePin(user.id, projectId);

    return apiSuccessResponse(updated, 200);
  } catch (err: any) {
    if (err?.message === "PROJECT_NOT_FOUND") {
      return apiErrorResponse("Project not found or access denied.", 404);
    }
    logger.error("POST /api/projects/[id]/pin error", err);
    return apiErrorResponse(err?.message || "Internal server error while toggling pin.", 500);
  }
}
