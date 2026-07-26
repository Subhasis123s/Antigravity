import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspace_id");

    let query = supabase.from("api_keys").select("id, workspace_id, name, prefix, created_at, last_used_at").order("created_at", { ascending: false });

    if (workspaceId) {
      query = query.eq("workspace_id", workspaceId);
    }

    const { data: apiKeys, error } = await query;

    if (error) {
      logger.error("Failed to fetch API keys", error, { userId: user.id, workspaceId });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, apiKeys });
  } catch (err) {
    logger.error("Unhandled GET /api/api-keys error", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const { workspace_id, name } = body;

    if (!workspace_id || typeof workspace_id !== "string" || !name || typeof name !== "string") {
      return NextResponse.json({ success: false, error: "Valid workspace_id and key name are required" }, { status: 400 });
    }

    const randomSecret = crypto.randomBytes(24).toString("hex");
    const fullKey = `ag_live_${randomSecret}`;
    const keyHash = crypto.createHash("sha256").update(fullKey).digest("hex");

    const newApiKey = {
      workspace_id: workspace_id.trim(),
      name: name.trim(),
      prefix: "ag_live_",
      key_hash: keyHash,
    };

    const { data: apiKey, error } = await (supabase.from("api_keys") as any)
      .insert(newApiKey)
      .select("id, workspace_id, name, prefix, created_at")
      .single();

    if (error) {
      logger.error("Failed to generate API key", error, { userId: user.id, workspaceId: workspace_id });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    logger.info("API Key created successfully", { apiKeyId: apiKey.id, userId: user.id });

    return NextResponse.json(
      {
        success: true,
        apiKey: {
          ...apiKey,
          secretKey: fullKey,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    logger.error("Unhandled POST /api/api-keys error", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
