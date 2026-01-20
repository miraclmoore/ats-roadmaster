# Architecture Research: Dashboard Systems

**Domain:** Real-time Dashboard with Design System
**Researched:** 2026-01-20
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    DESIGN SYSTEM LAYER                           │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Atoms  │  │Molecules │  │Organisms │  │Templates │         │
│  │(shadcn) │  │ (Cards)  │  │ (Dashbd) │  │ (Layouts)│         │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘         │
│       │            │             │             │                │
├───────┴────────────┴─────────────┴─────────────┴────────────────┤
│                    PRESENTATION LAYER                            │
│                    (Next.js App Router)                          │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐             ┌─────────────────┐             │
│  │     Server     │             │     Client      │             │
│  │  Components    │ ─children→  │   Components    │             │
│  │ (Data Fetch)   │             │ (Interactivity) │             │
│  └────────┬───────┘             └────────┬────────┘             │
│           │                              │                      │
├───────────┴──────────────────────────────┴──────────────────────┤
│                    STATE MANAGEMENT LAYER                        │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐            │
│  │   Server    │  │   Realtime   │  │    Local    │            │
│  │   State     │  │  State (WS)  │  │   State     │            │
│  │ (Supabase)  │  │  (Throttled) │  │(localStorage)│            │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘            │
│         │                │                  │                   │
├─────────┴────────────────┴──────────────────┴───────────────────┤
│                    DATA & SERVICES LAYER                         │
│  ┌────────────────────────────────────────────────────────┐     │
│  │          Supabase (PostgreSQL + Realtime)              │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Design System Atoms | Base UI primitives from shadcn/ui | Button, Input, Card, Badge components |
| Design System Molecules | 2-3 atoms composed together | GaugeWidget, StatCard, AlertBanner |
| Design System Organisms | Complex, domain-specific components | LiveTelemetryDashboard, JobsTable, RouteAdvisorCard |
| Server Components | Data fetching, auth checks, initial render | Page.tsx files, layout.tsx with Supabase queries |
| Client Components | Interactivity, real-time subscriptions, animations | "use client" components with hooks, event handlers |
| State Managers | Coordinating real-time updates with throttling | useEffect + Supabase Realtime + 500ms throttle |
| Testing Layer | Unit, integration, E2E test coverage | Vitest + React Testing Library + Playwright |

## Recommended Project Structure

```
web/
├── app/                        # Next.js App Router (routing)
│   ├── (dashboard)/           # Route group (shares layout)
│   │   ├── layout.tsx         # Server: Auth check, sidebar
│   │   ├── live/              # Live telemetry page
│   │   │   └── page.tsx       # Client: Real-time updates
│   │   ├── jobs/              # Jobs page
│   │   └── analytics/         # Analytics page
│   └── api/                   # API routes
│       ├── telemetry/route.ts # Ingests data from C# plugin
│       └── ai/chat/route.ts   # AI streaming responses
├── components/                # Design system + page components
│   ├── ui/                    # Atoms (shadcn/ui components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── gauge.tsx
│   │   └── badge.tsx
│   ├── widgets/               # Molecules (composed components)
│   │   ├── stat-card.tsx      # Displays single metric
│   │   ├── gauge-widget.tsx   # Gauge with label/value
│   │   └── alert-banner.tsx   # Status alerts
│   ├── telemetry/             # Organisms (domain-specific)
│   │   ├── live-dashboard.tsx         # Full live view
│   │   ├── route-advisor-card.tsx     # Job routing advice
│   │   └── profile-selector.tsx       # Dashboard customization
│   ├── jobs/                  # Job-specific organisms
│   │   ├── jobs-table.tsx
│   │   └── job-card.tsx
│   └── layout/                # Layout components
│       ├── sidebar.tsx        # Navigation
│       ├── page-header.tsx
│       └── dashboard-layout-client.tsx
├── lib/                       # Utilities and services
│   ├── supabase/              # Supabase clients
│   │   ├── client.ts          # Browser client (RLS)
│   │   ├── server.ts          # Server client (cookies)
│   │   └── service.ts         # Service role (bypasses RLS)
│   ├── calculations/          # Business logic (pure functions)
│   │   ├── profit.ts
│   │   ├── efficiency.ts
│   │   └── performance.ts
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-realtime-telemetry.ts
│   │   ├── use-throttle.ts
│   │   └── use-live-job.ts
│   └── types/                 # TypeScript types
│       └── database.ts        # Generated from Supabase
├── tests/                     # Testing infrastructure
│   ├── unit/                  # Vitest unit tests
│   │   ├── calculations.test.ts
│   │   └── hooks.test.ts
│   ├── integration/           # Vitest integration tests
│   │   ├── api-routes.test.ts
│   │   └── realtime.test.ts
│   └── e2e/                   # Playwright E2E tests
│       ├── dashboard.spec.ts
│       └── live-telemetry.spec.ts
└── vitest.config.ts           # Vitest configuration
```

