import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SecretsService } from "@/lib/services/secrets.service";
import { validateCreateSecret } from "@/lib/validation/secret";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

/**
  GET /api/secrets?workspace_id=uuid
  Lists all workspace secret headers and masked key hints.
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

    const secrets = await SecretsService.getSecrets(user.id, wsId);

    return apiSuccessResponse(secrets, 200);
  } catch (err: any) {
    logger.error("GET /api/secrets error", err);
    return apiErrorResponse(err?.message || "Internal server error while fetching secrets.", 500);
  }
}

/**
  POST /api/secrets
  Creates or rotates an encrypted workspace secret key (AES-256-GCM).
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
    const validation = validateCreateSecret(body);

    if (!validation.valid || !validation.data) {
      return apiErrorResponse(validation.error || "Invalid secret input payload.", 400);
    }

    const secret = await SecretsService.createSecret(user.id, validation.data);

    return apiSuccessResponse(secret, 201);
  } catch (err: any) {
    logger.error("POST /api/secrets error", err);
    return apiErrorResponse(err?.message || "Internal server error while creating secret.", 500);
  }
}

/**
  DELETE /api/secrets?id=uuid
  Deletes a workspace secret.
 */
export async function DELETE(request: Request) {
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
    const secretId = searchParams.get("id");

    if (!secretId) {
      return apiErrorResponse("Secret id parameter is required.", 400);
    }

    const result = await SecretsService.deleteSecret(user.id, secretId);

    return apiSuccessResponse(result, 200);
  } catch (err: any) {
    logger.error("DELETE /api/secrets error", err);
    return apiErrorResponse(err?.message || "Internal server error while deleting secret.", 500);
  }
}
