import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Failed to fetch workspaces", error, { userId: user.id });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, workspaces });
  } catch (err) {
    logger.error("Unhandled GET /api/workspaces error", err);
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
    const { name, plan } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Valid workspace name is required" }, { status: 400 });
    }

    const newWorkspace = {
      name: name.trim(),
      plan: typeof plan === "string" ? plan : "Pro Workspace",
      owner_id: user.id,
    };

    const { data: workspace, error } = await (supabase.from("workspaces") as any)
      .insert(newWorkspace)
      .select()
      .single();

    if (error) {
      logger.error("Failed to insert workspace", error, { userId: user.id });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    logger.info("Workspace created successfully", { workspaceId: workspace.id, userId: user.id });
    return NextResponse.json({ success: true, workspace }, { status: 201 });
  } catch (err) {
    logger.error("Unhandled POST /api/workspaces error", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
