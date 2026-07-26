import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail, validatePasswordStrength, sanitizeInput } from "@/lib/security";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "Valid email address is required" }, { status: 400 });
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ success: false, error: passwordValidation.message }, { status: 400 });
    }

    const cleanFullName = sanitizeInput(full_name || email.split("@")[0]);
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: cleanFullName,
        },
      },
    });

    if (error) {
      logger.error("Signup failed", error, { email });
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    logger.info("User registered successfully", { userId: data.user?.id, email });
    return NextResponse.json({ success: true, user: data.user }, { status: 201 });
  } catch (err) {
    logger.error("Unhandled POST /api/auth/signup error", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
