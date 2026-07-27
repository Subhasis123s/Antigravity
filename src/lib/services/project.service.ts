import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryParams,
  ProjectActivity,
} from "@/types/project";

export class ProjectService {
  /**
    Helper method to audit log project actions to `project_activity` and system logger.
   */
  private static async logActivity(
    supabase: any,
    projectId: string,
    userId: string,
    action: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await (supabase as any).from("project_activity").insert({
        project_id: projectId,
        user_id: userId,
        action,
        metadata,
      });

      logger.info(`[Project Audit] ${action}`, { projectId, userId, metadata });
    } catch (err) {
      logger.error(`[Project Audit Exception] Failed to log action: ${action}`, err, {
        projectId,
        userId,
      });
    }
  }

  /**
    Create a new project connected to a workspace.
   */
  static async createProject(userId: string, input: CreateProjectInput): Promise<Project> {
    const supabase = await createClient();

    // Verify workspace membership
    const { data: member, error: memberErr } = await (supabase as any)
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", input.workspace_id)
      .eq("user_id", userId)
      .single();

    if (memberErr || !member) {
      logger.warn("[ProjectService.createProject] Unauthorized workspace access attempt", {
        userId,
        workspaceId: input.workspace_id,
      });
      throw new Error("UNAUTHORIZED_WORKSPACE");
    }

    // Insert project record
    const { data: project, error: insertErr } = await (supabase as any)
      .from("projects")
      .insert({
        workspace_id: input.workspace_id,
        owner_id: userId,
        name: input.name,
        slug: input.slug,
        description: input.description || "",
        icon: input.icon || "folder",
        emoji: input.emoji || "🚀",
        cover_image: input.cover_image || null,
        color: input.color || "#6E56CF",
        visibility: input.visibility || "private",
        status: input.status || "active",
      })
      .select("*, settings:project_settings(*)")
      .single();

    if (insertErr || !project) {
      logger.error("[ProjectService.createProject] Database insert failed", insertErr, {
        userId,
        input,
      });
      throw new Error(insertErr?.message || "Failed to create project record.");
    }

    return project as Project;
  }

  /**
    Retrieve paginated list of projects accessible to the user.
   */
  static async getProjects(
    userId: string,
    params: ProjectQueryParams
  ): Promise<{ projects: Project[]; total: number; page: number; totalPages: number }> {
    const supabase = await createClient();
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let query = (supabase as any)
      .from("projects")
      .select("*, settings:project_settings(*)", { count: "exact" });

    if (params.workspace_id) {
      query = query.eq("workspace_id", params.workspace_id);
    }

    if (params.status) {
      query = query.eq("status", params.status);
    }

    if (params.visibility) {
      query = query.eq("visibility", params.visibility);
    }

    if (typeof params.favorite === "boolean") {
      query = query.eq("favorite", params.favorite);
    }

    if (typeof params.pinned === "boolean") {
      query = query.eq("pinned", params.pinned);
    }

    if (typeof params.archived === "boolean") {
      query = query.eq("archived", params.archived);
    } else {
      query = query.eq("archived", false);
    }

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    const sortBy = params.sortBy || "created_at";
    const sortOrder = params.sortOrder === "asc";
    query = query.order(sortBy, { ascending: sortOrder });

    query = query.range(offset, offset + limit - 1);

    const { data: projects, count, error } = await query;

    if (error) {
      logger.error("[ProjectService.getProjects] Database query failed", error, { userId, params });
      throw new Error("Failed to fetch projects list.");
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      projects: (projects as Project[]) || [],
      total,
      page,
      totalPages,
    };
  }

  /**
    Retrieve project details by ID with settings and member checks.
   */
  static async getProjectById(userId: string, projectId: string): Promise<Project> {
    const supabase = await createClient();

    const { data: project, error } = await (supabase as any)
      .from("projects")
      .select("*, settings:project_settings(*), members:project_members(*, user:profiles(id, email, full_name, display_name, avatar_url))")
      .eq("id", projectId)
      .single();

    if (error || !project) {
      logger.warn("[ProjectService.getProjectById] Project not found or inaccessible", {
        userId,
        projectId,
        error,
      });
      throw new Error("PROJECT_NOT_FOUND");
    }

    return project as Project;
  }

  /**
    Update project details and settings.
   */
  static async updateProject(
    userId: string,
    projectId: string,
    input: UpdateProjectInput
  ): Promise<Project> {
    const supabase = await createClient();

    const existing = await this.getProjectById(userId, projectId);

    const updatePayload: Record<string, unknown> = {};
    if (input.name !== undefined) updatePayload.name = input.name;
    if (input.slug !== undefined) updatePayload.slug = input.slug;
    if (input.description !== undefined) updatePayload.description = input.description;
    if (input.icon !== undefined) updatePayload.icon = input.icon;
    if (input.emoji !== undefined) updatePayload.emoji = input.emoji;
    if (input.cover_image !== undefined) updatePayload.cover_image = input.cover_image;
    if (input.color !== undefined) updatePayload.color = input.color;
    if (input.visibility !== undefined) updatePayload.visibility = input.visibility;
    if (input.status !== undefined) updatePayload.status = input.status;
    if (input.favorite !== undefined) updatePayload.favorite = input.favorite;
    if (input.pinned !== undefined) updatePayload.pinned = input.pinned;
    if (input.archived !== undefined) updatePayload.archived = input.archived;

    const { data: updated, error } = await (supabase as any)
      .from("projects")
      .update(updatePayload)
      .eq("id", projectId)
      .select("*, settings:project_settings(*)")
      .single();

    if (error || !updated) {
      logger.error("[ProjectService.updateProject] Update failed", error, {
        userId,
        projectId,
        input,
      });
      throw new Error("Failed to update project.");
    }

    if (input.settings) {
      await (supabase as any)
        .from("project_settings")
        .update(input.settings)
        .eq("project_id", projectId);
    }

    await this.logActivity(supabase, projectId, userId, "PROJECT_UPDATED", {
      changes: Object.keys(updatePayload),
      previousName: existing.name,
      newName: (updated as any).name,
    });

    return updated as Project;
  }

  /**
    Archive a project (Soft Delete).
   */
  static async archiveProject(userId: string, projectId: string): Promise<Project> {
    const supabase = await createClient();

    const { data: archived, error } = await (supabase as any)
      .from("projects")
      .update({ archived: true, status: "archived" })
      .eq("id", projectId)
      .select("*, settings:project_settings(*)")
      .single();

    if (error || !archived) {
      logger.error("[ProjectService.archiveProject] Archive failed", error, { userId, projectId });
      throw new Error("Failed to archive project.");
    }

    await this.logActivity(supabase, projectId, userId, "PROJECT_ARCHIVED", {
      name: (archived as any).name,
    });

    return archived as Project;
  }

  /**
    Restore an archived project.
   */
  static async restoreProject(userId: string, projectId: string): Promise<Project> {
    const supabase = await createClient();

    const { data: restored, error } = await (supabase as any)
      .from("projects")
      .update({ archived: false, status: "active" })
      .eq("id", projectId)
      .select("*, settings:project_settings(*)")
      .single();

    if (error || !restored) {
      logger.error("[ProjectService.restoreProject] Restore failed", error, { userId, projectId });
      throw new Error("Failed to restore project.");
    }

    await this.logActivity(supabase, projectId, userId, "PROJECT_RESTORED", {
      name: (restored as any).name,
    });

    return restored as Project;
  }

  /**
    Toggle project favorite status.
   */
  static async toggleFavorite(userId: string, projectId: string): Promise<Project> {
    const current = await this.getProjectById(userId, projectId);
    const newFavorite = !current.favorite;

    const supabase = await createClient();
    const { data: updated, error } = await (supabase as any)
      .from("projects")
      .update({ favorite: newFavorite })
      .eq("id", projectId)
      .select("*, settings:project_settings(*)")
      .single();

    if (error || !updated) {
      throw new Error("Failed to toggle favorite status.");
    }

    await this.logActivity(
      supabase,
      projectId,
      userId,
      newFavorite ? "PROJECT_FAVORITED" : "PROJECT_UNFAVORITED"
    );

    return updated as Project;
  }

  /**
    Toggle project pin status.
   */
  static async togglePin(userId: string, projectId: string): Promise<Project> {
    const current = await this.getProjectById(userId, projectId);
    const newPin = !current.pinned;

    const supabase = await createClient();
    const { data: updated, error } = await (supabase as any)
      .from("projects")
      .update({ pinned: newPin })
      .eq("id", projectId)
      .select("*, settings:project_settings(*)")
      .single();

    if (error || !updated) {
      throw new Error("Failed to toggle pin status.");
    }

    await this.logActivity(
      supabase,
      projectId,
      userId,
      newPin ? "PROJECT_PINNED" : "PROJECT_UNPINNED"
    );

    return updated as Project;
  }

  /**
    Permanently delete a project (Hard Delete).
   */
  static async deleteProject(userId: string, projectId: string): Promise<{ success: boolean }> {
    const supabase = await createClient();
    const project = await this.getProjectById(userId, projectId);

    const { error } = await (supabase as any).from("projects").delete().eq("id", projectId);

    if (error) {
      logger.error("[ProjectService.deleteProject] Delete failed", error, { userId, projectId });
      throw new Error("Failed to delete project.");
    }

    logger.info("[ProjectService.deleteProject] Project deleted", {
      userId,
      projectId,
      name: project.name,
    });

    return { success: true };
  }

  /**
    Search projects across user workspaces.
   */
  static async searchProjects(userId: string, queryText: string): Promise<Project[]> {
    const supabase = await createClient();

    const { data: projects, error } = await (supabase as any)
      .from("projects")
      .select("*, settings:project_settings(*)")
      .or(`name.ilike.%${queryText}%,description.ilike.%${queryText}%,slug.ilike.%${queryText}%`)
      .order("updated_at", { ascending: false })
      .limit(30);

    if (error) {
      logger.error("[ProjectService.searchProjects] Search query failed", error, {
        userId,
        queryText,
      });
      throw new Error("Failed to perform project search.");
    }

    return (projects as Project[]) || [];
  }

  /**
    Retrieve audit trail activity for a project.
   */
  static async getProjectActivity(userId: string, projectId: string): Promise<ProjectActivity[]> {
    const supabase = await createClient();

    await this.getProjectById(userId, projectId);

    const { data: activity, error } = await (supabase as any)
      .from("project_activity")
      .select("*, user:profiles(id, email, display_name)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      logger.error("[ProjectService.getProjectActivity] Query failed", error, {
        userId,
        projectId,
      });
      throw new Error("Failed to fetch project activity audit trail.");
    }

    return (activity as ProjectActivity[]) || [];
  }
}
