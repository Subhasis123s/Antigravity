import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProjectService } from "@/lib/services/project.service";
import { validateUpdateProject } from "@/lib/validation/project";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
  GET /api/projects/[id]
  Retrieves single project details, settings, and membership.
 */
export async function GET(request: Request, { params }: RouteParams) {
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

    const project = await ProjectService.getProjectById(user.id, projectId);

    return apiSuccessResponse(project, 200);
  } catch (err: any) {
    if (err?.message === "PROJECT_NOT_FOUND") {
      return apiErrorResponse("Project not found or access denied.", 404);
    }
    logger.error("GET /api/projects/[id] error", err);
    return apiErrorResponse(err?.message || "Internal server error while fetching project.", 500);
  }
}

/**
  PATCH /api/projects/[id]
  Updates metadata or settings for an existing project.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
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

    const body = await request.json();
    const validation = validateUpdateProject(body);

    if (!validation.valid || !validation.data) {
      return apiErrorResponse(validation.error || "Invalid project update payload.", 400);
    }

    const updated = await ProjectService.updateProject(user.id, projectId, validation.data);

    return apiSuccessResponse(updated, 200);
  } catch (err: any) {
    if (err?.message === "PROJECT_NOT_FOUND") {
      return apiErrorResponse("Project not found or access denied.", 404);
    }
    logger.error("PATCH /api/projects/[id] error", err);
    return apiErrorResponse(err?.message || "Internal server error while updating project.", 500);
  }
}

/**
  DELETE /api/projects/[id]
  Deletes a project permanently.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
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

    const result = await ProjectService.deleteProject(user.id, projectId);

    return apiSuccessResponse(result, 200);
  } catch (err: any) {
    if (err?.message === "PROJECT_NOT_FOUND") {
      return apiErrorResponse("Project not found or access denied.", 404);
    }
    logger.error("DELETE /api/projects/[id] error", err);
    return apiErrorResponse(err?.message || "Internal server error while deleting project.", 500);
  }
}
