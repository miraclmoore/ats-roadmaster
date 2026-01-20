# Architecture

**Analysis Date:** 2026-01-19

## Pattern Overview

**Overall:** Three-Tier Cloud Architecture with Real-Time Data Pipeline

**Key Characteristics:**
- C# desktop plugin captures game telemetry via memory-mapped file and streams to cloud
- Supabase backend handles authentication, database (PostgreSQL), and real-time subscriptions
- Next.js 16 frontend with App Router provides server-rendered dashboard with client-side interactivity
- Real-time WebSocket updates for live telemetry display (1Hz sampling)
- AI integration via Anthropic Claude API for personalized recommendations

## Layers

**Game SDK Layer:**
- Purpose: Captures telemetry from American Truck Simulator via SCS SDK
- Location: `plugin/RoadMasterPlugin/`
- Contains: C# console application, SDK client wrappers, API communication
- Depends on: SCS Telemetry SDK (memory-mapped file at `Local\\SCSTelemetry`), RenCloud SDK wrapper
- Used by: Posts data to Next.js API routes

**API Layer (Backend):**
- Purpose: HTTP endpoints for telemetry ingestion and job lifecycle management
- Location: `web/app/api/`
- Contains: Next.js Route Handlers (telemetry, jobs/start, jobs/complete, ai/chat, user/preferences)
- Depends on: Supabase service client (bypasses RLS), Anthropic SDK
- Used by: C# plugin (API key auth), frontend pages (cookie auth)

**Database Layer:**
- Purpose: Persistent storage with Row Level Security and calculated fields
- Location: `supabase/migrations/`
- Contains: PostgreSQL schema, triggers for profit calculation, RLS policies
- Depends on: Supabase Auth (auth.users)
- Used by: API routes (service client), frontend (client queries)

**Presentation Layer (Frontend - Server Components):**
- Purpose: Server-side rendering, authentication checks, data fetching
- Location: `web/app/(dashboard)/*/page.tsx`, `web/app/(auth)/*/page.tsx`
- Contains: Next.js Server Components, layout components
- Depends on: Supabase server client, auth middleware
- Used by: Renders initial HTML with data

**Presentation Layer (Frontend - Client Components):**
- Purpose: Interactive UI, real-time updates, client-side state
- Location: `web/components/`, `web/app/(dashboard)/live/page.tsx`
- Contains: React Client Components with hooks, real-time subscriptions
- Depends on: Supabase browser client, Recharts, Framer Motion
- Used by: Server Components render client components as children

**Business Logic Layer:**
- Purpose: Reusable calculation functions for profit, fuel economy, performance
- Location: `web/lib/calculations/`
- Contains: Pure TypeScript functions (profit.ts, efficiency.ts, performance.ts)
- Depends on: Nothing (pure functions)
- Used by: API routes (server-side), components (client-side), database triggers (PostgreSQL)

## Data Flow

**Telemetry Ingestion Pipeline:**

1. Game Running → SCS SDK writes telemetry to memory-mapped file (`Local\\SCSTelemetry`)
2. C# Plugin (`plugin/RoadMasterPlugin/Plugin.cs`) reads MMF via `SCSSdkTelemetry` wrapper
3. Event Detection → Plugin detects job started/completed via SDK events
4. HTTP POST → `ApiClient.cs` sends telemetry to `POST /api/telemetry` with API key
5. API Route (`web/app/api/telemetry/route.ts`) validates API key, looks up user_id
6. Database Insert → Service client inserts into `telemetry` table (bypasses RLS)
7. Realtime Broadcast → Supabase broadcasts INSERT event via WebSocket
8. Frontend Subscription → `live/page.tsx` receives update, throttles to 500ms, updates UI

**Job Lifecycle:**

1. Job Started → Plugin sends `POST /api/jobs/start` with route/cargo/income details
2. Job Record Created → API inserts into `jobs` table with `completed_at = NULL`
3. Telemetry Associated → Subsequent telemetry includes `job_id` foreign key
4. Job Completed → Plugin sends `POST /api/jobs/complete` with `job_id`
5. Metrics Calculated → Database trigger `calculate_job_profit()` computes fuel_cost, damage_cost, profit
6. Company Stats Updated → Database trigger `update_company_stats()` aggregates per-company performance

**AI Chat Flow:**