### Structure Rationale

- **components/ui/:** All shadcn/ui components (atoms) go here — these are the base primitives that never contain business logic
- **components/widgets/:** Reusable composed components (molecules) — combine 2-3 atoms, still domain-agnostic
- **components/[domain]/:** Domain-specific components (organisms) — telemetry, jobs, analytics — these know about your business domain
- **app/(dashboard)/:** Route groups share layouts without affecting URL structure — keeps authentication and sidebar logic DRY
- **lib/hooks/:** Custom hooks centralize stateful logic — makes components thin and testable
- **tests/ (separate):** Co-located tests clutter the component tree — dedicated test directory with mirrored structure is cleaner for dashboards with 50+ components

## Architectural Patterns

### Pattern 1: Server-First with Client Islands

**What:** Server Components by default, "use client" only where needed for interactivity

**When to use:** Always in Next.js App Router — it's the default paradigm

**Trade-offs:**
- **Pros:** Smaller bundles, faster initial load, automatic data fetching optimization
- **Cons:** Requires understanding component boundaries, can't use hooks in Server Components

**Example:**
```typescript
// app/(dashboard)/live/page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server';
import { LiveDashboard } from '@/components/telemetry/live-dashboard';

export default async function LivePage() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  // Initial data fetch happens on server
  const { data: currentJob } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', user.id)
    .is('completed_at', null)
    .single();

  // Pass data to Client Component
  return <LiveDashboard userId={user.id} initialJob={currentJob} />;
}

// components/telemetry/live-dashboard.tsx (Client Component)
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function LiveDashboard({ userId, initialJob }) {
  const [job, setJob] = useState(initialJob);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('jobs')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'jobs', filter: `user_id=eq.${userId}` },
        (payload) => setJob(payload.new)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId]);

  // Interactive UI with real-time updates
}
```

### Pattern 2: Throttled Real-Time Updates

**What:** Throttle high-frequency WebSocket updates to prevent UI thrashing

**When to use:** When receiving updates faster than 60fps (16ms) — common with 1Hz telemetry

**Trade-offs:**
- **Pros:** Prevents React re-render storms, smoother animations, lower CPU usage
- **Cons:** Introduces latency (500ms typical), can feel less "real-time" if too aggressive

**Example:**
```typescript
// lib/hooks/use-realtime-telemetry.ts
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useRealtimeTelemetry(userId: string) {
  const [telemetry, setTelemetry] = useState(null);
  const throttleRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('telemetry')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'telemetry', filter: `user_id=eq.${userId}` },
        (payload) => {
          // Store the latest data
          pendingDataRef.current = payload.new;

          // Throttle to 500ms (2Hz)
          if (!throttleRef.current) {
            throttleRef.current = setTimeout(() => {
              setTelemetry(pendingDataRef.current);
              throttleRef.current = null;
            }, 500);
          }
        }
      )
      .subscribe();

    return () => {
      if (throttleRef.current) clearTimeout(throttleRef.current);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return telemetry;
}
```

### Pattern 3: Atomic Design with shadcn/ui as Atoms

