# Antigravity AI OS Architecture

---

## 1. Executive Overview

Antigravity AI OS is a production-certified enterprise AI Operating System and Multi-Agent Swarm Workspace designed for autonomous AI execution, high-density vector retrieval, encrypted credential management, and real-time observability.

### Architecture Style
- **Full-Stack Next.js 15 App Router Architecture**: Leverages Server Components for data fetching and SSR layout rendering, with `"use client"` scoped strictly to interactive primitives.
- **Serverless API Layer**: Utilizes Next.js Route Handlers (`/api/*`) for stateless REST and Server-Sent Events (SSE) token streaming.
- **Decoupled Backend Engine**: Built on Supabase (PostgreSQL 15) with native Vector extensions (`pgvector`), non-recursive Row Level Security (RLS), and automated Web Crypto AES-256-GCM secret encryption.

### Core Design Principles
1. **Zero-Trust Multitenancy**: Multitenant isolation enforced at the database layer via RLS policies without recursive self-joins.
2. **Real-Time Telemetry & Non-Blocking Streams**: Low-latency, token-by-token streaming via asynchronous `ReadableStream` decoders off the main UI thread.
3. **Hardware-Accelerated UX**: Framer Motion 60 FPS spring physics with WCAG AA accessibility compliance.
4. **Strict Type Safety & Contract Integrity**: Shared TypeScript schemas across frontend React state and backend API response payloads.

---

## 2. High-Level System Architecture

```
+-----------------------------------------------------------------------------------+
|                                    USER BROWSER                                   |
|  Next.js 15 App Router | React 19 | Framer Motion | Tailwind CSS | AuthContext    |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v (HTTP REST / SSE Token Streams)
+-----------------------------------------+-----------------------------------------+
|                              NEXT.JS SERVER ROUTER                                |
|  middleware.ts (SSR Session Guard) | Web Stream Decoders | AES-256 Crypto Engine |
+-----------------------------------------+-----------------------------------------+
                                          |
            +-----------------------------+-----------------------------+
            |                                                           |
            v                                                           v
+-----------+-----------------------------+             +---------------+-----------+
|          BACKEND ROUTE HANDLERS         |             |   AES-256-GCM CRYPTO VAULT|
|  /api/chat/stream                       |             |   Web Crypto Secrets Engine|
|  /api/agents/[id]/stream                |             +---------------------------+
|  /api/knowledge/upload                  |
|  /api/observability/metrics             |
|  /api/jobs                              |
+-----------+-----------------------------+
            |
            +-----------------------------+-----------------------------+
            |                                                           |
            v                                                           v
+-----------+-----------------------------+             +---------------+-----------+
|               SUPABASE / POSTGRESQL             |             |   EXTERNAL AI PROVIDERS   |
|  6 Enterprise Tables | pgvector Embeddings |             |   OpenAI | Anthropic      |
|  Non-Recursive Row Level Security (RLS) |             |   Gemini | DeepSeek | Groq|
+-----------------------------------------+             +---------------------------+
```

---

## 3. Frontend Architecture

### Next.js 15 App Router Layouts
- **`src/app/layout.tsx`**: Root layout encapsulating global dark mode styles, typography fonts, and `AuthProvider` context wrappers.
- **`src/app/dashboard/layout.tsx`**: Protected shell containing the interactive sidebar, top header, command palette modal container, and active view switcher.

### Server Components vs. Client Components
- **Server Components (`src/app/page.tsx`, `src/app/dashboard/page.tsx`)**: Handle static shell rendering, SSR meta descriptions, and initial layout hydration without shipping unnecessary JS bundles.
- **Client Components (`src/components/dashboard/*`)**: Declared with `"use client"` for local React state management, mouse/keyboard event handling, Framer Motion animations, and SSE Web Stream reader loops.

