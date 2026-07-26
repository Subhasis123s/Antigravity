import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/security";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "Valid email address is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${origin}/login?mode=reset_password`,
    });

    if (error) {
      logger.error("Password reset email failed", error, { email });
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    logger.info("Password reset email sent", { email });
    return NextResponse.json({ success: true, message: "Password reset instructions sent to email" }, { status: 200 });
  } catch (err) {
    logger.error("Unhandled POST /api/auth/reset-password error", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
