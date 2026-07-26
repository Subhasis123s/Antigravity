import { WorkspaceRole } from "@/types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

export type Permission =
  | "manage_workspace"
  | "delete_workspace"
  | "manage_members"
  | "create_projects"
  | "edit_projects"
  | "delete_projects"
  | "deploy_agents"
  | "manage_api_keys"
  | "view_workspace";

const ROLE_RANK: Record<WorkspaceRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

const PERMISSIONS_MATRIX: Record<Permission, number> = {
  manage_workspace: 4, // Owner only
  delete_workspace: 4, // Owner only
  manage_members: 3,   // Admin or Owner
  manage_api_keys: 3,  // Admin or Owner
  create_projects: 2,  // Editor, Admin, Owner
  edit_projects: 2,    // Editor, Admin, Owner
  deploy_agents: 2,    // Editor, Admin, Owner
  delete_projects: 3,  // Admin or Owner
  view_workspace: 1,   // All members
};

/**
 * Checks if a given role has the required permission.
 */
export function hasPermission(role: WorkspaceRole, permission: Permission): boolean {
  const roleLevel = ROLE_RANK[role] || 0;
  const requiredLevel = PERMISSIONS_MATRIX[permission] || 99;
  return roleLevel >= requiredLevel;
}

/**
 * Retrieves the user's role within a workspace from Supabase.
 */
export async function getUserWorkspaceRole(
  supabase: SupabaseClient,
  userId: string,
  workspaceId: string
): Promise<WorkspaceRole | null> {
  // 1. Check if owner
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .single();

  if (workspace?.owner_id === userId) {
    return "owner";
  }

  // 2. Check membership role
  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .single();

  return (member?.role as WorkspaceRole) || null;
}

/**
 * Verifies if a user has permission for a target workspace.
 */
export async function verifyWorkspaceAccess(
  supabase: SupabaseClient,
  userId: string,
  workspaceId: string,
  requiredPermission: Permission = "view_workspace"
): Promise<{ allowed: boolean; role: WorkspaceRole | null }> {
  const role = await getUserWorkspaceRole(supabase, userId, workspaceId);
  if (!role) {
    return { allowed: false, role: null };
  }

  const allowed = hasPermission(role, requiredPermission);
  return { allowed, role };
}
