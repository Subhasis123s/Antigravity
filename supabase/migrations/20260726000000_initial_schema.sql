-- ====================================================================
-- ANTIGRAVITY AI WORKSPACE — PRODUCTION SUPABASE DATABASE SCHEMA
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. AUTOMATED UPDATED_AT TRIGGER FUNCTION
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------
-- 2. PROFILES TABLE (Linked to auth.users)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    provider TEXT DEFAULT 'email',
    role TEXT DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- 3. WORKSPACES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'Pro Workspace',
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{"auto_save": true, "auto_sync": true, "theme": "dark"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON public.workspaces(owner_id);

CREATE TRIGGER update_workspaces_updated_at
    BEFORE UPDATE ON public.workspaces
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- 4. WORKSPACE MEMBERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);

CREATE POLICY "Users can view workspaces they belong to"
    ON public.workspaces FOR SELECT
    USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = workspaces.id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update their workspace"
    ON public.workspaces FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Members can view workspace membership"
    ON public.workspace_members FOR SELECT
    USING (user_id = auth.uid());

-- --------------------------------------------------------------------
-- 5. PROJECTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT,
    branch TEXT DEFAULT 'main',
    status TEXT DEFAULT 'Active',
    assigned_agents INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON public.projects(workspace_id);

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Members can access workspace projects"
    ON public.projects FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = projects.workspace_id AND user_id = auth.uid()
        )
    );

-- --------------------------------------------------------------------
-- 6. AGENTS TABLE (Subagent Swarm Instances)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    model TEXT NOT NULL DEFAULT 'gemini-3.6-pro',
    status TEXT DEFAULT 'Active',
    tasks_completed INT DEFAULT 0,
    latency_ms NUMERIC DEFAULT 0.84,
    memory_used_pct INT DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_agents_workspace_id ON public.agents(workspace_id);

CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Members can access workspace agents"
    ON public.agents FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = agents.workspace_id AND user_id = auth.uid()
        )
    );

-- --------------------------------------------------------------------
-- 7. PROMPTS TABLE (Prompt Library)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    version TEXT DEFAULT 'v1.0',
    snippet TEXT NOT NULL,
    benchmark_score TEXT DEFAULT '99.0%',
    model_recommendation TEXT DEFAULT 'Gemini 3.6 Pro',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_prompts_workspace_id ON public.prompts(workspace_id);

CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON public.prompts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Members can access workspace prompts"
    ON public.prompts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = prompts.workspace_id AND user_id = auth.uid()
        )
    );

-- --------------------------------------------------------------------
-- 8. KNOWLEDGE DOCS TABLE (Vector RAG Collections)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.knowledge_docs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    collection TEXT DEFAULT 'default',
    file_count TEXT DEFAULT '0 files',
    storage_size TEXT DEFAULT '0 MB',
    dimension TEXT DEFAULT '1536-dim',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.knowledge_docs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_knowledge_docs_workspace_id ON public.knowledge_docs(workspace_id);

CREATE TRIGGER update_knowledge_docs_updated_at
    BEFORE UPDATE ON public.knowledge_docs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Members can access workspace knowledge docs"
    ON public.knowledge_docs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = knowledge_docs.workspace_id AND user_id = auth.uid()
        )
    );

-- --------------------------------------------------------------------
-- 9. SCHEDULED TASKS TABLE (Cron Jobs)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scheduled_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cron_expression TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    next_run TEXT,
    agent_role TEXT DEFAULT 'Subagent Worker',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scheduled_tasks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_workspace_id ON public.scheduled_tasks(workspace_id);

CREATE TRIGGER update_scheduled_tasks_updated_at
    BEFORE UPDATE ON public.scheduled_tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Members can access workspace scheduled tasks"
    ON public.scheduled_tasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = scheduled_tasks.workspace_id AND user_id = auth.uid()
        )
    );

-- --------------------------------------------------------------------
-- 10. API KEYS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    prefix TEXT NOT NULL DEFAULT 'ag_live_',
    key_hash TEXT NOT NULL,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_api_keys_workspace_id ON public.api_keys(workspace_id);

CREATE POLICY "Members can access workspace API keys"
    ON public.api_keys FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = api_keys.workspace_id AND user_id = auth.uid()
        )
    );

-- --------------------------------------------------------------------
-- 11. AUTOMATIC USER SIGNUP TRIGGER
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_workspace_id UUID;
    user_name TEXT;
BEGIN
    user_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));

    -- Insert into public.profiles
    INSERT INTO public.profiles (id, email, display_name, avatar_url, provider)
    VALUES (
        new.id,
        new.email,
        user_name,
        COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || encode(new.email::bytea, 'hex')),
        COALESCE(new.raw_app_meta_data->>'provider', 'email')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = EXCLUDED.display_name,
        updated_at = NOW();

    -- Create default Workspace
    INSERT INTO public.workspaces (name, plan, owner_id)
    VALUES (user_name || '''s Workspace', 'Pro Workspace', new.id)
    RETURNING id INTO new_workspace_id;

    -- Add user as admin member
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (new_workspace_id, new.id, 'admin');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
