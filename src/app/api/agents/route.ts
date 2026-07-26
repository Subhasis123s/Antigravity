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

    let query = supabase.from("agents").select("*").order("created_at", { ascending: false });

    if (workspaceId) {
      query = query.eq("workspace_id", workspaceId);
    }

    const { data: agents, error } = await query;

    if (error) {
      logger.error("Failed to fetch agents", error, { userId: user.id, workspaceId });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, agents });
  } catch (err) {
    logger.error("Unhandled GET /api/agents error", err);
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
    const { workspace_id, role, model } = body;

    if (!workspace_id || typeof workspace_id !== "string" || !role || typeof role !== "string") {
      return NextResponse.json({ success: false, error: "Valid workspace_id and role are required" }, { status: 400 });
    }

    const newAgent = {
      workspace_id: workspace_id.trim(),
      role: role.trim(),
      model: typeof model === "string" ? model.trim() : "gemini-3.6-pro",
      status: "Active",
      tasks_completed: 0,
      latency_ms: 0.84,
      memory_used_pct: 20,
    };

    const { data: agent, error } = await (supabase.from("agents") as any)
      .insert(newAgent)
      .select()
      .single();

    if (error) {
      logger.error("Failed to insert agent", error, { userId: user.id, workspaceId: workspace_id });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    logger.info("Agent swarm deployed successfully", { agentId: agent.id, userId: user.id });
    return NextResponse.json({ success: true, agent }, { status: 201 });
  } catch (err) {
    logger.error("Unhandled POST /api/agents error", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
