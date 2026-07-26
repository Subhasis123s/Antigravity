-- ====================================================================
-- ANTIGRAVITY AI WORKSPACE — PRODUCTION SUPABASE DATABASE SCHEMA
-- Copy & Paste this script into your Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
