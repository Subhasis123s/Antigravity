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

    const { data: preferences, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      logger.error("Failed to fetch preferences", error, { userId: user.id });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, preferences: preferences || {} }, { status: 200 });
  } catch (err) {
    logger.error("Unhandled GET /api/preferences error", err);
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
    const { theme, language, timezone, email_notifications, push_notifications, marketing_emails, auto_save } = body;

    const updatedPreferences = {
      user_id: user.id,
      theme: typeof theme === "string" ? sanitizeInput(theme) : "dark",
      language: typeof language === "string" ? sanitizeInput(language) : "en",
      timezone: typeof timezone === "string" ? sanitizeInput(timezone) : "UTC",
      email_notifications: typeof email_notifications === "boolean" ? email_notifications : true,
      push_notifications: typeof push_notifications === "boolean" ? push_notifications : true,
      marketing_emails: typeof marketing_emails === "boolean" ? marketing_emails : false,
      auto_save: typeof auto_save === "boolean" ? auto_save : true,
      updated_at: new Date().toISOString(),
    };

    const { data: preferences, error } = await (supabase.from("user_preferences") as any)
      .upsert(updatedPreferences, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      logger.error("Failed to update preferences via API", error, { userId: user.id });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    logger.info("User preferences updated via API", { userId: user.id });
    return NextResponse.json({ success: true, preferences }, { status: 200 });
  } catch (err) {
    logger.error("Unhandled PUT /api/preferences error", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
