import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { JobQueueService } from "@/lib/services/job.queue";
import { validateCreateJob } from "@/lib/validation/job";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

/**
  GET /api/jobs?workspace_id=uuid
  Lists background worker queue jobs for a workspace.
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

    const jobs = await JobQueueService.getJobs(user.id, wsId);

    return apiSuccessResponse(jobs, 200);
  } catch (err: any) {
    logger.error("GET /api/jobs error", err);
    return apiErrorResponse(err?.message || "Internal server error while fetching jobs.", 500);
  }
}

/**
  POST /api/jobs
  Enqueues an asynchronous background processing job.
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
    const validation = validateCreateJob(body);

    if (!validation.valid || !validation.data) {
      return apiErrorResponse(validation.error || "Invalid job input payload.", 400);
    }

    const job = await JobQueueService.enqueueJob(user.id, validation.data);

    // Immediately trigger background execution
    JobQueueService.processJob(job.id).catch((e) =>
      logger.error("[API/jobs] Background execution error", e, { jobId: job.id })
    );

    return apiSuccessResponse(job, 201);
  } catch (err: any) {
    logger.error("POST /api/jobs error", err);
    return apiErrorResponse(err?.message || "Internal server error while enqueuing job.", 500);
  }
}
