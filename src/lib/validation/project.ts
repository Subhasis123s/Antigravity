import {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryParams,
  ProjectVisibility,
  ProjectStatus,
} from "@/types/project";
import { sanitizeInput } from "@/lib/security";

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  error?: string;
}

const ALLOWED_VISIBILITIES: ProjectVisibility[] = ["private", "workspace", "public"];
const ALLOWED_STATUSES: ProjectStatus[] = ["active", "paused", "completed", "archived"];

/**
  Formats strings into URL-safe slugs.
 */
export function generateSlug(input: string): string {
  if (!input) return "project-" + Math.random().toString(36).substring(2, 8);
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);
}

/**
  Validates input for project creation.
 */
export function validateCreateProject(body: unknown): ValidationResult<CreateProjectInput> {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid JSON request payload." };
  }

  const payload = body as Record<string, unknown>;

  const workspace_id = typeof payload.workspace_id === "string" ? payload.workspace_id.trim() : "";
  if (!workspace_id || workspace_id.length < 10) {
    return { valid: false, error: "Valid workspace_id is required." };
  }

  const name = typeof payload.name === "string" ? sanitizeInput(payload.name) : "";
  if (!name || name.length < 2) {
    return { valid: false, error: "Project name must be at least 2 characters long." };
  }
  if (name.length > 80) {
    return { valid: false, error: "Project name cannot exceed 80 characters." };
  }

  const description = typeof payload.description === "string" ? sanitizeInput(payload.description) : "";
  if (description.length > 500) {
    return { valid: false, error: "Description cannot exceed 500 characters." };
  }

  const rawSlug = typeof payload.slug === "string" ? payload.slug : name;
  const slug = generateSlug(rawSlug);

  const icon = typeof payload.icon === "string" ? sanitizeInput(payload.icon) : "folder";
  const emoji = typeof payload.emoji === "string" ? sanitizeInput(payload.emoji) : "🚀";
  const color = typeof payload.color === "string" && /^#[0-9A-Fa-f]{6}$/.test(payload.color) ? payload.color : "#6E56CF";

  const visibility: ProjectVisibility =
    typeof payload.visibility === "string" && ALLOWED_VISIBILITIES.includes(payload.visibility as ProjectVisibility)
      ? (payload.visibility as ProjectVisibility)
      : "private";

  const status: ProjectStatus =
    typeof payload.status === "string" && ALLOWED_STATUSES.includes(payload.status as ProjectStatus)
      ? (payload.status as ProjectStatus)
      : "active";

  return {
    valid: true,
    data: {
      workspace_id,
      name,
      slug,
      description,
      icon,
      emoji,
      color,
      visibility,
      status,
      ...(typeof payload.cover_image === "string" ? { cover_image: payload.cover_image } : {}),
    },
  };
}

/**
  Validates input for project updates.
 */
export function validateUpdateProject(body: unknown): ValidationResult<UpdateProjectInput> {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid JSON request payload." };
  }

  const payload = body as Record<string, unknown>;
  const updates: UpdateProjectInput = {};

  if (typeof payload.name === "string") {
    const cleanName = sanitizeInput(payload.name);
    if (cleanName.length < 2 || cleanName.length > 80) {
      return { valid: false, error: "Project name must be between 2 and 80 characters." };
    }
    updates.name = cleanName;
    if (!payload.slug) {
      updates.slug = generateSlug(cleanName);
    }
  }

  if (typeof payload.slug === "string") {
    updates.slug = generateSlug(payload.slug);
  }

  if (typeof payload.description === "string") {
    const cleanDesc = sanitizeInput(payload.description);
    if (cleanDesc.length > 500) {
      return { valid: false, error: "Description cannot exceed 500 characters." };
    }
    updates.description = cleanDesc;
  }

  if (typeof payload.icon === "string") {
    updates.icon = sanitizeInput(payload.icon);
  }

  if (typeof payload.emoji === "string") {
    updates.emoji = sanitizeInput(payload.emoji);
  }

  if (typeof payload.color === "string") {
    if (!/^#[0-9A-Fa-f]{6}$/.test(payload.color)) {
      return { valid: false, error: "Color must be a valid hex code (e.g. #6E56CF)." };
    }
    updates.color = payload.color;
  }

  if (typeof payload.visibility === "string") {
    if (!ALLOWED_VISIBILITIES.includes(payload.visibility as ProjectVisibility)) {
      return { valid: false, error: `Visibility must be one of: ${ALLOWED_VISIBILITIES.join(", ")}` };
    }
    updates.visibility = payload.visibility as ProjectVisibility;
  }

  if (typeof payload.status === "string") {
    if (!ALLOWED_STATUSES.includes(payload.status as ProjectStatus)) {
      return { valid: false, error: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}` };
    }
    updates.status = payload.status as ProjectStatus;
  }

  if (typeof payload.favorite === "boolean") {
    updates.favorite = payload.favorite;
  }

  if (typeof payload.pinned === "boolean") {
    updates.pinned = payload.pinned;
  }

  if (typeof payload.archived === "boolean") {
    updates.archived = payload.archived;
  }

  return { valid: true, data: updates };
}

/**
  Parses and validates query parameters for project lists.
 */
export function parseProjectQueryParams(urlParams: URLSearchParams): ProjectQueryParams {
  const page = Math.max(1, parseInt(urlParams.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(urlParams.get("limit") || "20", 10) || 20));

  const sortByRaw = urlParams.get("sortBy");
  const sortBy = ["created_at", "updated_at", "name"].includes(sortByRaw || "")
    ? (sortByRaw as "created_at" | "updated_at" | "name")
    : "created_at";

  const sortOrder = urlParams.get("sortOrder") === "asc" ? "asc" : "desc";

  return {
    workspace_id: urlParams.get("workspace_id") || undefined,
    search: urlParams.get("search") ? sanitizeInput(urlParams.get("search")!) : undefined,
    status: ALLOWED_STATUSES.includes(urlParams.get("status") as ProjectStatus)
      ? (urlParams.get("status") as ProjectStatus)
      : undefined,
    visibility: ALLOWED_VISIBILITIES.includes(urlParams.get("visibility") as ProjectVisibility)
      ? (urlParams.get("visibility") as ProjectVisibility)
      : undefined,
    favorite: urlParams.has("favorite") ? urlParams.get("favorite") === "true" : undefined,
    pinned: urlParams.has("pinned") ? urlParams.get("pinned") === "true" : undefined,
    archived: urlParams.has("archived") ? urlParams.get("archived") === "true" : undefined,
    sortBy,
    sortOrder,
    page,
    limit,
  };
}
