# Phase 1: Foundation & Testing - Research

**Researched:** 2026-01-20
**Domain:** Testing infrastructure, Next.js 16, React 19, TypeScript
**Confidence:** HIGH

## Summary

Research focused on implementing comprehensive test coverage for RoadMaster Pro using Vitest (unit tests), Playwright (E2E tests), and pgTAP (database/RLS tests). The standard stack for Next.js 16 + React 19 testing is well-established with official support and recent documentation updates.

**Key Findings:**
- Vitest is the recommended unit testing framework for Next.js 16 with native App Router support
- Playwright provides cross-browser E2E testing with automatic waiting and CI integration
- pgTAP is the standard for PostgreSQL/Supabase database testing with RLS validation
- shadcn/ui now supports Tailwind CSS v4 with @theme directive and OKLCH color format
- Existing profit calculation functions in `/web/lib/calculations/` are well-structured for unit testing

**Primary recommendation:** Use Vitest for unit/integration tests, Playwright for E2E tests, and pgTAP for database/RLS validation. Integrate all three into GitHub Actions CI pipeline.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vitest | latest | Unit/integration testing | Official Next.js recommendation, Vite-powered, fast watch mode |
| @vitejs/plugin-react | latest | React component testing | Required for Vitest + React 19 |
| @testing-library/react | latest | Component testing utilities | Industry standard, user-centric queries |
| @testing-library/dom | latest | DOM testing utilities | Required by @testing-library/react |
| jsdom | latest | DOM environment | Simulates browser for component tests |
| vite-tsconfig-paths | latest | Path resolution | Enables Next.js path aliases in tests |
| Playwright | latest | E2E testing | Official Next.js recommendation, cross-browser |
| pgTAP | 1.x | Database testing | PostgreSQL standard, Supabase recommended |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vitest/coverage-v8 | latest | Code coverage | CI/CD pipeline, track coverage metrics |
| @vitest/ui | latest | Visual test UI | Local development, debugging test runs |
| mock-socket | latest | WebSocket mocking | Testing Supabase realtime subscriptions |
| supabase-test-helpers | latest | RLS testing | Simplify auth context in pgTAP tests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vitest | Jest | Jest slower, requires more config for Next.js 16 |
| Playwright | Cypress | Cypress more familiar but Playwright faster, better CI support |
| @testing-library/react | Enzyme | Enzyme outdated, no React 19 support |

**Installation:**
```bash
# Unit/integration testing
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths

# E2E testing
npm init playwright@latest

# Coverage (optional)
npm install -D @vitest/coverage-v8 @vitest/ui

# WebSocket mocking (for realtime tests)
npm install -D mock-socket
```

## Architecture Patterns

### Recommended Project Structure
```
web/
├── __tests__/                    # Top-level test utilities
│   ├── setup.ts                  # Global test setup
│   └── helpers.ts                # Shared test helpers
├── lib/
│   ├── calculations/
│   │   ├── profit.ts
│   │   ├── profit.test.ts        # Colocated unit tests
│   │   ├── efficiency.ts
│   │   └── efficiency.test.ts
│   └── supabase/
│       ├── client.ts
│       └── client.test.ts        # Mock Supabase client
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   └── button.test.tsx       # Component tests
│   └── telemetry/
│       ├── live-dashboard.tsx
│       └── live-dashboard.test.tsx
├── e2e/                          # Playwright E2E tests
│   ├── auth.spec.ts
│   ├── jobs.spec.ts
│   └── live-telemetry.spec.ts
├── supabase/
│   └── tests/
│       ├── 001-database.test.sql # pgTAP database tests
│       └── 002-rls.test.sql      # pgTAP RLS tests
├── vitest.config.mts             # Vitest configuration
└── playwright.config.ts          # Playwright configuration
```

### Pattern 1: Unit Testing Calculation Functions (AAA Pattern)
**What:** Test pure functions with Arrange-Act-Assert pattern
**When to use:** All functions in `/web/lib/calculations/`
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/testing/vitest
import { expect, test, describe } from 'vitest'
import { calculateJobProfit, calculateProfitPerMile } from './profit'