**What:** Treat all shadcn/ui components as atoms, build molecules and organisms on top

**When to use:** When building a design system for 10+ pages — ensures consistency

**Trade-offs:**
- **Pros:** Consistent styling, easy to update globally, clear component hierarchy
- **Cons:** More files to maintain, can feel over-engineered for simple projects

**Example:**
```typescript
// components/ui/gauge.tsx (Atom — from shadcn/ui)
export function Gauge({ value, max, color }) {
  // Base gauge component
}

// components/widgets/gauge-widget.tsx (Molecule)
import { Gauge } from '@/components/ui/gauge';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function GaugeWidget({ label, value, unit, max, status }) {
  return (
    <Card>
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Badge variant={status}>{status}</Badge>
      </div>
      <Gauge value={value} max={max} />
      <div className="text-2xl font-bold mt-2">
        {value} {unit}
      </div>
    </Card>
  );
}

// components/telemetry/live-dashboard.tsx (Organism)
import { GaugeWidget } from '@/components/widgets/gauge-widget';

export function LiveDashboard({ telemetry }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <GaugeWidget label="Speed" value={telemetry.speed} unit="mph" max={80} status="normal" />
      <GaugeWidget label="RPM" value={telemetry.rpm} unit="rpm" max={2000} status="warning" />
      <GaugeWidget label="Fuel" value={telemetry.fuel_percent} unit="%" max={100} status="critical" />
    </div>
  );
}
```

### Pattern 4: Optimistic UI with Reconciliation

**What:** Update UI immediately (optimistic), then reconcile with server response

**When to use:** User actions that modify data (forms, toggles) — makes UI feel instant

**Trade-offs:**
- **Pros:** Perceived performance boost, better UX
- **Cons:** Requires rollback logic, can confuse users if server rejects

**Example:**
```typescript
'use client';

import { useState, useOptimistic } from 'react';
import { updatePreference } from '@/app/actions/preferences';

export function PreferenceToggle({ userId, initialValue }) {
  const [optimisticValue, setOptimisticValue] = useOptimistic(initialValue);

  async function handleToggle() {
    // Update UI immediately
    setOptimisticValue(!optimisticValue);

    try {
      // Send to server
      await updatePreference(userId, !optimisticValue);
    } catch (error) {
      // Rollback on error
      setOptimisticValue(optimisticValue);
      toast.error('Failed to update preference');
    }
  }

  return (
    <Switch checked={optimisticValue} onCheckedChange={handleToggle} />
  );
}
```

### Pattern 5: Stale-While-Revalidate Caching

**What:** Show cached data immediately, refetch in background, update when fresh data arrives

**When to use:** Dashboard data that changes slowly (job history, analytics) — not real-time telemetry

**Trade-offs:**
- **Pros:** Instant perceived load, reduces database queries
- **Cons:** Can show stale data briefly, requires cache invalidation strategy

**Example:**
```typescript
// Using Next.js fetch with revalidation
async function getJobHistory(userId: string) {
  const res = await fetch(`/api/jobs?userId=${userId}`, {
    next: {
      revalidate: 60, // Revalidate every 60 seconds
      tags: ['jobs'] // Tag for manual invalidation
    }
  });

  return res.json();
}

// Manual invalidation on job completion
import { revalidateTag } from 'next/cache';

export async function completeJob(jobId: string) {
  await supabase
    .from('jobs')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', jobId);

  // Invalidate cached job data
  revalidateTag('jobs');
}
```

## Data Flow

### Real-Time Telemetry Flow

```
[C# Plugin] (1Hz sampling)
    ↓ HTTP POST /api/telemetry
[Next.js API Route] (validates API key)
    ↓ INSERT
[Supabase PostgreSQL]
    ↓ WAL → Realtime broadcast
[WebSocket Connection] (all connected clients)
    ↓ 500ms throttle
[React State Update] (setTelemetry)
    ↓ re-render
[UI Update] (gauge components)
```

### State Management Strategy

