import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProjectService } from "@/lib/services/project.service";
import { validateCreateProject, parseProjectQueryParams } from "@/lib/validation/project";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

/**
  GET /api/projects
  Lists all projects accessible to the authenticated user with filtering, sorting, search, and pagination.
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
    const queryParams = parseProjectQueryParams(searchParams);

    const result = await ProjectService.getProjects(user.id, queryParams);

    return apiSuccessResponse(result, 200);
  } catch (err: any) {
    logger.error("GET /api/projects error", err);
    return apiErrorResponse(err?.message || "Internal server error while fetching projects.", 500);
  }
}

/**
  POST /api/projects
  Creates a new project within a specified workspace.
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
    const validation = validateCreateProject(body);

    if (!validation.valid || !validation.data) {
      return apiErrorResponse(validation.error || "Invalid project input.", 400);
    }

    const newProject = await ProjectService.createProject(user.id, validation.data);

    return apiSuccessResponse(newProject, 201);
  } catch (err: any) {
    logger.error("POST /api/projects error", err);

    if (err?.message === "UNAUTHORIZED_WORKSPACE") {
      return apiErrorResponse("You do not have permission to create projects in this workspace.", 403);
    }

    return apiErrorResponse(err?.message || "Internal server error while creating project.", 500);
  }
}
