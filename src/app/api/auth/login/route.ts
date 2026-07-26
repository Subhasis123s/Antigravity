import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/security";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !isValidEmail(email) || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.session) {
      logger.warn("Login failed invalid credentials", { email });
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    logger.info("User logged in successfully", { userId: data.user.id, email });
    return NextResponse.json({ success: true, session: data.session, user: data.user }, { status: 200 });
  } catch (err) {
    logger.error("Unhandled POST /api/auth/login error", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