describe('calculateJobProfit', () => {
  test('calculates profit with fuel and damage costs', () => {
    // Arrange
    const job = {
      income: 5000,
      distance: 500,
      fuel_consumed: 50,
      damage_taken: 5,
    }

    // Act
    const profit = calculateJobProfit(job)

    // Assert
    const expectedFuelCost = 50 * 4.05 // 202.50
    const expectedDamageCost = (5 / 100) * 10000 // 500
    const expectedProfit = 5000 - 202.50 - 500 // 4297.50
    expect(profit).toBe(expectedProfit)
  })

  test('handles zero fuel consumption', () => {
    const job = {
      income: 5000,
      distance: 500,
      fuel_consumed: 0,
      damage_taken: 0,
    }

    expect(calculateJobProfit(job)).toBe(5000)
  })

  test('handles null fuel_consumed and damage_taken', () => {
    const job = {
      income: 5000,
      distance: 500,
      fuel_consumed: null,
      damage_taken: null,
    }

    expect(calculateJobProfit(job)).toBe(5000)
  })
})

describe('calculateProfitPerMile', () => {
  test('divides profit by distance', () => {
    expect(calculateProfitPerMile(4297.50, 500)).toBeCloseTo(8.595, 2)
  })

  test('handles zero distance edge case', () => {
    expect(calculateProfitPerMile(1000, 0)).toBe(0)
  })
})
```

### Pattern 2: Component Testing with React Testing Library
**What:** Test components from user perspective
**When to use:** UI components in `/web/components/`
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/testing/vitest
import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GaugeWidget } from './gauge-widget'

test('renders gauge with correct label and value', () => {
  render(<GaugeWidget label="Speed" value={65} unit="mph" max={80} />)

  expect(screen.getByText('Speed')).toBeDefined()
  expect(screen.getByText('65 mph')).toBeDefined()
})
```

### Pattern 3: E2E Testing Critical User Flows
**What:** Test complete user journeys across multiple pages
**When to use:** Auth flows, job tracking, live telemetry display
**Example:**
```typescript
// Source: https://nextjs.org/docs/pages/guides/testing/playwright
import { test, expect } from '@playwright/test'

test('user can view job history', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  // Navigate to jobs
  await page.goto('/jobs')

  // Verify job table loads
  await expect(page.locator('table')).toBeVisible()
  await expect(page.locator('tbody tr')).toHaveCount(10) // First page
})
```

### Pattern 4: Database/RLS Testing with pgTAP
**What:** Test Row Level Security policies with user context switching
**When to use:** All RLS policies in Supabase
**Example:**
```sql
-- Source: https://supabase.com/docs/guides/local-development/testing/overview
BEGIN;
SELECT plan(3);

-- Create test user
SELECT tests.create_supabase_user('test_user_id');

-- Test: User can only see their own jobs
SELECT tests.authenticate_as('test_user_id');
INSERT INTO jobs (user_id, source_city, destination_city, cargo_type, income, distance, started_at)
VALUES ('test_user_id', 'Los Angeles', 'San Francisco', 'Electronics', 5000, 400, NOW());

SELECT is(
  (SELECT COUNT(*)::int FROM jobs WHERE user_id = 'test_user_id'),
  1,
  'User can see their own jobs'
);

-- Test: User cannot see other users' jobs
SELECT tests.create_supabase_user('other_user_id');
INSERT INTO jobs (user_id, source_city, destination_city, cargo_type, income, distance, started_at)
VALUES ('other_user_id', 'Seattle', 'Portland', 'Furniture', 3000, 200, NOW());

SELECT is(
  (SELECT COUNT(*)::int FROM jobs WHERE user_id = 'other_user_id'),
  0,
  'User cannot see other users jobs'
);

-- Test: RLS enabled on jobs table
SELECT tests.rls_enabled('public', 'jobs');

SELECT * FROM finish();
ROLLBACK;
```

### Pattern 5: Mocking Supabase Realtime Subscriptions
**What:** Test real-time WebSocket subscriptions without live server
**When to use:** Components using `supabase.channel()` subscriptions
**Example:**
```typescript
// Source: https://github.com/supabase/realtime (realtime-js tests use mock-socket)
import { expect, test, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { LiveDashboard } from './live-dashboard'

test('updates telemetry when new data arrives', async () => {
  // Mock Supabase client
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
  }

  const mockSupabase = {
    channel: vi.fn().mockReturnValue(mockChannel),
    removeChannel: vi.fn(),
  }

  const { getByText } = render(
    <LiveDashboard userId="test-user" supabase={mockSupabase} />
  )

  // Simulate WebSocket message
  const onCallback = mockChannel.on.mock.calls[0][3] // Get callback
  onCallback({ new: { speed: 65, rpm: 1500, fuel_current: 100 } })

  await waitFor(() => {
    expect(getByText('65 mph')).toBeDefined()
  })
})
```

