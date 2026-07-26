import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

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

    let query = supabase.from("projects").select("*").order("created_at", { ascending: false });

    if (workspaceId) {
      query = query.eq("workspace_id", workspaceId);
    }

    const { data: projects, error } = await query;

    if (error) {
      logger.error("Failed to fetch projects", error, { userId: user.id, workspaceId });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, projects });
  } catch (err) {
    logger.error("Unhandled GET /api/projects error", err);
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
    const { workspace_id, name, description, tech_stack, branch } = body;

    if (!workspace_id || typeof workspace_id !== "string" || !name || typeof name !== "string") {
      return NextResponse.json({ success: false, error: "Valid workspace_id and project name are required" }, { status: 400 });
    }

    const newProject = {
      workspace_id: workspace_id.trim(),
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : null,
      tech_stack: typeof tech_stack === "string" ? tech_stack.trim() : null,
      branch: typeof branch === "string" ? branch.trim() : "main",
      status: "Active",
    };

    const { data: project, error } = await (supabase.from("projects") as any)
      .insert(newProject)
      .select()
      .single();

    if (error) {
      logger.error("Failed to insert project", error, { userId: user.id, workspaceId: workspace_id });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    logger.info("Project created successfully", { projectId: project.id, userId: user.id });
    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (err) {
    logger.error("Unhandled POST /api/projects error", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
