import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProjectService } from "@/lib/services/project.service";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
  POST /api/projects/[id]/archive
  Archives a project.
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

    const archived = await ProjectService.archiveProject(user.id, projectId);

    return apiSuccessResponse(archived, 200);
  } catch (err: any) {
    if (err?.message === "PROJECT_NOT_FOUND") {
      return apiErrorResponse("Project not found or access denied.", 404);
    }
    logger.error("POST /api/projects/[id]/archive error", err);
    return apiErrorResponse(err?.message || "Internal server error while archiving project.", 500);
  }
}
