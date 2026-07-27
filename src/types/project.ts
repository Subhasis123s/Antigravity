export type ProjectRole = "owner" | "admin" | "editor" | "viewer";

export type ProjectVisibility = "private" | "workspace" | "public";

export type ProjectStatus = "active" | "paused" | "completed" | "archived";

export interface ProjectSettings {
  id: string;
  project_id: string;
  ai_preferences: {
    model: string;
    auto_agents: boolean;
    temperature: number;
    [key: string]: unknown;
  };
  visibility: ProjectVisibility;
  sharing: {
    allow_public_link: boolean;
    require_passcode: boolean;
    [key: string]: unknown;
  };
  feature_flags: {
    enable_swarm: boolean;
    enable_vector_rag: boolean;
    enable_cron: boolean;
    [key: string]: unknown;
  };
  future_settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export interface ProjectActivity {
  id: string;
  project_id: string;
  user_id?: string;
  action:
    | "PROJECT_CREATED"
    | "PROJECT_UPDATED"
    | "PROJECT_DELETED"
    | "PROJECT_ARCHIVED"
    | "PROJECT_RESTORED"
    | "PROJECT_FAVORITED"
    | "PROJECT_UNFAVORITED"
    | "PROJECT_PINNED"
    | "PROJECT_UNPINNED"
    | "MEMBER_ADDED"
    | "MEMBER_REMOVED"
    | "SETTINGS_CHANGED";
  metadata?: Record<string, unknown>;
  created_at: string;
  user?: {
    id: string;
    email: string;
    display_name?: string;
  };
}

export interface Project {
  id: string;
  workspace_id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  emoji: string;
  cover_image?: string | null;
  color: string;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  favorite: boolean;
  pinned: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
  settings?: ProjectSettings;
  members?: ProjectMember[];
}

export interface CreateProjectInput {
  workspace_id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  emoji?: string;
  cover_image?: string;
  color?: string;
  visibility?: ProjectVisibility;
  status?: ProjectStatus;
}

export interface UpdateProjectInput {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  emoji?: string;
  cover_image?: string | null;
  color?: string;
  visibility?: ProjectVisibility;
  status?: ProjectStatus;
  favorite?: boolean;
  pinned?: boolean;
  archived?: boolean;
  settings?: Partial<ProjectSettings>;
}

export interface ProjectQueryParams {
  workspace_id?: string;
  search?: string;
  status?: ProjectStatus;
  visibility?: ProjectVisibility;
  favorite?: boolean;
  pinned?: boolean;
  archived?: boolean;
  sortBy?: "created_at" | "updated_at" | "name";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
