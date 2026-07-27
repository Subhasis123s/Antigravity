-- ====================================================================
-- ANTIGRAVITY AI WORKSPACE — BACKEND PHASE 4 MIGRATION SCHEMA
-- Production AI OS: Subagent Swarms, Vector Knowledge Vault & AI Chat
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- --------------------------------------------------------------------
-- 1. AI AGENTS TABLE (Subagent Definitions & Configurations)
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_agents_workspace_id ON public.agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agents_project_id ON public.agents(project_id);
CREATE INDEX IF NOT EXISTS idx_agents_owner_id ON public.agents(owner_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);

DROP TRIGGER IF EXISTS update_agents_updated_at ON public.agents;
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- 2. AGENT RUNS TABLE (Execution Lifecycle & Telemetry)
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_id ON public.agent_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_id ON public.agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON public.agent_runs(status);

-- --------------------------------------------------------------------
-- 3. AGENT MEMORY TABLE (Subagent Contextual State)
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_agent_memory_agent_id ON public.agent_memory(agent_id);

DROP TRIGGER IF EXISTS update_agent_memory_updated_at ON public.agent_memory;
CREATE TRIGGER update_agent_memory_updated_at
    BEFORE UPDATE ON public.agent_memory
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- 4. AGENT TOOLS TABLE (Tool Configurations)
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_agent_tools_agent_id ON public.agent_tools(agent_id);

-- --------------------------------------------------------------------
-- 5. KNOWLEDGE DOCUMENTS TABLE (Vector Vault Headers)
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_workspace_id ON public.knowledge_documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_project_id ON public.knowledge_documents(project_id);

-- --------------------------------------------------------------------
-- 6. KNOWLEDGE CHUNKS TABLE (Vector Embedding Storage)
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document_id ON public.knowledge_chunks(document_id);

-- --------------------------------------------------------------------
-- 7. CHAT SESSIONS & MESSAGES TABLES
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_chat_sessions_workspace_id ON public.chat_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);

-- --------------------------------------------------------------------
-- 8. AI SYSTEM AUDIT LOGS TABLE
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_ai_audit_logs_workspace_id ON public.ai_audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_audit_logs_user_id ON public.ai_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_audit_logs_created_at ON public.ai_audit_logs(created_at DESC);

-- --------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES FOR PHASE 4 (NON-RECURSIVE)
-- --------------------------------------------------------------------

-- AGENTS RLS (Non-recursive Owner + Workspace Member)
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

-- AGENT RUNS RLS
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

-- KNOWLEDGE DOCUMENTS RLS (Non-recursive Owner + Workspace Member)
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

-- KNOWLEDGE CHUNKS RLS
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

-- CHAT SESSIONS RLS
DROP POLICY IF EXISTS "Users manage chat sessions" ON public.chat_sessions;
CREATE POLICY "Users manage chat sessions" ON public.chat_sessions
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.workspaces WHERE id = chat_sessions.workspace_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = chat_sessions.workspace_id AND user_id = auth.uid())
    );

-- CHAT MESSAGES RLS
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

-- AI AUDIT LOGS RLS
DROP POLICY IF EXISTS "Workspace members view AI audit logs" ON public.ai_audit_logs;
CREATE POLICY "Workspace members view AI audit logs" ON public.ai_audit_logs
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.workspaces WHERE id = ai_audit_logs.workspace_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = ai_audit_logs.workspace_id AND user_id = auth.uid())
    );