1. User Message → Client posts message to `POST /api/ai/chat`
2. Context Building → API route queries last 20 completed jobs, calculates route/cargo profitability
3. Prompt Generation → Builds personalized prompt with user's actual stats and best routes
4. Claude API Call → Anthropic SDK sends prompt to Claude Sonnet 4
5. Response → AI analyzes user's data, provides specific recommendations with dollar amounts

**State Management:**

- Server State: Supabase handles all persistent data, RLS enforces user isolation
- Client State: React `useState` for UI state, `useEffect` + Supabase Realtime for live data
- Local State: `localStorage` for dashboard profile preferences (gauge styles, visible cards)

## Key Abstractions

**Supabase Client Factory:**
- Purpose: Creates properly configured Supabase clients for different contexts
- Examples: `web/lib/supabase/client.ts` (browser), `web/lib/supabase/server.ts` (server), `web/lib/supabase/service.ts` (service role)
- Pattern: Factory functions that handle cookie management and authentication context

**Job Model:**
- Purpose: Represents a freight job from pickup to delivery
- Examples: `Database['public']['Tables']['jobs']['Row']` in `web/lib/types/database.ts`
- Pattern: Database-first typing with TypeScript mapped types for Insert/Update/Row

**Telemetry Snapshot:**
- Purpose: Point-in-time capture of truck state (speed, RPM, fuel, damage)
- Examples: `Database['public']['Tables']['telemetry']['Row']`
- Pattern: Time-series data with user_id + job_id foreign keys, indexed by created_at

**API Key Authentication:**
- Purpose: Allows C# plugin to authenticate without browser cookies
- Examples: `user_preferences.api_key` field, API route validation in `web/app/api/telemetry/route.ts`
- Pattern: Generate unique key on user signup (`rm_` + 64 hex chars), store in preferences, validate on each request

**Dashboard Profile:**
- Purpose: User-customizable dashboard layout with preset and custom profiles
- Examples: `PRESET_PROFILES` in `web/components/telemetry/profile-selector.tsx`
- Pattern: JSON serializable configuration stored in localStorage, controls visible cards and gauge styles

## Entry Points

**C# Plugin Entry:**
- Location: `plugin/RoadMasterPlugin/Plugin.cs` → `Main()`
- Triggers: User manually runs `RoadMasterPlugin.exe`
- Responsibilities: Load config, connect to SDK, subscribe to events, poll telemetry at 1Hz

**Web Application Entry:**
- Location: `web/app/layout.tsx` (root), `web/app/page.tsx` (landing)
- Triggers: User navigates to domain
- Responsibilities: Check auth status, redirect to dashboard if logged in, show landing page if not

**Dashboard Entry:**
- Location: `web/app/(dashboard)/layout.tsx`
- Triggers: Authenticated user navigates to `/dashboard` or any dashboard route
- Responsibilities: Server-side auth check, redirect to login if unauthenticated, render sidebar + content

**API Telemetry Endpoint:**
- Location: `web/app/api/telemetry/route.ts`
- Triggers: C# plugin POSTs telemetry every 1 second
- Responsibilities: Validate API key, insert telemetry, trigger real-time broadcast

**Middleware:**
- Location: `web/middleware.ts` → `web/lib/supabase/middleware.ts`
- Triggers: Every HTTP request (except static assets)
- Responsibilities: Refresh Supabase session, redirect unauthenticated users to login

## Error Handling

**Strategy:** Graceful degradation with fallback mechanisms

**Patterns:**
- API Routes: Try-catch blocks return JSON error responses with appropriate status codes (400, 401, 500)
- C# Plugin: Console logging with error messages, continues running after network failures
- Frontend Telemetry: Fallback polling (10s interval) if WebSocket connection fails or times out
- Database Triggers: Use `COALESCE()` to handle NULL values in calculations, skip updates if data incomplete
- Real-time Subscription: Throttle updates to 500ms to prevent UI thrashing, check `mounted` flag before state updates

## Cross-Cutting Concerns

**Logging:** Console.log in TypeScript, Console.WriteLine in C#, no centralized logging service

**Validation:** API routes validate required fields before database operations, return 400 on missing data

**Authentication:**
- Frontend: Supabase Auth with cookie-based sessions, middleware enforces on protected routes
- API Routes: API key lookup via `user_preferences.api_key`, service client bypasses RLS
- Database: Row Level Security policies enforce `auth.uid() = user_id` on all user tables

---

*Architecture analysis: 2026-01-19*