### Anti-Patterns to Avoid
- **Testing implementation details:** Don't test internal state or private methods, test user-facing behavior
- **Ignoring edge cases:** Always test null/undefined, zero, negative numbers, empty strings
- **Flaky E2E tests:** Use Playwright's auto-waiting instead of manual `sleep()` calls
- **Skipping RLS tests:** Every table with RLS must have pgTAP tests verifying policies work
- **Hardcoded test data in DB tests:** Use `tests.create_supabase_user()` for unique IDs per test

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| DOM queries | Custom selectors | @testing-library/react | Accessible queries, user-centric |
| WebSocket mocking | Custom mock server | mock-socket | Handles edge cases, reliable |
| Test isolation | Manual cleanup | Vitest `beforeEach`/`afterEach` | Automatic, prevents leaks |
| User auth context | Manual JWT setup | tests.authenticate_as() | Handles claims, roles correctly |
| Coverage reporting | Manual tracking | @vitest/coverage-v8 | Integrated, accurate |
| Browser automation | Selenium | Playwright | Modern, faster, better API |
| Time mocking | Date.now override | tests.freeze_time() | Safe, reversible |

**Key insight:** Testing frameworks have solved authentication, mocking, and isolation problems. Custom solutions miss edge cases (WebSocket reconnection, JWT expiry, transaction rollback failures).

## Common Pitfalls

### Pitfall 1: Async Server Components Not Testable with Vitest
**What goes wrong:** Tests fail with cryptic errors when testing async Server Components
**Why it happens:** Vitest does not currently support async Server Components (new React 19 feature)
**How to avoid:** Use Playwright E2E tests for async Server Components, Vitest only for sync components
**Warning signs:** Error messages mentioning "async component" or "Server Component" in test output

### Pitfall 2: Missing `jsdom` Environment Configuration
**What goes wrong:** Tests fail with "document is not defined" errors
**Why it happens:** Vitest defaults to Node.js environment, no DOM available
**How to avoid:** Set `test.environment: 'jsdom'` in `vitest.config.mts`
**Warning signs:** ReferenceError for `window`, `document`, or other browser globals

### Pitfall 3: Next.js Path Aliases Not Resolved in Tests
**What goes wrong:** Tests fail to import from `@/lib/*` or `@/components/*`
**Why it happens:** Vitest doesn't automatically read `tsconfig.json` paths
**How to avoid:** Install `vite-tsconfig-paths` plugin and add to Vitest config
**Warning signs:** Module not found errors for aliased imports

### Pitfall 4: Service Role Bypass in RLS Tests
**What goes wrong:** RLS tests pass even though policies are wrong
**Why it happens:** Tests run as service role which bypasses RLS
**How to avoid:** Use `tests.authenticate_as()` to switch to authenticated role before INSERT/SELECT
**Warning signs:** All RLS tests pass immediately without checking policies

### Pitfall 5: WebSocket Memory Leaks in Tests
**What goes wrong:** Tests slow down or hang after multiple runs
**Why it happens:** Realtime channels not cleaned up between tests
**How to avoid:** Call `supabase.removeChannel()` in `afterEach()` hooks
**Warning signs:** Increasing memory usage, tests timeout in watch mode

### Pitfall 6: Tailwind CSS v4 HSL Color Format
**What goes wrong:** shadcn/ui components don't render with correct theme colors
**Why it happens:** Tailwind v4 requires `hsl()` wrapper around color values, OKLCH conversion
**How to avoid:** Wrap color CSS variables in `hsl()` function, use `@theme inline` directive
**Warning signs:** Components render but colors are black/white/default

### Pitfall 7: Hardcoded Base URLs in E2E Tests
**What goes wrong:** Tests fail in CI because localhost:3000 not available
**Why it happens:** `page.goto('http://localhost:3000/')` assumes dev server running
**How to avoid:** Set `baseURL` in `playwright.config.ts`, use relative paths `page.goto('/')`
**Warning signs:** Tests pass locally but fail in GitHub Actions

