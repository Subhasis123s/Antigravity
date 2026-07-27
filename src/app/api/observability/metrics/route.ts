import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ObservabilityService } from "@/lib/services/observability.service";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

/**
  GET /api/observability/metrics?workspace_id=uuid
  Fetches telemetry metrics, storage usage, costs, and AI provider health status.
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
      return apiErrorResponse("Workspace not found.", 404);
    }

    const metrics = await ObservabilityService.getWorkspaceMetrics(user.id, wsId);
    const quota = await ObservabilityService.getWorkspaceQuota(user.id, wsId);
    const providerHealth = ObservabilityService.getProviderHealth();

    return apiSuccessResponse(
      {
        metrics,
        quota,
        providerHealth,
      },
      200
    );
  } catch (err: any) {
    logger.error("GET /api/observability/metrics error", err);
    return apiErrorResponse(err?.message || "Internal server error while fetching observability metrics.", 500);
  }
}
