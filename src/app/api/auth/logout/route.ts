import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.auth.signOut();

    if (user) {
      logger.info("User signed out successfully", { userId: user.id });
    }

    return NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 });
  } catch (err) {
    logger.error("Unhandled POST /api/auth/logout error", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