### Pitfall 8: Profit Calculation Floating Point Errors
**What goes wrong:** Assertions fail with tiny differences (4297.499999 vs 4297.50)
**Why it happens:** JavaScript floating point arithmetic is imprecise
**How to avoid:** Use `toBeCloseTo()` instead of `toBe()` for decimal comparisons
**Warning signs:** Test failures showing differences like 0.0000001

## Code Examples

Verified patterns from official sources:

### Vitest Configuration (TypeScript)
```typescript
// Source: https://nextjs.org/docs/app/guides/testing/vitest
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true, // Optional: enables global test APIs
    setupFiles: './__tests__/setup.ts', // Optional: global setup
  },
})
```

### Playwright Configuration
```typescript
// Source: https://nextjs.org/docs/pages/guides/testing/playwright
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### GitHub Actions CI Workflow
```yaml
# Source: https://playwright.dev/docs/ci-intro
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --run

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### Testing Profit Calculations with Edge Cases
```typescript
// Source: Testing best practices from Vitest docs
import { describe, test, expect } from 'vitest'
import { calculateJobProfit, calculateProfitPerMile, calculateTotalExpenses } from './profit'

describe('Profit Calculations', () => {
  describe('calculateJobProfit', () => {
    test('normal job with fuel and damage', () => {
      const job = {
        income: 5000,
        distance: 500,
        fuel_consumed: 50,
        damage_taken: 5,
      }
      expect(calculateJobProfit(job)).toBeCloseTo(4297.50, 2)
    })

    test('perfect job - no fuel or damage', () => {
      const job = {
        income: 5000,
        distance: 500,
        fuel_consumed: 0,
        damage_taken: 0,
      }
      expect(calculateJobProfit(job)).toBe(5000)
    })

    test('null fuel and damage treated as zero', () => {
      const job = {
        income: 5000,
        distance: 500,
        fuel_consumed: null,
        damage_taken: null,
      }
      expect(calculateJobProfit(job)).toBe(5000)
    })

    test('high damage results in loss', () => {
      const job = {
        income: 3000,
        distance: 200,
        fuel_consumed: 30,
        damage_taken: 50, // 50% damage = $5000 repair
      }
      const profit = calculateJobProfit(job)
      expect(profit).toBeLessThan(0) // Loss
    })
  })

  describe('calculateProfitPerMile', () => {
    test('positive profit per mile', () => {
      expect(calculateProfitPerMile(500, 100)).toBe(5)
    })

    test('zero distance returns zero', () => {
      expect(calculateProfitPerMile(500, 0)).toBe(0)
    })

    test('negative profit shows loss per mile', () => {
      expect(calculateProfitPerMile(-200, 100)).toBe(-2)
    })
  })

  describe('calculateTotalExpenses', () => {
    test('returns breakdown of costs', () => {
      const job = {
        income: 5000,
        distance: 500,
        fuel_consumed: 50,
        damage_taken: 10,
      }
      const expenses = calculateTotalExpenses(job)

      expect(expenses.fuelCost).toBeCloseTo(202.50, 2)
      expect(expenses.damageCost).toBe(1000)
      expect(expenses.total).toBeCloseTo(1202.50, 2)
    })
  })
})
```