### Context Providers & State Management
- **`AuthContext.tsx`**: Manages Supabase user session state, login/logout callbacks, and session token hydration.
- **Local View State**: Tab switching managed dynamically inside `src/app/dashboard/page.tsx` rendering specific view frames (`AIChatView`, `AgentsView`, `KnowledgeBaseView`, `SecretsView`, `ObservabilityView`, `BillingView`, `ProfileView`, `ScheduledTasksView`).

---

## 4. Backend Architecture

### 1. Chat Module (`/api/chat`, `/api/chat/stream`)
- **Purpose**: Real-time multi-model chat streaming endpoint.
- **Responsibilities**: Validates prompt request payload, parses provider selection, streams LLM completion tokens via Server-Sent Events (SSE), and logs token usage.

### 2. Agents Module (`/api/agents`, `/api/agents/[id]/stream`, `/api/agents/[id]/run`, `/api/agents/[id]/cancel`)
- **Purpose**: Multi-agent swarm orchestration.
- **Responsibilities**: Manages agent swarm configurations, streams agent execution thought logs, and provides async cancellation signals.

### 3. Knowledge Base Module (`/api/knowledge`, `/api/knowledge/upload`, `/api/knowledge/query`)
- **Purpose**: Vector RAG document vault.
- **Responsibilities**: Ingests files, generates vector embeddings, stores chunks in PostgreSQL (`pgvector`), and executes cosine similarity searches.

### 4. Secrets Module (`/api/secrets`)
- **Purpose**: Bank-grade encrypted credential manager.
- **Responsibilities**: Encrypts API keys server-side using AES-256-GCM before writing to `workspace_secrets`, and returns masked key previews for client display.

### 5. Observability Module (`/api/observability/metrics`)
- **Purpose**: Real-time system telemetry and health metrics.
- **Responsibilities**: Gathers CPU/memory indicators, token consumption progress bars, active agent swarms, and provider circuit breaker statuses.

### 6. Background Jobs Module (`/api/jobs`)
- **Purpose**: Asynchronous worker queue manager.
- **Responsibilities**: Enqueues, tracks, and logs background tasks in the `background_jobs` and `job_logs` tables.

---

## 5. Authentication Flow

```
[ User Browser ] -----> 1. Submit Credentials -----> [ /api/auth/login ]
       |                                                    |
       |                                                    v
       |<----- 2. Return Session Cookie & Access Token <----+ (Supabase Auth)
       |
       v
[ Request /dashboard ] -----> 3. Execute middleware.ts Guard Check
                                        |
                 +----------------------+----------------------+
                 |                                             |
         (Valid Session)                               (Invalid Session)
                 v                                             v
[ Render /dashboard Shell ]                    [ Redirect to /login ]
```

- **Supabase SSR Auth**: Session state managed via `@supabase/ssr` cookies.
- **`middleware.ts`**: Edge middleware intercepts protected routes (`/dashboard/*`) and enforces login redirects when session cookies are missing or expired.

---

## 6. AI System Architecture

### Multi-Provider Abstraction
The system abstracts multiple AI providers behind a unified streaming interface:
- **Supported Providers**: OpenAI, Anthropic, Gemini, DeepSeek, Groq.
- **Provider Resilience**: Automated fallback handling when a provider returns rate limits or service degradation errors.

### Streaming Pipeline
1. Client sends request to `/api/chat/stream`.
2. Server opens an HTTP connection with `Content-Type: text/event-stream`.
3. Server streams chunks formatted as `event: token\ndata: {"token": "..."}\n\n`.
4. Client uses native `TextDecoder` and `ReadableStream.getReader()` to parse tokens asynchronously without freezing the UI thread.

---

## 7. Database Architecture

### Master Database Schema (`supabase/schema.sql`)