```
┌─────────────────────────────────────────────────────────┐
│                   State Categories                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Server State (Supabase)                                 │
│  - Job history, analytics, user preferences              │
│  - Cached with Next.js fetch (stale-while-revalidate)    │
│  - Revalidated: 60s for slow data, 0s for real-time     │
│                                                          │
│  Real-Time State (WebSocket)                             │
│  - Current telemetry, active job, live alerts            │
│  - Managed with useEffect + Supabase Realtime            │
│  - Throttled: 500ms to prevent UI thrashing              │
│                                                          │
│  Local State (useState, localStorage)                    │
│  - Dashboard profile (visible cards, gauge styles)       │
│  - UI state (modals, dropdowns, filters)                 │
│  - Persisted: localStorage for preferences               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Key Data Flows

1. **Initial Page Load:** Server Component fetches initial data from Supabase → passes to Client Component → Client Component subscribes to real-time updates → Throttles to 500ms → Updates UI
2. **User Action (Form Submit):** Client optimistically updates UI → Sends to API route → API validates and writes to database → Real-time broadcast confirms → Client reconciles state
3. **Background Sync:** Periodic revalidation (60s) → Fetches fresh data from server → Compares with cache → Updates if changed → Triggers re-render

## Testing Architecture

### Testing Strategy Overview

| Test Type | Tool | Coverage Target | When to Run |
|-----------|------|----------------|-------------|
| Unit Tests | Vitest + React Testing Library | Components, hooks, utilities | On every commit (fast) |
| Integration Tests | Vitest + MSW | API routes, WebSocket mocks | On PR (medium) |
| E2E Tests | Playwright | Critical user flows | Nightly + pre-deploy (slow) |
| Visual Regression | Playwright + Chromatic | UI consistency | On design changes |

### Unit Testing Pattern

**Structure:**
```
tests/unit/
├── components/          # Component tests
│   ├── gauge.test.tsx
│   └── gauge-widget.test.tsx
├── hooks/              # Hook tests
│   ├── use-throttle.test.ts
│   └── use-realtime-telemetry.test.ts
└── calculations/       # Pure function tests
    └── profit.test.ts
```

**Example:**
```typescript
// tests/unit/hooks/use-throttle.test.ts
import { renderHook, act } from '@testing-library/react';
import { useThrottle } from '@/lib/hooks/use-throttle';
import { vi } from 'vitest';

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throttles rapid updates to specified interval', () => {
    const { result } = renderHook(() => useThrottle(100));
    const callback = vi.fn();

    // Trigger 10 rapid updates
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current(callback, i);
      }
    });

    // Only first call executes immediately
    expect(callback).toHaveBeenCalledTimes(1);

    // Advance time by 100ms
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Second call executes after throttle period
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(9); // Latest value
  });
});
```

### Integration Testing Pattern

**WebSocket Mocking:**
```typescript
// tests/integration/realtime.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useRealtimeTelemetry } from '@/lib/hooks/use-realtime-telemetry';
import WS from 'vitest-websocket-mock';

