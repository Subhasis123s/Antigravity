"use server";

import { createClient } from "@/lib/supabase/server";
import { validatePasswordStrength, sanitizeInput } from "@/lib/security";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function changePasswordAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized access" };
    }

    const newPassword = (formData.get("new_password") as string) || "";
    const validation = validatePasswordStrength(newPassword);

    if (!validation.valid) {
      return { success: false, error: validation.message };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      logger.error("Failed to change password", error, { userId: user.id });
      return { success: false, error: error.message };
    }

    logger.info("Password updated successfully via Server Action", { userId: user.id });
    return { success: true };
  } catch (err) {
    logger.error("Unhandled changePasswordAction error", err);
    return { success: false, error: "Failed to change password" };
  }
}

export async function updatePreferencesAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized access" };
    }

    const theme = sanitizeInput((formData.get("theme") as string) || "dark");
    const language = sanitizeInput((formData.get("language") as string) || "en");
    const timezone = sanitizeInput((formData.get("timezone") as string) || "UTC");
    const emailNotifications = formData.get("email_notifications") === "on";
    const pushNotifications = formData.get("push_notifications") === "on";
    const marketingEmails = formData.get("marketing_emails") === "on";
    const autoSave = formData.get("auto_save") === "on";

    const { error } = await (supabase.from("user_preferences") as any).upsert(
      {
        user_id: user.id,
        theme,
        language,
        timezone,
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        marketing_emails: marketingEmails,
        auto_save: autoSave,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      logger.error("Failed to update user preferences", error, { userId: user.id });
      return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    logger.error("Unhandled updatePreferencesAction error", err);
    return { success: false, error: "Failed to update preferences" };
  }
}
