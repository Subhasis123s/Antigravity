"use server";

import { createClient } from "@/lib/supabase/server";
import { sanitizeInput } from "@/lib/security";
import { verifyWorkspaceAccess } from "@/lib/rbac";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function createWorkspaceAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized access" };
    }

    const name = sanitizeInput((formData.get("name") as string) || "");
    const plan = sanitizeInput((formData.get("plan") as string) || "Pro Workspace");

    if (!name) {
      return { success: false, error: "Workspace name is required" };
    }

    const { data: workspace, error } = await (supabase.from("workspaces") as any)
      .insert({
        name,
        plan,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      logger.error("Failed to create workspace", error, { userId: user.id });
      return { success: false, error: error.message };
    }

    await (supabase.from("workspace_members") as any).insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: "owner",
    });

    logger.info("Workspace created via Server Action", { workspaceId: workspace.id, userId: user.id });
    revalidatePath("/dashboard");
    return { success: true, workspace };
  } catch (err) {
    logger.error("Unhandled createWorkspaceAction error", err);
    return { success: false, error: "Failed to create workspace" };
  }
}

export async function renameWorkspaceAction(workspaceId: string, newName: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized access" };
    }

    const { allowed } = await verifyWorkspaceAccess(supabase, user.id, workspaceId, "manage_workspace");
    if (!allowed) {
      return { success: false, error: "Insufficient permissions to manage workspace" };
    }

    const cleanName = sanitizeInput(newName);
    if (!cleanName) {
      return { success: false, error: "Valid workspace name is required" };
    }

    const { error } = await (supabase.from("workspaces") as any)
      .update({ name: cleanName, updated_at: new Date().toISOString() })
      .eq("id", workspaceId);

    if (error) {
      logger.error("Failed to rename workspace", error, { workspaceId, userId: user.id });
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    logger.error("Unhandled renameWorkspaceAction error", err);
    return { success: false, error: "Failed to rename workspace" };
  }
}

export async function deleteWorkspaceAction(workspaceId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized access" };
    }

    const { allowed } = await verifyWorkspaceAccess(supabase, user.id, workspaceId, "delete_workspace");
    if (!allowed) {
      return { success: false, error: "Only the workspace owner can delete a workspace" };
    }

    const { error } = await supabase.from("workspaces").delete().eq("id", workspaceId);

    if (error) {
      logger.error("Failed to delete workspace", error, { workspaceId, userId: user.id });
      return { success: false, error: error.message };
    }

    logger.info("Workspace deleted via Server Action", { workspaceId, userId: user.id });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    logger.error("Unhandled deleteWorkspaceAction error", err);
    return { success: false, error: "Failed to delete workspace" };
  }
}