describe('Real-time telemetry integration', () => {
  let server: WS;

  beforeEach(() => {
    server = new WS('wss://your-project.supabase.co/realtime/v1/websocket');
  });

  afterEach(() => {
    WS.clean();
  });

  it('receives and throttles telemetry updates', async () => {
    const { result } = renderHook(() => useRealtimeTelemetry('user-123'));

    // Wait for WebSocket connection
    await server.connected;

    // Simulate server sending telemetry update
    server.send(JSON.stringify({
      event: 'postgres_changes',
      payload: {
        data: { speed: 65, rpm: 1500, fuel_percent: 75 }
      }
    }));

    // Wait for throttled update (500ms)
    await waitFor(() => {
      expect(result.current).toEqual({
        speed: 65,
        rpm: 1500,
        fuel_percent: 75
      });
    }, { timeout: 1000 });
  });
});
```

### E2E Testing Pattern

**Critical Flow Testing:**
```typescript
// tests/e2e/live-telemetry.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Live Telemetry Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to live page
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await page.click('a[href="/live"]');
  });

  test('displays real-time telemetry updates', async ({ page }) => {
    // Wait for initial load
    await expect(page.locator('text=Speed')).toBeVisible();

    // Get initial speed value
    const initialSpeed = await page.locator('[data-testid="speed-value"]').textContent();

    // Wait for WebSocket update (telemetry arrives every 1s, throttled to 500ms)
    await page.waitForTimeout(1500);

    // Verify speed updated
    const updatedSpeed = await page.locator('[data-testid="speed-value"]').textContent();
    expect(updatedSpeed).not.toBe(initialSpeed);
  });

  test('handles connection loss gracefully', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true);

    // Should show connection error
    await expect(page.locator('text=Connection lost')).toBeVisible();

    // Restore connection
    await page.context().setOffline(false);

    // Should reconnect
    await expect(page.locator('text=Connected')).toBeVisible();
  });
});
```

### Visual Regression Testing Pattern

**Setup with Chromatic:**
```typescript
// tests/visual/dashboard.spec.ts
import { test } from '@playwright/test';
import { chromatic } from 'playwright-chromatic';

test.describe('Dashboard Visual Tests', () => {
  test('live telemetry dashboard matches baseline', async ({ page }) => {
    await page.goto('/live');
    await page.waitForLoadState('networkidle');

    // Take Chromatic snapshot
    await chromatic(page, 'live-dashboard-default');
  });

  test('dashboard with custom profile', async ({ page }) => {
    await page.goto('/live');

    // Switch to custom profile
    await page.click('[data-testid="profile-selector"]');
    await page.click('text=Custom Profile');
    await page.waitForTimeout(500); // Wait for animations

    // Snapshot custom layout
    await chromatic(page, 'live-dashboard-custom-profile');
  });
});
```

## Performance Optimization Patterns

### Pattern 1: Component-Level Code Splitting

**What:** Use dynamic imports for heavy components loaded conditionally

**When to use:** Large chart libraries, admin panels, rarely-used features

**Example:**
```typescript
// app/(dashboard)/analytics/page.tsx
import dynamic from 'next/dynamic';

// Load chart library only when needed
const AdvancedCharts = dynamic(() => import('@/components/analytics/advanced-charts'), {
  loading: () => <div>Loading charts...</div>,
  ssr: false // Don't include in server bundle
});

export default function AnalyticsPage() {
  return (
    <div>
      <AdvancedCharts />
    </div>
  );
}
```

### Pattern 2: React 19 Compiler Optimization

**What:** React 19 compiler automatically memoizes components — remove manual useMemo/useCallback

**When to use:** Always with React 19+ — the compiler is smarter than manual optimization

**Example:**
```typescript
// ❌ OLD (React 18 — manual memoization)
import { useMemo, useCallback } from 'react';

function Dashboard({ telemetry, jobs }) {
  const profitData = useMemo(() => calculateProfit(jobs), [jobs]);
  const handleRefresh = useCallback(() => refresh(), []);

  return <Chart data={profitData} onRefresh={handleRefresh} />;
}

// ✅ NEW (React 19 — compiler handles it)
function Dashboard({ telemetry, jobs }) {
  const profitData = calculateProfit(jobs); // Auto-memoized
  const handleRefresh = () => refresh();     // Auto-memoized

  return <Chart data={profitData} onRefresh={handleRefresh} />;
}
```

### Pattern 3: Virtualized Lists for Large Datasets

**What:** Only render visible rows when displaying 1000+ items

**When to use:** Job history tables, telemetry logs, any list >100 items

**Example:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function JobHistoryTable({ jobs }) {
  const parentRef = useRef();

  const virtualizer = useVirtualizer({
    count: jobs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Row height
    overscan: 5 // Render 5 extra rows off-screen
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <JobRow job={jobs[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Pattern 4: Database Query Optimization

**What:** Use Postgres indexes, limit result sets, paginate large queries

**When to use:** Any query returning >100 rows or running frequently (>10 req/sec)

**Example:**
```sql
-- ❌ BAD: Full table scan, no limit
SELECT * FROM telemetry WHERE user_id = 'user-123';