### shadcn/ui Setup with Tailwind CSS v4
```css
/* Source: https://ui.shadcn.com/docs/tailwind-v4 */
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Move :root and .dark outside @layer base for Tailwind v4 */
:root {
  /* Automotive theme - diesel truck aesthetic */
  --background: hsl(240 5% 6%);       /* Dark charcoal */
  --foreground: hsl(60 5% 90%);       /* Off-white */
  --card: hsl(240 4% 9%);
  --card-foreground: hsl(60 5% 90%);
  --primary: hsl(35 100% 50%);        /* Amber (warning lights) */
  --primary-foreground: hsl(240 5% 6%);
  --secondary: hsl(200 80% 50%);      /* Steel blue */
  --secondary-foreground: hsl(60 5% 90%);
  --muted: hsl(240 5% 15%);
  --muted-foreground: hsl(60 5% 60%);
  --accent: hsl(10 80% 50%);          /* Red (brake lights) */
  --accent-foreground: hsl(60 5% 90%);
  --destructive: hsl(0 84% 60%);
  --destructive-foreground: hsl(60 5% 90%);
  --border: hsl(240 6% 20%);
  --input: hsl(240 6% 20%);
  --ring: hsl(35 100% 50%);
  --radius: 0.5rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ... map all theme colors */
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest | Vitest | 2023 | 10x faster tests, native ESM |
| HSL colors | OKLCH colors | Tailwind v4 (2024) | Better perceptual accuracy |
| React.forwardRef | Direct ref prop | React 19 (2024) | Simpler component APIs |
| Manual RLS testing | pgTAP + test helpers | 2023 | Automated, CI-ready |
| Cypress | Playwright | 2022-2023 | Faster, better CI, multi-browser |

**Deprecated/outdated:**
- Jest for Next.js: Vitest officially recommended as of Next.js 14+
- Enzyme: No React 19 support, unmaintained
- Manual WebSocket testing: mock-socket handles edge cases better
- Tailwind v3 config files: v4 uses CSS-first configuration

## Open Questions

1. **WebSocket Testing Strategy**
   - What we know: mock-socket used internally by Supabase realtime-js tests
   - What's unclear: Best integration with Vitest for testing live telemetry components
   - Recommendation: Start with Vitest mocks (vi.fn()), evaluate mock-socket if needed for complex scenarios

2. **CI Database Testing**
   - What we know: Supabase CLI can run local instance with `supabase start`
   - What's unclear: Best way to run pgTAP tests in GitHub Actions (local instance vs hosted)
   - Recommendation: Use Supabase local development in CI, documented in official testing guide

3. **Coverage Thresholds**
   - What we know: @vitest/coverage-v8 can enforce thresholds
   - What's unclear: What percentage is realistic for brownfield refactor
   - Recommendation: Start with 60% for calculations, 40% for components, increase incrementally

## Sources

### Primary (HIGH confidence)
- [Next.js Vitest Testing Guide](https://nextjs.org/docs/app/guides/testing/vitest) - Official Next.js 16 documentation
- [Next.js Playwright Testing Guide](https://nextjs.org/docs/pages/guides/testing/playwright) - Official E2E testing guide
- [Vitest Getting Started](https://vitest.dev/guide/) - Official Vitest documentation
- [Supabase Testing Overview](https://supabase.com/docs/guides/local-development/testing/overview) - Official testing strategies
- [Supabase Advanced pgTAP Testing](https://supabase.com/docs/guides/local-development/testing/pgtap-extended) - RLS testing patterns
- [shadcn/ui Tailwind v4 Migration](https://ui.shadcn.com/docs/tailwind-v4) - Official migration guide
- [Playwright CI Documentation](https://playwright.dev/docs/ci-intro) - CI setup guide

### Secondary (MEDIUM confidence)
- [Testing Row-Level Security with pgTAP](https://blair-devmode.medium.com/testing-row-level-security-rls-policies-in-postgresql-with-pgtap-a-supabase-example-b435c1852602) - Detailed RLS examples
- [Supabase Test Helpers](https://usebasejump.com/blog/testing-on-supabase-with-pgtap) - Community pgTAP utilities
- [Unit Testing in TypeScript](https://www.startearly.ai/post/typescript-unit-testing-tips) - TypeScript testing patterns
- [Next.js Testing Guide (Strapi)](https://strapi.io/blog/nextjs-testing-guide-unit-and-e2e-tests-with-vitest-and-playwright) - Comprehensive setup guide
- [Vitest 4.0 and Next.js 16](https://codepolice.net/vitest-4-0-and-next-js-16/) - Version compatibility notes

### Tertiary (LOW confidence)
- [Testing Supabase with MSW](https://nygaard.dev/blog/testing-supabase-rtl-msw) - Alternative mocking strategy (needs verification for realtime)
- [shadcn/ui Design Tokens Discussion](https://github.com/shadcn-ui/ui/discussions/8372) - Community theming patterns
- [Building Scalable Design Systems](https://shadisbaih.medium.com/building-a-scalable-design-system-with-shadcn-ui-tailwind-css-and-design-tokens-031474b03690) - Design token patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Next.js and Vitest documentation verified
- Architecture patterns: HIGH - Multiple official sources confirm patterns
- Database testing: HIGH - Supabase official docs + community resources
- shadcn/ui theming: MEDIUM - Official docs clear but automotive theme is custom
- WebSocket mocking: MEDIUM - Supabase uses mock-socket internally but integration examples limited
- Pitfalls: HIGH - Documented in official guides and community troubleshooting

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - stable ecosystem, Next.js 16 and React 19 recently released)
