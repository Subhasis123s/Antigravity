-- ====================================================================
-- ANTIGRAVITY AI WORKSPACE — PRODUCTION SUPABASE DATABASE SCHEMA
-- Copy & Paste this script into your Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- --------------------------------------------------------------------
-- 1. UPDATED_AT TRIGGER FUNCTION
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------
-- 2. PROFILES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT DEFAULT '',
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    theme TEXT DEFAULT 'dark',
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "marketing": false, "alerts": true}'::jsonb,
    provider TEXT DEFAULT 'email',
    role TEXT DEFAULT 'member',
    last_login TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": true, "marketing": false, "alerts": true}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- 3. WORKSPACES & MEMBERS WITH RBAC ROLES
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

DROP TRIGGER IF EXISTS update_workspaces_updated_at ON public.workspaces;
CREATE TRIGGER update_workspaces_updated_at
    BEFORE UPDATE ON public.workspaces
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);

DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON public.workspaces;
CREATE POLICY "Users can view workspaces they belong to" ON public.workspaces FOR SELECT USING (
    auth.uid() = owner_id OR EXISTS (
        SELECT 1 FROM public.workspace_members WHERE workspace_id = workspaces.id AND user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Owners can update their workspace" ON public.workspaces;
CREATE POLICY "Owners can update their workspace" ON public.workspaces FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Members can view workspace membership" ON public.workspace_members;
CREATE POLICY "Members can view workspace membership" ON public.workspace_members FOR SELECT USING (user_id = auth.uid());

-- --------------------------------------------------------------------
-- 4. USER PREFERENCES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark',
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    auto_save BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

DROP POLICY IF EXISTS "Users manage their preferences" ON public.user_preferences;
CREATE POLICY "Users manage their preferences" ON public.user_preferences FOR ALL USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- 5. USER SESSIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    device_type TEXT DEFAULT 'Desktop',
    is_active BOOLEAN DEFAULT true,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);

DROP POLICY IF EXISTS "Users access their sessions" ON public.user_sessions;
CREATE POLICY "Users access their sessions" ON public.user_sessions FOR ALL USING (user_id = auth.uid());

-- --------------------------------------------------------------------
-- 6. ACTIVITY LOGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_workspace_id ON public.activity_logs(workspace_id);

DROP POLICY IF EXISTS "Users view activity logs" ON public.activity_logs;
CREATE POLICY "Users view activity logs" ON public.activity_logs FOR SELECT USING (user_id = auth.uid());

-- --------------------------------------------------------------------
-- 7. AUTOMATIC USER SIGNUP TRIGGER (FAILSAFE & PRODUCTION-READY)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_workspace_id UUID;
    user_full_name TEXT;
    user_name TEXT;
    suffix INT := 0;
BEGIN
    user_full_name := COALESCE(
        NULLIF(trim(new.raw_user_meta_data->>'full_name'), ''),
        NULLIF(trim(new.raw_user_meta_data->>'name'), ''),
        split_part(new.email, '@', 1)
    );

    user_name := COALESCE(
        NULLIF(trim(new.raw_user_meta_data->>'username'), ''),
        split_part(new.email, '@', 1) || '_' || substr(replace(new.id::text, '-', ''), 1, 6)
    );

    -- 1. Profile Creation with Unique Violation Handling Loop
    LOOP
        BEGIN
            INSERT INTO public.profiles (
                id, email, full_name, display_name, username, avatar_url, provider
            )
            VALUES (
                new.id,
                new.email,
                user_full_name,
                user_full_name,
                user_name,
                COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || encode(new.email::bytea, 'hex')),
                COALESCE(new.raw_app_meta_data->>'provider', 'email')
            )
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                full_name = EXCLUDED.full_name,
                display_name = EXCLUDED.display_name,
                last_login = NOW(),
                updated_at = NOW();

            EXIT; -- Insert succeeded
        EXCEPTION WHEN unique_violation THEN
            suffix := suffix + 1;
            user_name := split_part(new.email, '@', 1) || '_' || substr(replace(new.id::text, '-', ''), 1, 4) || '_' || suffix;
            IF suffix > 5 THEN
                user_name := split_part(new.email, '@', 1) || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
                EXIT;
            END IF;
        END;
    END LOOP;

    -- 2. User Preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (new.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- 3. Default Workspace
    INSERT INTO public.workspaces (name, plan, owner_id)
    VALUES (user_full_name || '''s Workspace', 'Pro Workspace', new.id)
    RETURNING id INTO new_workspace_id;

    -- 4. Workspace Membership
    IF new_workspace_id IS NOT NULL THEN
        INSERT INTO public.workspace_members (workspace_id, user_id, role)
        VALUES (new_workspace_id, new.id, 'owner')
        ON CONFLICT (workspace_id, user_id) DO NOTHING;
    END IF;

    -- 5. Activity Log
    INSERT INTO public.activity_logs (user_id, workspace_id, action, entity_type, details)
    VALUES (
        new.id,
        new_workspace_id,
        'USER_SIGNUP',
        'AUTH',
        jsonb_build_object('email', new.email, 'provider', COALESCE(new.raw_app_meta_data->>'provider', 'email'))
    );

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Prevent unexpected trigger exceptions from crashing auth.users insertion
    RAISE WARNING 'handle_new_user trigger exception: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- BACKEND PHASE 3: PROJECT MANAGEMENT SCHEMA & RLS POLICIES
-- ====================================================================

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

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'editor' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_project_member UNIQUE (project_id, user_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.project_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.project_activity ENABLE ROW LEVEL SECURITY;

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

-- ====================================================================
-- BACKEND PHASE 4: AI OPERATING SYSTEM SCHEMA & RLS POLICIES
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    model TEXT DEFAULT 'gemini-3.6-pro',
    provider TEXT DEFAULT 'google',
    system_prompt TEXT DEFAULT 'You are an autonomous AI coding subagent.',
    temperature NUMERIC DEFAULT 0.7,
    max_tokens INT DEFAULT 4096,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'idle', 'paused', 'running', 'error')),
    avatar TEXT DEFAULT 'bot',
    color TEXT DEFAULT '#6E56CF',
    tools_enabled JSONB DEFAULT '["code_search", "file_edit", "terminal"]'::jsonb,
    permissions JSONB DEFAULT '{"can_read": true, "can_write": true, "can_execute": true}'::jsonb,
    memory_enabled BOOLEAN DEFAULT true,
    vector_namespace TEXT DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
    input JSONB DEFAULT '{}'::jsonb,
    output JSONB DEFAULT '{}'::jsonb,
    error TEXT,
    tokens_prompt INT DEFAULT 0,
    tokens_completion INT DEFAULT 0,
    latency_ms INT DEFAULT 0,
    cost NUMERIC DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.agent_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    memory_key TEXT NOT NULL,
    memory_value JSONB NOT NULL,
    importance NUMERIC DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_agent_memory_key UNIQUE (agent_id, memory_key)
);

ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.agent_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{}'::jsonb,
    configuration JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_agent_tool UNIQUE (agent_id, tool_name)
);

ALTER TABLE public.agent_tools ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.knowledge_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    mime_type TEXT DEFAULT 'text/plain',
    size INT DEFAULT 0,
    status TEXT DEFAULT 'indexed' CHECK (status IN ('uploading', 'processing', 'indexed', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New AI Workspace Chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT NOT NULL,
    code_snippet TEXT,
    tokens INT DEFAULT 0,
    cost NUMERIC DEFAULT 0,
    latency_ms INT DEFAULT 0,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.ai_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    document_id UUID REFERENCES public.knowledge_documents(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_audit_logs ENABLE ROW LEVEL SECURITY;

-- Phase 4 RLS Policies
DROP POLICY IF EXISTS "Workspace members can view agents" ON public.agents;
CREATE POLICY "Workspace members can view agents" ON public.agents
    FOR SELECT USING (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.workspaces WHERE id = agents.workspace_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = agents.workspace_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Workspace members can manage agents" ON public.agents;
CREATE POLICY "Workspace members can manage agents" ON public.agents
    FOR ALL USING (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.workspaces WHERE id = agents.workspace_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = agents.workspace_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Workspace members view agent runs" ON public.agent_runs;
CREATE POLICY "Workspace members view agent runs" ON public.agent_runs
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.agents
            WHERE id = agent_runs.agent_id AND (
                owner_id = auth.uid() OR
                workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()) OR
                workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "Users execute agent runs" ON public.agent_runs;
CREATE POLICY "Users execute agent runs" ON public.agent_runs
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR user_id IS NULL
    );

DROP POLICY IF EXISTS "Workspace members view documents" ON public.knowledge_documents;
CREATE POLICY "Workspace members view documents" ON public.knowledge_documents
    FOR SELECT USING (
        uploaded_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.workspaces WHERE id = knowledge_documents.workspace_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = knowledge_documents.workspace_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Workspace members upload documents" ON public.knowledge_documents;
CREATE POLICY "Workspace members upload documents" ON public.knowledge_documents
    FOR ALL USING (
        uploaded_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.workspaces WHERE id = knowledge_documents.workspace_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = knowledge_documents.workspace_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Workspace members view chunks" ON public.knowledge_chunks;
CREATE POLICY "Workspace members view chunks" ON public.knowledge_chunks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.knowledge_documents
            WHERE id = knowledge_chunks.document_id AND (
                uploaded_by = auth.uid() OR
                workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()) OR
                workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "Users manage chat sessions" ON public.chat_sessions;
CREATE POLICY "Users manage chat sessions" ON public.chat_sessions
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.workspaces WHERE id = chat_sessions.workspace_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = chat_sessions.workspace_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users manage chat messages" ON public.chat_messages;
CREATE POLICY "Users manage chat messages" ON public.chat_messages
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.chat_sessions
            WHERE id = chat_messages.session_id AND (
                user_id = auth.uid() OR
                workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()) OR
                workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "Workspace members view AI audit logs" ON public.ai_audit_logs;
CREATE POLICY "Workspace members view AI audit logs" ON public.ai_audit_logs
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.workspaces WHERE id = ai_audit_logs.workspace_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = ai_audit_logs.workspace_id AND user_id = auth.uid())
    );

-- ====================================================================
-- BACKEND PHASE 5: ENTERPRISE AI OPERATING SYSTEM SCHEMA & RLS
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.workspace_secrets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    encrypted_value TEXT NOT NULL,
    key_hint TEXT NOT NULL,
    provider TEXT DEFAULT 'custom',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_workspace_secret_key UNIQUE (workspace_id, key_name)
);

ALTER TABLE public.workspace_secrets ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.background_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    error TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.job_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.background_jobs(id) ON DELETE CASCADE,
    log_level TEXT DEFAULT 'info' CHECK (log_level IN ('info', 'warn', 'error', 'debug')),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.job_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.workspace_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ DEFAULT NOW(),
    period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    tokens_used BIGINT DEFAULT 0,
    storage_bytes BIGINT DEFAULT 0,
    embedding_queries INT DEFAULT 0,
    executions_count INT DEFAULT 0,
    cost_estimate NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_workspace_usage_period UNIQUE (workspace_id, period_start)
);

ALTER TABLE public.workspace_usage ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.workspace_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT DEFAULT 'text/plain',
    size BIGINT DEFAULT 0,
    version INT DEFAULT 1,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workspace_files ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.provider_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'down')),
    latency_ms INT DEFAULT 0,
    error_rate NUMERIC DEFAULT 0.0,
    last_check_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.provider_health ENABLE ROW LEVEL SECURITY;

-- Phase 5 RLS Policies
DROP POLICY IF EXISTS "Workspace owners manage secrets" ON public.workspace_secrets;
CREATE POLICY "Workspace owners manage secrets" ON public.workspace_secrets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_secrets.workspace_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = workspace_secrets.workspace_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
    );

DROP POLICY IF EXISTS "Workspace members manage jobs" ON public.background_jobs;
CREATE POLICY "Workspace members manage jobs" ON public.background_jobs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.workspaces WHERE id = background_jobs.workspace_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = background_jobs.workspace_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Workspace members view job logs" ON public.job_logs;
CREATE POLICY "Workspace members view job logs" ON public.job_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.background_jobs
            WHERE id = job_logs.job_id AND (
                workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()) OR
                workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "Workspace members view usage" ON public.workspace_usage;
CREATE POLICY "Workspace members view usage" ON public.workspace_usage
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_usage.workspace_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = workspace_usage.workspace_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Workspace members manage files" ON public.workspace_files;
CREATE POLICY "Workspace members manage files" ON public.workspace_files
    FOR ALL USING (
        uploaded_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_files.workspace_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = workspace_files.workspace_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Public view provider health" ON public.provider_health;
CREATE POLICY "Public view provider health" ON public.provider_health
    FOR SELECT USING (true);