-- ✅ GOOD: Index + limit + pagination
CREATE INDEX idx_telemetry_user_created ON telemetry(user_id, created_at DESC);

SELECT * FROM telemetry
WHERE user_id = 'user-123'
  AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 100;
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 users | Current architecture is perfect — no changes needed. Single Supabase instance handles everything. |
| 100-1k users | Add database connection pooling (Supabase handles automatically). Enable Next.js caching (fetch with revalidate). Consider CDN for static assets. |
| 1k-10k users | Add read replicas for analytics queries (keep writes on primary). Implement WebSocket connection pooling (Supabase Realtime scales to 10k+ connections). Add Redis for rate limiting on API routes. |
| 10k+ users | Move telemetry ingestion to queue (Kafka/RabbitMQ) to handle spikes. Implement time-series database for old telemetry (TimescaleDB). Consider sharding users by region. Add full-page caching (Vercel Edge). |

### Scaling Priorities

1. **First bottleneck (500-1k users):** Database connections exhausted. Solution: Enable Supabase connection pooling (automatic), add read replicas for heavy analytics queries.
2. **Second bottleneck (5k users):** API route rate limiting needed. Solution: Add Upstash Redis for rate limiting per API key, return 429 errors with Retry-After headers.
3. **Third bottleneck (10k users):** Real-time telemetry ingestion can't keep up during peak hours. Solution: Add message queue (Inngest/BullMQ) to buffer incoming telemetry, process in batches.

## Anti-Patterns

### Anti-Pattern 1: "use client" at the Top Level

**What people do:** Add "use client" to page.tsx files because they need a single useState hook

**Why it's wrong:** Loses server-side benefits (data fetching, SEO), increases bundle size, prevents static optimization

**Do this instead:** Keep page.tsx as Server Component, pass data to a Client Component child

```typescript
// ❌ BAD
'use client';
export default function Page() {
  const [count, setCount] = useState(0);
  const jobs = await fetchJobs(); // ERROR: Can't use async in client
  return <div>...</div>;
}

// ✅ GOOD
export default async function Page() {
  const jobs = await fetchJobs(); // Fetches on server
  return <ClientDashboard jobs={jobs} />; // Passes to client
}
```

### Anti-Pattern 2: No Throttling on Real-Time Updates

**What people do:** Update UI state immediately on every WebSocket message

**Why it's wrong:** Causes 60+ re-renders per second, UI becomes janky, CPU spikes, animations stutter

**Do this instead:** Throttle updates to 500ms (2Hz) — still feels real-time, much smoother

```typescript
// ❌ BAD: Updates on every message (1Hz = smooth, but 10Hz+ = jank)
channel.on('INSERT', (payload) => {
  setTelemetry(payload.new); // Causes immediate re-render
});

// ✅ GOOD: Throttled to 500ms
let pendingData = null;
let throttleTimer = null;

channel.on('INSERT', (payload) => {
  pendingData = payload.new;

  if (!throttleTimer) {
    throttleTimer = setTimeout(() => {
      setTelemetry(pendingData);
      throttleTimer = null;
    }, 500);
  }
});
```

### Anti-Pattern 3: Testing Implementation Details

**What people do:** Test internal component state, mock everything, test props directly

**Why it's wrong:** Tests break on refactors even when behavior unchanged, hard to maintain

**Do this instead:** Test user-visible behavior, minimal mocking, integration over isolation

```typescript
// ❌ BAD: Testing implementation
it('updates state when data changes', () => {
  const { result } = renderHook(() => useRealtimeTelemetry());
  expect(result.current.loading).toBe(true); // Internal state
});

// ✅ GOOD: Testing behavior
it('displays updated speed when telemetry arrives', async () => {
  render(<LiveDashboard userId="user-123" />);

  expect(screen.getByText(/Speed/i)).toBeVisible();
  expect(screen.getByTestId('speed-value')).toHaveTextContent('0 mph');

  // Simulate WebSocket update
  mockWebSocket.send({ speed: 65 });

  await waitFor(() => {
    expect(screen.getByTestId('speed-value')).toHaveTextContent('65 mph');
  });
});
```

