# Coding Conventions

**Analysis Date:** 2026-01-19

## Naming Patterns

**Files:**
- Components: PascalCase with descriptive names (`PageHeader.tsx`, `EmptyState.tsx`, `RouteAdvisorCard.tsx`)
- Pages: kebab-case directories with `page.tsx` files (Next.js App Router convention)
- API routes: kebab-case with `route.ts` files (`web/app/api/jobs/start/route.ts`)
- Utilities: kebab-case (`city-flags.ts`, `profit.ts`, `efficiency.ts`)
- Types: kebab-case (`database.ts`)

**Functions:**
- camelCase for all functions (`calculateJobProfit`, `createClient`, `handleTelemetryUpdate`)
- Descriptive action-based names (`fetchLatest`, `setupRealtime`, `toggleMobileDrawer`)

**Variables:**
- camelCase for local variables (`telemetry`, `isConnected`, `currentProfile`)
- SCREAMING_SNAKE_CASE for constants (`ESTIMATED_FUEL_PRICE_PER_GALLON`, `MAX_REPAIR_COST`, `THROTTLE_MS`)
- Boolean prefixes: `is`, `has`, `should` (`isCollapsed`, `isMobileOpen`, `isClient`)

**Types:**
- PascalCase for interfaces and types (`GaugeProps`, `NavItem`, `DashboardProfile`, `TelemetryHistory`)
- Database types use snake_case fields (generated from Supabase)
- Props interfaces named `{Component}Props`

**Components:**
- PascalCase matching filename (`Gauge`, `Sidebar`, `ProfileSelector`)

**C# Plugin (plugin directory):**
- PascalCase for classes and public methods (`ApiClient`, `StartJob`, `CompleteJob`)
- camelCase for private fields (`apiUrl`, `apiKey`, `client`)

## Code Style

**Formatting:**
- Tool: ESLint via `eslint-config-next` v9.39.2
- Indentation: 2 spaces
- Semicolons: Required
- Quotes: Single quotes for TypeScript, double quotes for JSX attributes
- Trailing commas: Used in multiline structures

**Linting:**
- Config: Next.js defaults (no custom `.eslintrc`)
- Run: `npm run lint` (from `web/package.json`)
- TypeScript strict mode: enabled (`web/tsconfig.json`)

**TypeScript:**
- Strict mode enabled
- Optional chaining (`?.`) and nullish coalescing (`??`) used extensively
- Type assertions avoided where possible
- Explicit return types on exported functions

**CSS/Styling:**
- Framework: Tailwind CSS v4
- Custom utilities: `web/app/globals.css`
- Responsive: Mobile-first with breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- Custom properties: CSS variables (`--bg-void`, `--display-blue`, `--display-amber`)

## Import Organization

**Order:**
1. React and framework imports (`react`, `next`)
2. External libraries
3. Internal absolute imports (`@/lib/`, `@/components/`)
4. Relative imports (`./`, `../`)

**Example from `web/app/(dashboard)/live/page.tsx`:**
```typescript
'use client';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Gauge } from '@/components/ui/gauge';
import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/types/database';
import dynamic from 'next/dynamic';
```

**Path Aliases:**
- `@/*` maps to `web/*` (configured in `web/tsconfig.json`)
- Used consistently throughout codebase

## Error Handling

**Patterns:**
- Try-catch blocks in all async operations
- Supabase error checking: check `error` object before accessing data
- Early returns for error states
- Console logging for debugging

**Example from `web/app/(dashboard)/live/page.tsx`:**
```typescript
const { data, error } = await supabase
  .from('telemetry')
  .select('*, jobs(*)')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

if (error) {
  if (error.code !== 'PGRST116') { // Ignore "not found" errors
    console.error('Telemetry fetch error:', error);
  }
  return;
}
```

