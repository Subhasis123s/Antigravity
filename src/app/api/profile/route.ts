import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeInput } from "@/lib/security";
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

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      logger.error("Failed to fetch user profile", error, { userId: user.id });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile }, { status: 200 });
  } catch (err) {
    logger.error("Unhandled GET /api/profile error", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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
    const { full_name, username, bio, language, timezone, theme, avatar_url } = body;

    const updatedData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof full_name === "string") updatedData.full_name = sanitizeInput(full_name);
    if (typeof username === "string") updatedData.username = sanitizeInput(username);
    if (typeof bio === "string") updatedData.bio = sanitizeInput(bio);
    if (typeof language === "string") updatedData.language = sanitizeInput(language);
    if (typeof timezone === "string") updatedData.timezone = sanitizeInput(timezone);
    if (typeof theme === "string") updatedData.theme = sanitizeInput(theme);
    if (typeof avatar_url === "string") updatedData.avatar_url = avatar_url.trim();

    const { data: profile, error } = await (supabase.from("profiles") as any)
      .update(updatedData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      logger.error("Failed to update profile via API", error, { userId: user.id });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    logger.info("Profile updated via API", { userId: user.id });
    return NextResponse.json({ success: true, profile }, { status: 200 });
  } catch (err) {
    logger.error("Unhandled PUT /api/profile error", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