### Anti-Pattern 4: Premature Design System Abstraction

**What people do:** Build a full atomic design system with atoms/molecules/organisms from day 1

**Why it's wrong:** Over-engineering for 2-3 pages, slows development, unclear component boundaries

**Do this instead:** Use shadcn/ui directly until you have 5+ pages, then extract patterns

```typescript
// ❌ BAD: Over-abstracted for small project
// components/atoms/text.tsx
export const Text = ({ variant, size, weight, color }) => ...

// components/molecules/labeled-text.tsx
export const LabeledText = ({ label, value }) => ...

// components/organisms/stat-group.tsx
export const StatGroup = ({ stats }) => ...

// ✅ GOOD: Start simple, extract later
// Just use shadcn/ui components directly
import { Card } from '@/components/ui/card';

export function Stats() {
  return (
    <Card>
      <div className="text-sm text-muted-foreground">Speed</div>
      <div className="text-2xl font-bold">65 mph</div>
    </Card>
  );
}

// Extract to reusable component AFTER you've used it 3+ times
```

### Anti-Pattern 5: Unbounded Data Growth in Real-Time Tables

**What people do:** Store every telemetry snapshot forever, query grows to millions of rows

**Why it's wrong:** Queries slow down, database fills up, costs skyrocket

**Do this instead:** Delete old telemetry after 7 days, aggregate to summary tables

```sql
-- ❌ BAD: Keep everything forever
-- telemetry table grows to 100M+ rows

-- ✅ GOOD: Delete old raw data, keep aggregated summaries
-- Delete raw telemetry older than 7 days (runs daily)
DELETE FROM telemetry
WHERE created_at < NOW() - INTERVAL '7 days';

-- Keep aggregated summaries forever
CREATE TABLE telemetry_daily_summary (
  user_id UUID,
  date DATE,
  avg_speed DECIMAL,
  avg_rpm DECIMAL,
  max_speed DECIMAL,
  total_distance DECIMAL,
  PRIMARY KEY (user_id, date)
);

-- Aggregate daily (runs nightly)
INSERT INTO telemetry_daily_summary
SELECT
  user_id,
  DATE(created_at) as date,
  AVG(speed) as avg_speed,
  AVG(rpm) as avg_rpm,
  MAX(speed) as max_speed,
  SUM(distance) as total_distance
FROM telemetry
WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
GROUP BY user_id, DATE(created_at)
ON CONFLICT (user_id, date) DO UPDATE SET
  avg_speed = EXCLUDED.avg_speed,
  avg_rpm = EXCLUDED.avg_rpm,
  max_speed = EXCLUDED.max_speed,
  total_distance = EXCLUDED.total_distance;
```

## Build Order Implications

### Phase 1: Design System Foundation (Week 1)

**Setup:**
- Install shadcn/ui with components/ui/ directory
- Create components/widgets/ for molecules
- Build 3-5 reusable widgets (StatCard, GaugeWidget, AlertBanner)

**Why first:** All pages depend on consistent components — building pages in parallel requires shared primitives

**Testing:** Unit tests for widgets only — E2E tests come later

### Phase 2: Testing Infrastructure (Week 1)

**Setup in parallel with Phase 1:**
- Configure Vitest + React Testing Library
- Setup Playwright for E2E
- Write test utilities (render helpers, mock factories)

**Why early:** Enables TDD for all subsequent development — much harder to add tests after code exists

**Testing:** Smoke test the setup, no comprehensive coverage yet

### Phase 3: Pages with Real-Time (Week 2-3)

**Build pages using design system:**
- Use Server Component → Client Component pattern
- Implement throttled real-time subscriptions
- Write integration tests for each page

**Why now:** Design system ready, testing setup complete — can build pages in parallel