**API Routes (example from `web/app/api/jobs/start/route.ts`):**
```typescript
if (!data.source_city || !data.destination_city || !data.cargo_type) {
  return NextResponse.json(
    { error: 'Missing required job fields' },
    { status: 400 }
  );
}

try {
  const { data: job, error } = await supabase.from('jobs').insert({...});

  if (error) {
    console.error('Job start error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }

  return NextResponse.json({ success: true, job_id: job.id, job });
} catch (error) {
  console.error('Job start API error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

**Client Components:**
- Null checks before accessing nested properties
- Optional chaining (`?.`) and nullish coalescing (`??`)
- Loading states while fetching
- Empty states for no data

## Logging

**Framework:** Native `console` methods

**Patterns:**
- `console.error(message, context)` for errors
- `console.warn(message)` for non-critical issues
- No `console.log()` in production code
- Error messages format: `Failed to {action}: {details}`

**Examples:**
```typescript
console.error('Failed to parse sidebar state:', error);
console.warn('Real-time connection issue, using fallback polling');
console.error('Job start error:', error);
```

**C# Plugin:**
- `Console.WriteLine()` for all output
- Format: `{Action result}: {details}`

## Comments

**When to Comment:**
- Complex domain-specific calculations
- SDK field mappings and unit conversions
- Non-obvious workarounds
- Section headers in long components
- JSDoc for exported utilities

**Examples from `web/lib/calculations/profit.ts`:**
```typescript
/**
 * Calculate damage cost based on damage percentage
 * Uses linear scaling: 100% damage = $10,000 repair
 */
export function calculateDamageCost(damagePercent: number): number {
  return (damagePercent / 100) * MAX_REPAIR_COST;
}
```

**From `plugin/RoadMasterPlugin/ApiClient.cs`:**
```csharp
// Speed is in kph, convert to mph
speed = data.TruckValues.CurrentValues.DashboardValues.Speed.Kph * 0.621371,
// Fuel is in liters, convert to gallons
fuel_current = data.TruckValues.CurrentValues.DashboardValues.FuelValue.Amount * 0.264172,
```

**From `web/app/(dashboard)/live/page.tsx`:**
```typescript
// Throttle UI updates to prevent excessive re-renders
if (now - lastUpdateRef.current >= THROTTLE_MS) {
  setTelemetry(data);
}
```

## Function Design

**Size:**
- Components: 100-500 lines (e.g., `web/app/(dashboard)/live/page.tsx` is 494 lines)
- Utility functions: 5-50 lines (focused, single-purpose)
- API routes: 50-150 lines including validation

**Parameters:**
- Destructured object props for components
- Individual params for utilities (typically 2-5)
- Complex data as objects

**Return Values:**
- Components: JSX.Element (implicit)
- Utilities: Explicit primitive or typed objects
- API routes: NextResponse
- Async: Promise<T> with specific type

**Examples from `web/lib/calculations/profit.ts`:**
```typescript
export function calculateFuelCost(fuelConsumed: number): number {
  return fuelConsumed * ESTIMATED_FUEL_PRICE_PER_GALLON;
}

export function calculateTotalExpenses(job: Job): {
  fuelCost: number;
  damageCost: number;
  total: number;
} {
  const fuelCost = job.fuel_consumed ? calculateFuelCost(job.fuel_consumed) : 0;
  const damageCost = job.damage_taken ? calculateDamageCost(job.damage_taken) : 0;
  return { fuelCost, damageCost, total: fuelCost + damageCost };
}
```

## Module Design

**Exports:**
- Named exports for utilities and components
- Default export for Next.js pages and API routes
- One primary export per component file
- Multiple exports allowed for utility modules

**File Structure:**
```typescript
'use client'; // If needed

// Imports
import { ... } from '...';

// Types/Interfaces
interface ComponentProps { ... }

// Constants (if any)
const CONSTANT = value;

// Helper functions (if any)
function helper() { ... }

// Main export
export function Component(props: ComponentProps) { ... }
```

**Barrel Files:**
- Not used in this codebase
- Components imported directly: `import { Gauge } from '@/components/ui/gauge'`

**Module Patterns:**
- Client components: `'use client'` directive
- Server components: no directive (default)
- Utilities: framework-agnostic
- Database types: auto-generated in `web/lib/types/database.ts`

## Next.js Specific

**App Router:**
- Route groups: `(auth)`, `(dashboard)` for URL-less organization
- `page.tsx` for routes
- `layout.tsx` for shared layouts
- `route.ts` for API endpoints

**Client vs Server:**
- `'use client'` when using hooks, browser APIs, or event handlers
- Server Components for data fetching when possible
- Client Components for real-time subscriptions

**Dynamic Imports:**
- For heavy libraries (Recharts)
- With loading states
- SSR disabled where needed

**Example from `web/app/(dashboard)/live/page.tsx`:**
```typescript
const TrendCards = dynamic(
  () => import('@/components/telemetry/trend-cards').then(mod => ({ default: mod.TrendCards })),
  {
    ssr: false,
    loading: () => (
      <div className="dashboard-card rounded-lg p-6 animate-pulse">
        <div className="h-48 bg-slate-700 rounded"></div>
      </div>
    )
  }
);
```

---

*Convention analysis: 2026-01-19*
