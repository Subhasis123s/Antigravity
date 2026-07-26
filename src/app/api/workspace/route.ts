import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeInput } from "@/lib/security";
import { verifyWorkspaceAccess } from "@/lib/rbac";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const { data: workspaces, error } = await supabase
      .from("workspaces")
      .select("*, workspace_members(role)")
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Failed to fetch workspaces via API", error, { userId: user.id });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, workspaces }, { status: 200 });
  } catch (err) {
    logger.error("Unhandled GET /api/workspace error", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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
    const { workspace_id, name, plan, settings } = body;

    if (!workspace_id || typeof workspace_id !== "string") {
      return NextResponse.json({ success: false, error: "workspace_id is required" }, { status: 400 });
    }

    const { allowed } = await verifyWorkspaceAccess(supabase, user.id, workspace_id, "manage_workspace");
    if (!allowed) {
      return NextResponse.json({ success: false, error: "Insufficient permissions to update workspace" }, { status: 403 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof name === "string" && name.trim()) {
      updates.name = sanitizeInput(name);
    }
    if (typeof plan === "string" && plan.trim()) {
      updates.plan = sanitizeInput(plan);
    }
    if (settings && typeof settings === "object") {
      updates.settings = settings;
    }

    const { data: workspace, error } = await (supabase.from("workspaces") as any)
      .update(updates)
      .eq("id", workspace_id)
      .select()
      .single();

    if (error) {
      logger.error("Failed to update workspace via API", error, { workspaceId: workspace_id, userId: user.id });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    logger.info("Workspace updated via API", { workspaceId: workspace_id, userId: user.id });
    return NextResponse.json({ success: true, workspace }, { status: 200 });
  } catch (err) {
    logger.error("Unhandled PATCH /api/workspace error", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: "workspace_id parameter is required" }, { status: 400 });
    }

    const { allowed } = await verifyWorkspaceAccess(supabase, user.id, workspaceId, "delete_workspace");
    if (!allowed) {
      return NextResponse.json({ success: false, error: "Only the workspace owner can delete a workspace" }, { status: 403 });
    }

    const { error } = await supabase.from("workspaces").delete().eq("id", workspaceId);

    if (error) {
      logger.error("Failed to delete workspace via API", error, { workspaceId, userId: user.id });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    logger.info("Workspace deleted via API", { workspaceId, userId: user.id });
    return NextResponse.json({ success: true, message: "Workspace deleted successfully" }, { status: 200 });
  } catch (err) {
    logger.error("Unhandled DELETE /api/workspace error", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