**Testing:** Integration tests for real-time flows, E2E for critical paths

### Phase 4: Performance Optimization (Week 4)

**Add after pages work:**
- Implement virtualization for long lists
- Add caching with revalidation
- Setup database indexes
- Code splitting for heavy components

**Why last:** Premature optimization is waste — measure first, optimize bottlenecks

**Testing:** Performance tests (Lighthouse, WebPageTest), visual regression with Chromatic

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Realtime | WebSocket via @supabase/supabase-js | Auto-reconnects, handles auth, built-in presence |
| Anthropic Claude API | Server-side streaming via @anthropic-ai/sdk | Never expose API key to client, use API routes |
| C# Plugin | HTTP POST with API key auth | Plugin authenticates with user's API key from preferences table |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server ↔ Client Component | Props (serializable) | Can't pass functions/classes across boundary |
| Client Component ↔ Supabase | Supabase JS Client | RLS enforced, uses user's session cookie |
| API Route ↔ Supabase | Supabase Service Client | Bypasses RLS, validates API key manually |
| Page ↔ Design System | Import components | Server Components can import Client Components |

## Sources

**Architecture Patterns:**
- [Next.js Architecture in 2026 — Server-First, Client-Islands, and Scalable App Router Patterns](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router)
- [Next js Folder Structure Best Practices for Scalable Applications (2026 Guide)](https://www.codebydeep.com/blog/next-js-folder-structure-best-practices-for-scalable-applications-2026-guide)
- [Getting Started: Server and Client Components | Next.js](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Rendering: Composition Patterns | Next.js](https://nextjs.org/docs/14/app/building-your-application/rendering/composition-patterns)

**Real-Time State Management:**
- [Building Scalable Real-Time Systems: A Deep Dive into Supabase Realtime Architecture and Optimistic UI Patterns](https://medium.com/@ansh91627/building-scalable-real-time-systems-a-deep-dive-into-supabase-realtime-architecture-and-eccb01852f2b)
- [How to debounce and throttle in React without losing your mind](https://www.developerway.com/posts/debouncing-in-react)
- [Enhancing Performance with React Query's Caching](https://blog.openreplay.com/enhancing-performance-with-react-query-caching/)

**Design System Architecture:**
- [Implementing Atomic Design in Next.js Projects](https://ijlalwindhi.medium.com/implementing-atomic-design-in-next-js-projects-9d7e5bbcece4)
- [Building a Design System for the Frontend with Next.js: Exploring Atomic Design](https://medium.com/@patrick.cunha336/building-a-design-system-for-the-frontend-with-next-js-373c22b37d46)

**Testing Strategies:**
- [Unit and E2E Tests with Vitest & Playwright](https://strapi.io/blog/nextjs-testing-guide-unit-and-e2e-tests-with-vitest-and-playwright)
- [Testing: Vitest | Next.js](https://nextjs.org/docs/app/guides/testing/vitest)
- [Testing: Playwright | Next.js](https://nextjs.org/docs/pages/guides/testing/playwright)
- [vitest-websocket-mock - Mock websockets and assert complex websocket interactions](https://github.com/akiomik/vitest-websocket-mock)
- [Visual testing with Playwright - Chromatic](https://www.chromatic.com/blog/how-to-visual-test-ui-using-playwright/)
- [Snapshot Testing with Playwright in 2026 | BrowserStack](https://www.browserstack.com/guide/playwright-snapshot-testing)

**Performance Optimization:**
- [React 19 Key Features: Updates Developers Must Know for 2026](https://colorwhistle.com/latest-react-features/)
- [React Performance Optimization: 15 Best Practices for 2025](https://dev.to/alex_bobes/react-performance-optimization-15-best-practices-for-2025-17l9)

---
*Architecture research for: Real-time Dashboard Systems with Next.js 16 + React 19*
*Researched: 2026-01-20*
*Confidence: HIGH — Patterns verified with official Next.js docs, Supabase documentation, and current best practices for 2026*