```
+-------------------+        +-----------------------+        +---------------------+
|    workspaces     |<-------|   workspace_secrets   |        |   workspace_files   |
+-------------------+        +-----------------------+        +---------------------+
| id (PK)           |        | id (PK)               |        | id (PK)             |
| name              |        | workspace_id (FK)     |        | workspace_id (FK)   |
| owner_id (FK)     |        | secret_key            |        | file_name           |
| created_at        |        | encrypted_value       |        | file_path           |
+-------------------+        +-----------------------+        +---------------------+
          ^
          |                  +-----------------------+        +---------------------+
          +------------------|    background_jobs    |        |   provider_health   |
          |                  +-----------------------+        +---------------------+
          |                  | id (PK)               |        | id (PK)             |
          |                  | workspace_id (FK)     |        | provider_name       |
          |                  | status                |        | status              |
          |                  +-----------------------+        +---------------------+
          |                              ^
          |                              |
          |                  +-----------+-----------+
          |                  |       job_logs        |
          +------------------+-----------------------+
                             | id (PK)               |
                             | job_id (FK)           |
                             | message               |
                             +-----------------------+
```

### Row Level Security (RLS) Non-Recursive Policies
To prevent database `ERROR 42P17` infinite recursion:
```sql
-- Non-recursive policy asserting workspace ownership via parent subquery
CREATE POLICY "Users can manage workspace secrets" ON workspace_secrets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = workspace_secrets.workspace_id 
      AND workspaces.owner_id = auth.uid()
    )
  );
```

---

## 8. API Architecture

| Endpoint | Method | Auth Required | Response Type | Purpose |
|---|---|---|---|---|
| `/api/auth/login` | `POST` | No | `JSON` | Authenticate user session |
| `/api/auth/signup` | `POST` | No | `JSON` | Register new user account |
| `/api/auth/logout` | `POST` | Yes | `JSON` | Terminate session cookies |
| `/api/chat/stream` | `POST` | Yes | `text/event-stream` | Stream AI chat completions |
| `/api/agents/[id]/stream` | `GET` | Yes | `text/event-stream` | Stream subagent execution logs |
| `/api/knowledge/upload` | `POST` | Yes | `JSON` | Ingest vector documents |
| `/api/knowledge/query` | `POST` | Yes | `JSON` | Cosine vector similarity search |
| `/api/secrets` | `GET`, `POST`, `DELETE` | Yes | `JSON` | AES-256 encrypted key manager |
| `/api/observability/metrics` | `GET` | Yes | `JSON` | System telemetry & metrics |
| `/api/jobs` | `GET`, `POST` | Yes | `JSON` | Worker job queue manager |
| `/api/profile` | `GET`, `PUT` | Yes | `JSON` | Manage user profile settings |
| `/api/docs` | `GET` | No | `JSON` | OpenAPI 3.0.3 Specification |

---

## 9. Security Architecture

1. **Web Crypto AES-256-GCM Vault**: Secret keys are encrypted server-side using Web Crypto API master keys before writing to disk.
2. **Strict RLS Multi-Tenancy**: Tenant data isolation enforced at the PostgreSQL engine level.
3. **XSS & Markdown Sanitization**: AI chat outputs escape unsafe HTML tags before DOM injection.
4. **Zero Client Token Exposure**: API keys and service role keys are strictly bound to server-side Node runtime environments.

---

## 10. Streaming Architecture

```
[ Client ] ---- 1. POST /api/chat/stream ----> [ Next.js Route Handler ]
    |                                                      |
    | <---- 2. Open HTTP Event Stream (200 OK) ------------+
    |
    | <---- 3. Chunk: event: status\ndata: {"status": "thinking"}
    | <---- 4. Chunk: event: token\ndata: {"token": "Hello"}
    | <---- 5. Chunk: event: token\ndata: {"token": " World"}
    | <---- 6. Chunk: event: completion\ndata: {"done": true}
    |
[ UI Render Token Stream ]
```

- **Cancellation Support**: Closing the HTTP reader terminates the upstream connection without dangling server processes.

---

## 11. Folder Structure

