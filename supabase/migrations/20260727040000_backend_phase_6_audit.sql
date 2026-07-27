-- ====================================================================
-- BACKEND PHASE 6: ENTERPRISE AUDIT & PRODUCTION CERTIFICATION MIGRATION
-- Copy & Paste this script into your Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. INDEX OPTIMIZATION FOR PRODUCTION SCALABILITY
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_workspace_secrets_workspace_id ON public.workspace_secrets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_secrets_provider ON public.workspace_secrets(provider);

CREATE INDEX IF NOT EXISTS idx_background_jobs_workspace_id ON public.background_jobs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_background_jobs_status ON public.background_jobs(status);
CREATE INDEX IF NOT EXISTS idx_background_jobs_type ON public.background_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_background_jobs_created_at ON public.background_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_job_logs_job_id ON public.job_logs(job_id);

CREATE INDEX IF NOT EXISTS idx_workspace_usage_workspace_id ON public.workspace_usage(workspace_id);

CREATE INDEX IF NOT EXISTS idx_workspace_files_workspace_id ON public.workspace_files(workspace_id);

-- --------------------------------------------------------------------
-- 2. NON-RECURSIVE RLS POLICY VERIFICATION
-- --------------------------------------------------------------------
-- Ensure all Phase 5 tables enforce non-recursive policies
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
