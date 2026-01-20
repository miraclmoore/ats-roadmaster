# Codebase Structure

**Analysis Date:** 2026-01-19

## Directory Layout

```
ats-roadmaster/
├── plugin/                     # C# telemetry plugin (desktop app)
│   └── RoadMasterPlugin/
│       ├── ApiClient.cs
│       ├── Plugin.cs
│       ├── Models/
│       ├── SCSSdkClient/       # RenCloud SDK wrapper
│       └── config.json
├── web/                        # Next.js 16 web application
│   ├── app/
│   │   ├── (auth)/            # Route group: Auth pages
│   │   ├── (dashboard)/       # Route group: Dashboard pages
│   │   ├── api/               # API route handlers
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/            # Layout components (sidebar, header)
│   │   ├── telemetry/         # Telemetry-specific UI
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── calculations/      # Business logic (profit, fuel, efficiency)
│   │   ├── supabase/          # Supabase client factories
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Utility functions
│   ├── middleware.ts          # Auth middleware
│   └── package.json
├── supabase/
│   └── migrations/            # Database migrations
├── docs/                      # Documentation
├── scripts/                   # Build/deployment scripts
└── specs/                     # Technical specifications
```

## Directory Purposes

**plugin/RoadMasterPlugin/**
- Purpose: C# console application that bridges ATS game and cloud API
- Contains: SDK wrappers, HTTP client, event handlers, configuration
- Key files: `Plugin.cs` (main entry point), `ApiClient.cs` (REST API communication), `config.json` (API key + URL)

**web/app/(auth)/**
- Purpose: Authentication pages (login, signup)
- Contains: Server Components for auth forms
- Key files: `login/page.tsx`, `signup/page.tsx`

**web/app/(dashboard)/**
- Purpose: Protected dashboard pages requiring authentication
- Contains: Server and Client Components for each dashboard section
- Key files: `layout.tsx` (auth check + sidebar), `live/page.tsx` (real-time telemetry), `dashboard/page.tsx` (overview), `jobs/page.tsx`, `analytics/page.tsx`, `ai/page.tsx`, `settings/page.tsx`

**web/app/api/**
- Purpose: Backend API endpoints (Next.js Route Handlers)
- Contains: HTTP request handlers for telemetry ingestion, job lifecycle, AI chat
- Key files: `telemetry/route.ts` (POST telemetry), `jobs/start/route.ts`, `jobs/complete/route.ts`, `ai/chat/route.ts`, `user/preferences/route.ts`, `user/regenerate-key/route.ts`

**web/components/layout/**
- Purpose: Reusable layout components for dashboard structure
- Contains: Sidebar, header, page headers
- Key files: `dashboard-layout-client.tsx`, `sidebar.tsx`, `page-header.tsx`

**web/components/telemetry/**
- Purpose: Telemetry-specific UI components
- Contains: Live gauges, alerts, route advisor, trend charts
- Key files: `alerts.tsx`, `route-advisor-card.tsx`, `driver-assists.tsx`, `profile-selector.tsx`, `trend-cards.tsx`, `sparkline.tsx`

**web/components/ui/**
- Purpose: Generic reusable UI components
- Contains: Gauges, cards, empty states, metrics
- Key files: `gauge.tsx`, `stats-card.tsx`, `metric-card.tsx`, `empty-state.tsx`, `segmented-fuel-gauge.tsx`

**web/lib/calculations/**
- Purpose: Pure business logic functions (no side effects)
- Contains: Profit calculations, fuel economy, performance metrics
- Key files: `profit.ts` (calculateJobProfit, calculateProfitPerMile), `efficiency.ts`, `performance.ts`

**web/lib/supabase/**
- Purpose: Supabase client creation for different contexts
- Contains: Factory functions for browser, server, service clients
- Key files: `client.ts` (browser client), `server.ts` (server client with cookies), `service.ts` (service role for API routes), `middleware.ts` (session refresh)

**web/lib/types/**
- Purpose: TypeScript type definitions
- Contains: Database schema types generated from Supabase
- Key files: `database.ts` (Database type with all table schemas)

**supabase/migrations/**
- Purpose: Database schema version control
- Contains: SQL migration files with CREATE TABLE, triggers, RLS policies
- Key files: `001_initial_schema.sql` (jobs, telemetry, achievements, user_preferences tables), `002_dashboard_enhancements.sql`

## Key File Locations

**Entry Points:**
- `plugin/RoadMasterPlugin/Plugin.cs`: C# plugin main entry
- `web/app/layout.tsx`: Next.js root layout
- `web/app/page.tsx`: Landing page (redirects to dashboard if authenticated)
- `web/app/(dashboard)/layout.tsx`: Dashboard entry with auth check
- `web/middleware.ts`: Request interceptor for auth

**Configuration:**
- `plugin/RoadMasterPlugin/config.json`: API key and base URL for plugin
- `web/package.json`: NPM dependencies and scripts
- `plugin/RoadMasterPlugin/RoadMasterPlugin.csproj`: C# project config
- `web/middleware.ts`: Protected route patterns

**Core Logic:**
- `web/lib/calculations/profit.ts`: Job profit/expense calculations
- `web/app/api/telemetry/route.ts`: Telemetry ingestion endpoint
- `web/app/api/jobs/start/route.ts`: Job creation endpoint
- `supabase/migrations/001_initial_schema.sql`: Database trigger `calculate_job_profit()`

**Testing:**
- Not detected (no test files found)

## Naming Conventions

**Files:**
- React Components: PascalCase with `.tsx` extension (`Gauge.tsx`, `RouteAdvisorCard.tsx`)
- API Routes: lowercase with `route.ts` extension (`telemetry/route.ts`)
- Library functions: lowercase with `.ts` extension (`profit.ts`, `client.ts`)
- C# files: PascalCase with `.cs` extension (`ApiClient.cs`, `Plugin.cs`)

**Directories:**
- Next.js route groups: parentheses `(auth)`, `(dashboard)`
- Component groups: lowercase plural (`components/telemetry/`, `components/ui/`)
- Library modules: lowercase singular or plural (`lib/calculations/`, `lib/supabase/`)

**Functions:**
- TypeScript: camelCase (`calculateJobProfit`, `createClient`)
- React Components: PascalCase (`LiveTelemetryPage`, `DashboardLayoutClient`)
- C# methods: PascalCase (`StartJob`, `SendTelemetry`)

**Variables:**
- TypeScript: camelCase (`telemetry`, `currentJob`, `isConnected`)
- React props: camelCase (`userEmail`, `onSignOut`)
- Environment vars: SCREAMING_SNAKE_CASE (`NEXT_PUBLIC_SUPABASE_URL`, `ANTHROPIC_API_KEY`)

## Where to Add New Code

**New Dashboard Page:**
- Primary code: `web/app/(dashboard)/[page-name]/page.tsx`
- Tests: Not applicable (no test framework)
- Add route to: `web/components/layout/sidebar.tsx` (navigation links)

**New API Endpoint:**
- Implementation: `web/app/api/[endpoint]/route.ts`
- Use: `createServiceClient()` from `web/lib/supabase/service.ts` for database access

**New Component:**
- Reusable UI: `web/components/ui/[component-name].tsx`
- Telemetry-specific: `web/components/telemetry/[component-name].tsx`
- Layout component: `web/components/layout/[component-name].tsx`

**New Calculation Function:**
- Implementation: `web/lib/calculations/[domain].ts`
- Export pure functions (no side effects)
- Import from: API routes, components, or other lib files

**New Database Table:**
- Migration: `supabase/migrations/[XXX]_[description].sql`
- Add RLS policy: Enable RLS and create policy in same migration
- Update types: Run Supabase type generation to update `web/lib/types/database.ts`

**Utilities:**
- Shared helpers: `web/lib/utils.ts` or `web/lib/utils/[module].ts`
- Example: `web/lib/utils/city-flags.ts` for city flag emoji mapping

## Special Directories

**.planning/**
- Purpose: GSD command planning and codebase analysis documents
- Generated: By GSD commands
- Committed: Yes (part of project documentation)

**.claude/**
- Purpose: Claude Code configuration and custom commands
- Generated: By user or GSD setup
- Committed: Yes (project-specific AI tooling)

**.serena/**
- Purpose: Serena AI memory cache (legacy)
- Generated: Yes (runtime cache)
- Committed: No (ignored)

**.specify/**
- Purpose: Specify AI tooling
- Generated: Yes
- Committed: Partial (templates committed, memory ignored)

**web/.next/**
- Purpose: Next.js build output
- Generated: Yes (on `npm run build` or `npm run dev`)
- Committed: No (ignored)

**web/node_modules/**
- Purpose: NPM package dependencies
- Generated: Yes (on `npm install`)
- Committed: No (ignored)

**plugin/RoadMasterPlugin/bin/**, **plugin/RoadMasterPlugin/obj/**
- Purpose: C# build artifacts
- Generated: Yes (on compilation)
- Committed: No (ignored)

---

*Structure analysis: 2026-01-19*
