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
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: workspaces } = await supabase
      .from("workspaces")
      .select("*")
      .order("created_at", { ascending: false });

    return NextResponse.json(
      {
        authenticated: true,
        user,
        profile,
        workspaces: workspaces || [],
      },
      { status: 200 }
    );
  } catch (err) {
    logger.error("Unhandled GET /api/auth/session error", err);
    return NextResponse.json({ authenticated: false, error: "Internal server error" }, { status: 500 });
  }
}