```
D:\Projects\Antigravity
├── src/
│   ├── app/                      # Next.js 15 App Router Routes
│   │   ├── api/                  # Serverless API Route Handlers
│   │   ├── dashboard/            # Protected Dashboard Shell
│   │   ├── login/                # Authentication Sign-In Page
│   │   └── signup/               # Registration Page
│   ├── components/
│   │   ├── dashboard/            # 16 Specialized Dashboard View Components
│   │   └── ui/                   # Reusable Glassmorphic UI Primitives
│   ├── lib/                      # Supabase, Crypto, and Utility Functions
│   └── types/                    # Shared TypeScript Type Declarations
├── supabase/
│   ├── migrations/               # Database SQL Migration Files
│   └── schema.sql                # Master Database Schema Reference
├── package.json                  # Dependencies & Script Definitions
└── README.md                     # Official Project Homepage Documentation
```

---

## 12. Request Lifecycle

```
User Action (Click / Form Submit)
       │
       ▼
Client State Handler / Custom Hook
       │
       ▼
HTTP Fetch Request with Session Cookie
       │
       ▼
Next.js Edge Middleware Guard (middleware.ts)
       │
       ▼
Next.js Route Handler (/api/*)
       │
       ▼
Web Crypto Encryption / Business Logic Layer
       │
       ▼
Supabase PostgreSQL Query (with RLS Enforcement)
       │
       ▼
JSON Response Payload / SSE Stream Chunks
       │
       ▼
Client DOM State Update & Framer Motion Animation
```

---

## 13. Performance Architecture

- **Route Component Splitting**: Shared framework JS size maintained at **103 kB**.
- **Asynchronous Web Streams**: SSE token decoding executed off the main thread via `ReadableStream` reader.
- **Hardware-Accelerated UI**: Framer Motion uses CSS transform and opacity properties for 60 FPS rendering.

---

## 14. Scalability

- **Frontend**: Serverless Next.js App Router deployable across Vercel Edge Networks.
- **Backend APIs**: Serverless route handlers scale horizontally without state retention.
- **Database**: PostgreSQL 15 with composite B-Tree indexes and Supabase PgBouncer pooler connection management.

---

## 15. Engineering Decisions

- **Why Next.js 15 App Router?** Unified full-stack framework with React 19 Server Component streaming capabilities.
- **Why Supabase & PostgreSQL?** Native Row Level Security (RLS) and built-in `pgvector` extension for high-performance vector search.
- **Why Server-Sent Events (SSE)?** Lower infrastructure complexity than WebSockets while providing HTTP/2 multiplexed real-time streaming.
- **Why TypeScript Strict Mode?** Complete type safety across client state and API payloads.

---

## 16. Known Limitations

1. **Streaming Proxy Interception**: Certain strict enterprise corporate proxies may buffer HTTP responses, causing SSE chunks to arrive in batches rather than individual tokens.
2. **In-Memory SSE Buffer Bounds**: Extremely large token stream logs (> 50,000 words in a single response) accumulate client-side memory if left open indefinitely.

---

## 17. Future Architecture

### Version 1.1 (Short-Term Roadmap)
- **WebSocket Fallback Transport**: Dynamic transport switching when SSE buffering is detected.
- **Zustand Global State Store**: Centralized global UI tab state management.

### Version 2.0 (Long-Term Roadmap)
- **Enterprise SAML / Single Sign-On**: Integration with Okta, Azure AD, and Ping Identity.
- **Edge Subagent Execution**: Running lightweight subagent swarms directly on Vercel Edge Runtime.

---

## 18. Architecture Summary

Antigravity AI OS v1.0.0 is an enterprise-certified software platform combining full-stack Next.js 15 App Router capabilities, Bank-Grade AES-256-GCM secret encryption, non-recursive PostgreSQL RLS multi-tenancy, and real-time SSE token streaming. It is certified, production-ready, and optimized for enterprise scalability.
