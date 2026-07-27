-- ====================================================================
-- ANTIGRAVITY AI WORKSPACE — BACKEND PHASE 3 MIGRATION SCHEMA
-- Production Project Management System: Projects, Members, Activity & Settings
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 1. ENHANCED PROJECTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT DEFAULT '',
    icon TEXT DEFAULT 'folder',
    emoji TEXT DEFAULT '🚀',
    cover_image TEXT,
    color TEXT DEFAULT '#6E56CF',
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'workspace', 'public')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    favorite BOOLEAN DEFAULT false,
    pinned BOOLEAN DEFAULT false,
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_workspace_project_slug UNIQUE (workspace_id, slug)
);

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'folder';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '🚀';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6E56CF';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS favorite BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON public.projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_favorite ON public.projects(favorite);
CREATE INDEX IF NOT EXISTS idx_projects_pinned ON public.projects(pinned);
CREATE INDEX IF NOT EXISTS idx_projects_archived ON public.projects(archived);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- 2. PROJECT MEMBERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'editor' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_project_member UNIQUE (project_id, user_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);

-- --------------------------------------------------------------------
-- 3. PROJECT ACTIVITY LOGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.project_activity ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_project_activity_project_id ON public.project_activity(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_user_id ON public.project_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_created_at ON public.project_activity(created_at DESC);

-- --------------------------------------------------------------------
-- 4. PROJECT SETTINGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
    ai_preferences JSONB DEFAULT '{"model": "gemini-3.6-pro", "auto_agents": true, "temperature": 0.7}'::jsonb,
    visibility TEXT DEFAULT 'private',
    sharing JSONB DEFAULT '{"allow_public_link": false, "require_passcode": false}'::jsonb,
    feature_flags JSONB DEFAULT '{"enable_swarm": true, "enable_vector_rag": true, "enable_cron": true}'::jsonb,
    future_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.project_settings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_project_settings_project_id ON public.project_settings(project_id);

DROP TRIGGER IF EXISTS update_project_settings_updated_at ON public.project_settings;
CREATE TRIGGER update_project_settings_updated_at
    BEFORE UPDATE ON public.project_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES FOR PROJECTS (NON-RECURSIVE)
-- --------------------------------------------------------------------

-- PROJECTS RLS
DROP POLICY IF EXISTS "Users view projects they belong to or own" ON public.projects;
CREATE POLICY "Users view projects they belong to or own" ON public.projects
    FOR SELECT USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = projects.workspace_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Workspace members can insert projects" ON public.projects;
CREATE POLICY "Workspace members can insert projects" ON public.projects
    FOR INSERT WITH CHECK (
        auth.uid() = owner_id AND
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = projects.workspace_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Project owners and admins can update projects" ON public.projects;
CREATE POLICY "Project owners and admins can update projects" ON public.projects
    FOR UPDATE USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = projects.workspace_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS "Project owners can delete projects" ON public.projects;
CREATE POLICY "Project owners can delete projects" ON public.projects
    FOR DELETE USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = projects.workspace_id AND user_id = auth.uid() AND role = 'owner'
        )
    );

-- PROJECT MEMBERS RLS (Non-recursive)
DROP POLICY IF EXISTS "Project members can view membership" ON public.project_members;
CREATE POLICY "Project members can view membership" ON public.project_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_members.project_id AND (
                owner_id = auth.uid() OR
                workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "Project admins can manage members" ON public.project_members;
CREATE POLICY "Project admins can manage members" ON public.project_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_members.project_id AND (
                owner_id = auth.uid() OR
                workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
            )
        )
    );

-- PROJECT ACTIVITY RLS
DROP POLICY IF EXISTS "Project members can view activity" ON public.project_activity;
CREATE POLICY "Project members can view activity" ON public.project_activity
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_activity.project_id AND (
                owner_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = projects.workspace_id AND user_id = auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "Project members can insert activity" ON public.project_activity;
CREATE POLICY "Project members can insert activity" ON public.project_activity
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- PROJECT SETTINGS RLS
DROP POLICY IF EXISTS "Project members can view settings" ON public.project_settings;
CREATE POLICY "Project members can view settings" ON public.project_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_settings.project_id AND (
                owner_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = projects.workspace_id AND user_id = auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "Project admins can update settings" ON public.project_settings;
CREATE POLICY "Project admins can update settings" ON public.project_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_settings.project_id AND (
                owner_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = projects.workspace_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
            )
        )
    );

-- --------------------------------------------------------------------
-- 6. AUTOMATED DEFAULT PROJECT SETTINGS TRIGGER
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_project_defaults()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.project_settings (project_id, visibility)
    VALUES (NEW.id, NEW.visibility)
    ON CONFLICT (project_id) DO NOTHING;

    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner')
    ON CONFLICT (project_id, user_id) DO NOTHING;

    INSERT INTO public.project_activity (project_id, user_id, action, metadata)
    VALUES (
        NEW.id,
        NEW.owner_id,
        'PROJECT_CREATED',
        jsonb_build_object('name', NEW.name, 'slug', NEW.slug, 'visibility', NEW.visibility)
    );

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_project_defaults exception: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_project_created ON public.projects;
CREATE TRIGGER on_project_created
    AFTER INSERT ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_project_defaults();
