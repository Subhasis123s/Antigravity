"use server";

import { createClient } from "@/lib/supabase/server";
import { sanitizeInput } from "@/lib/security";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized access" };
    }

    const fullName = sanitizeInput((formData.get("full_name") as string) || "");
    const username = sanitizeInput((formData.get("username") as string) || "");
    const bio = sanitizeInput((formData.get("bio") as string) || "");
    const language = sanitizeInput((formData.get("language") as string) || "en");
    const timezone = sanitizeInput((formData.get("timezone") as string) || "UTC");

    const { error } = await (supabase.from("profiles") as any)
      .update({
        full_name: fullName,
        username: username || null,
        bio,
        language,
        timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      logger.error("Failed to update profile", error, { userId: user.id });
      return { success: false, error: error.message };
    }

    logger.info("Profile updated via Server Action", { userId: user.id });
    revalidatePath("/dashboard");
    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    logger.error("Unhandled updateProfileAction error", err);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function deleteAccountAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized access" };
    }

    const { error } = await supabase.from("profiles").delete().eq("id", user.id);

    if (error) {
      logger.error("Failed to delete user profile", error, { userId: user.id });
      return { success: false, error: error.message };
    }

    await supabase.auth.signOut();
    logger.info("User account deleted", { userId: user.id });
    return { success: true };
  } catch (err) {
    logger.error("Unhandled deleteAccountAction error", err);
    return { success: false, error: "Failed to delete account" };
  }
}
