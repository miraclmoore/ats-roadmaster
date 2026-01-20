# External Integrations

**Analysis Date:** 2026-01-19

## APIs

**Anthropic Claude:**
- Purpose: AI-powered dispatcher recommendations
- Model: claude-sonnet-4-20250514
- Usage: Streaming chat responses in `web/app/api/ai/chat/route.ts`
- Authentication: API key (`ANTHROPIC_API_KEY`)
- SDK: `@anthropic-ai/sdk` v0.71.2
- Rate limits: Not enforced in code

**American Truck Simulator SDK:**
- Purpose: Game telemetry capture
- Integration: Memory-mapped file at `Local\\SCSTelemetry`
- SDK: RenCloud wrapper (SCSSdkClient)
- Data format: Binary struct from `scs-telemetry.dll`
- Sampling rate: 1Hz (plugin polls every 1000ms)

## Database

**Supabase PostgreSQL:**
- Purpose: Primary data storage
- Tables: `jobs`, `telemetry`, `achievements`, `user_achievements`, `company_stats`, `user_preferences`
- Access patterns:
  - Browser: `web/lib/supabase/client.ts` (createBrowserClient)
  - Server: `web/lib/supabase/server.ts` (createServerClient)
  - API routes: `web/lib/supabase/service.ts` (service role client)
- Real-time: Supabase Realtime for live telemetry updates

**File Storage:**
- Not implemented (planned for PDF exports per CLAUDE.md)

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Implementation: Row Level Security (RLS) policies
  - Session management: SSR-compatible via `@supabase/ssr`
  - Middleware: `web/lib/supabase/middleware.ts`
  - Login: `web/app/(auth)/login/page.tsx`
  - Signup: `web/app/(auth)/signup/page.tsx`
  - API authentication: Custom API keys in `user_preferences` table

**API Key System:**
- Custom API keys for SDK plugin authentication
  - Stored in: `user_preferences.api_key` (unique)
  - Generation: `web/app/api/user/regenerate-key/route.ts`
  - Validation: API routes check key and resolve to `user_id`
  - Format: Likely `rm_` prefixed based on config example

## Monitoring & Observability

**Error Tracking:**
- None (console.error only)

**Logs:**
- Console-based logging in both web app and C# plugin
- No structured logging framework detected

## CI/CD & Deployment

**Hosting:**
- Not specified (likely Vercel based on Next.js conventions)

**CI Pipeline:**
- Not configured

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project endpoint
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side Supabase admin key
- `ANTHROPIC_API_KEY` - Claude API credentials
- `NEXT_PUBLIC_APP_URL` - Web dashboard URL for CORS/redirects

**Secrets location:**
- Local development: `.env.local` (gitignored)
- Production: Deployment platform env vars (e.g., Vercel)
- Plugin config: `plugin/RoadMasterPlugin/config.json` (user-editable)

## Webhooks & Callbacks

**Incoming:**
- `/api/telemetry` - Receives 1Hz telemetry data from C# plugin
  - Method: POST
  - Auth: API key in request body
  - Payload: Real-time truck/job data
  - Source: `plugin/RoadMasterPlugin/ApiClient.cs` SendTelemetry()

- `/api/jobs/start` - Job started event from plugin
  - Method: POST
  - Auth: API key
  - Payload: Job details (route, cargo, income, distance)

- `/api/jobs/complete` - Job completion event from plugin
  - Method: POST
  - Auth: API key
  - Payload: Job ID, late delivery status

**Outgoing:**
- None detected

## Real-time Data Flow

**Supabase Realtime:**
- Channel subscriptions for live telemetry updates
- Used in: Dashboard live view (`web/app/(dashboard)/live/page.tsx`)
- Event: `postgres_changes` on `telemetry` table INSERT
- Filter: `user_id=eq.{userId}`

**Plugin → Cloud Pipeline:**
1. ATS game writes to memory-mapped file
2. C# plugin reads via RenCloud SDK (1Hz sampling)
3. Plugin POSTs to Next.js API routes
4. API routes insert to Supabase PostgreSQL
5. Supabase broadcasts changes via WebSocket
6. React components update in real-time

---

*Integration audit: 2026-01-19*
