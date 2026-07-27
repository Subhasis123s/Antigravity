-- ====================================================================
-- ANTIGRAVITY AI WORKSPACE — BACKEND PHASE 5 MIGRATION SCHEMA
-- Production Enterprise AI OS: Secrets, Background Jobs, Observability & Billing
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 1. WORKSPACE SECRETS TABLE (Encrypted API Credentials)
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_workspace_secrets_workspace_id ON public.workspace_secrets(workspace_id);

DROP TRIGGER IF EXISTS update_workspace_secrets_updated_at ON public.workspace_secrets;
CREATE TRIGGER update_workspace_secrets_updated_at
    BEFORE UPDATE ON public.workspace_secrets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- 2. BACKGROUND JOBS TABLE (Asynchronous Job Queue & DLQ)
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_background_jobs_workspace_id ON public.background_jobs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_background_jobs_status ON public.background_jobs(status);
CREATE INDEX IF NOT EXISTS idx_background_jobs_created_at ON public.background_jobs(created_at DESC);

-- --------------------------------------------------------------------
-- 3. JOB LOGS TABLE (Worker Telemetry Logs)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.background_jobs(id) ON DELETE CASCADE,
    log_level TEXT DEFAULT 'info' CHECK (log_level IN ('info', 'warn', 'error', 'debug')),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.job_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_job_logs_job_id ON public.job_logs(job_id);

-- --------------------------------------------------------------------
-- 4. WORKSPACE USAGE & QUOTAS TABLE (Billing Foundation)
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_workspace_usage_workspace_id ON public.workspace_usage(workspace_id);

DROP TRIGGER IF EXISTS update_workspace_usage_updated_at ON public.workspace_usage;
CREATE TRIGGER update_workspace_usage_updated_at
    BEFORE UPDATE ON public.workspace_usage
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- 5. WORKSPACE FILES TABLE (Storage Engine Management)
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_workspace_files_workspace_id ON public.workspace_files(workspace_id);

-- --------------------------------------------------------------------
-- 6. PROVIDER HEALTH TABLE (Circuit Breaker & Telemetry)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.provider_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'down')),
    latency_ms INT DEFAULT 0,
    error_rate NUMERIC DEFAULT 0.0,
    last_check_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.provider_health ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES FOR PHASE 5 (NON-RECURSIVE)
-- --------------------------------------------------------------------

-- WORKSPACE SECRETS RLS
DROP POLICY IF EXISTS "Workspace owners manage secrets" ON public.workspace_secrets;
CREATE POLICY "Workspace owners manage secrets" ON public.workspace_secrets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_secrets.workspace_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = workspace_secrets.workspace_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- BACKGROUND JOBS RLS
DROP POLICY IF EXISTS "Workspace members manage jobs" ON public.background_jobs;
CREATE POLICY "Workspace members manage jobs" ON public.background_jobs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.workspaces WHERE id = background_jobs.workspace_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = background_jobs.workspace_id AND user_id = auth.uid())
    );

-- JOB LOGS RLS
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

-- WORKSPACE USAGE RLS
DROP POLICY IF EXISTS "Workspace members view usage" ON public.workspace_usage;
CREATE POLICY "Workspace members view usage" ON public.workspace_usage
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_usage.workspace_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = workspace_usage.workspace_id AND user_id = auth.uid())
    );

-- WORKSPACE FILES RLS
DROP POLICY IF EXISTS "Workspace members manage files" ON public.workspace_files;
CREATE POLICY "Workspace members manage files" ON public.workspace_files
    FOR ALL USING (
        uploaded_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_files.workspace_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = workspace_files.workspace_id AND user_id = auth.uid())
    );

-- PROVIDER HEALTH RLS
DROP POLICY IF EXISTS "Public view provider health" ON public.provider_health;
CREATE POLICY "Public view provider health" ON public.provider_health
    FOR SELECT USING (true);
