# Technology Stack

**Project:** RoadMaster Pro Dashboard UI/UX Redesign
**Researched:** January 20, 2026
**Overall Confidence:** HIGH

## Executive Summary

This stack recommendation focuses on ADDITIONS to the existing working infrastructure (Next.js 16, React 19, Tailwind CSS 4, Supabase). The goal is to transform the dashboard from "terrible" to "professional but warm" with automotive-authentic aesthetics, real-time telemetry updates, and comprehensive testing coverage.

**Key Additions:**
- **Component System:** shadcn/ui (copy-paste components, not npm)
- **Charts:** Tremor for complex analytics + react-d3-speedometer for gauges
- **Tables:** TanStack Table v8
- **Testing:** Vitest + React Testing Library + Playwright
- **Monitoring:** Sentry for errors/performance
- **Design System:** Storybook 8+ for component documentation

---

## Recommended Stack

### UI Component Library

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| shadcn/ui | latest (copy-paste) | Base component primitives | Copy-paste model allows full customization for automotive theme. Built on Radix UI (accessibility) + Tailwind CSS 4 (already using). Full React 19 support confirmed. NO npm dependency bloat. |
| Radix UI | ^2.x | Accessible primitives | Underlying foundation for shadcn/ui. Provides headless, accessible components (Dialog, Dropdown, etc.) that can be styled to match automotive aesthetic. |

**Confidence:** HIGH - Official shadcn/ui docs confirm React 19 + Next.js 15/16 + Tailwind v4 support

**Installation:**
```bash
# Initialize shadcn/ui (creates components directory)
npx shadcn@latest init

# Add components as needed (copy-paste model)
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

**Rationale:**
- Copy-paste approach = full control over automotive color scheme (amber/white/green)
- No version lock-in or breaking changes
- Tree-shakeable (only add components you need)
- Already uses Tailwind CSS 4, so zero config overhead

**Source:** [shadcn/ui React 19 docs](https://ui.shadcn.com/docs/react-19)

---

### Data Visualization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tremor | 4.x beta (React 19) | Analytics charts, line/area/bar charts | Purpose-built for dashboards. 35+ components. Built on Recharts + Radix UI (consistency with shadcn). Supports dark theme. React 19 beta available. Tailwind CSS 4 compatible. |
| react-d3-speedometer | ^3.x | Automotive gauges (speed, RPM, fuel) | Specialized for circular gauges with needle animation. Authentic automotive aesthetic. React 19 compatible (v3.x). Lightweight (only for gauges, not full charting). |
| Recharts | ^2.15.0+ | Fallback for custom charts | If Tremor doesn't fit specific use case. Widely adopted, performant for real-time updates, React 19 compatible. |

**Confidence:** MEDIUM-HIGH
- Tremor: React 19 support confirmed in beta, stable for Tailwind v4
- react-d3-speedometer: v3.x explicitly supports React 19
- Recharts: Mature library, React 19 compatible with peer dep overrides if needed

**Installation:**
```bash
# Tremor (copy-paste components, or npm)
npm install @tremor/react@next  # Beta with React 19

# Gauge components
npm install react-d3-speedometer

# Recharts (if needed)
npm install recharts
npm install react-is@19.0.0  # Override if peer dep warning
```

**Rationale:**
- **Tremor** for complex analytics (route profitability, fuel economy trends, damage over time)
- **react-d3-speedometer** for live telemetry gauges (matches truck dashboard aesthetic)
- **Recharts** as fallback if Tremor charts don't support specific customization
- All support real-time data updates via React state changes

**Use Cases:**
- Tremor AreaChart: Fuel consumption over job duration
- Tremor BarList: Route profitability ranking
- Tremor DonutChart: Expense breakdown (fuel/damage/tolls)
- react-d3-speedometer: Live speed, RPM, fuel level gauges
- TremorTracker: Progress indicators for achievements

**Sources:**
- [Tremor React 19 announcement](https://x.com/tremorlabs/status/1868722998590759361)
- [react-d3-speedometer npm](https://www.npmjs.com/package/react-d3-speedometer)
- [Tremor docs](https://www.tremor.so/)

---

### Table Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| TanStack Table | ^8.x | Job history tables, sortable data grids | Headless table library. Handles sorting, filtering, pagination. Works with real-time data updates. React 19 compatible (minor compiler issue tracked but non-blocking). No UI opinions = full styling control. |

**Confidence:** HIGH - Widely used with Next.js + React 19, active development

**Installation:**
```bash
npm install @tanstack/react-table
```

**Rationale:**
- Current codebase already uses TanStack Table (per CLAUDE.md)
- Headless = apply automotive theme styling
- Built-in sorting/filtering without reinventing
- Performant with large datasets (100+ jobs)
- Real-time updates via React state (no special handling needed)

**Source:** [TanStack Table docs](https://tanstack.com/table/latest)

---

### Testing Stack

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vitest | ^3.x | Unit & component tests | Official Next.js recommendation. 5-10x faster than Jest. Native ESM support. React 19 compatible. Browser mode for DOM testing. Works with App Router. |
| @testing-library/react | ^16.x | Component testing utilities | Industry standard for React testing. React 19 support. Encourages accessibility-first testing patterns. |
| @testing-library/dom | ^10.x | DOM testing utilities | Required for jsdom environment |
| @vitejs/plugin-react | ^4.x | Vite React support | Required for Vitest |
| jsdom | ^26.x | Browser environment simulation | Vitest test environment |
| Playwright | ^1.50+ | E2E & integration tests | Official Next.js recommendation. Cross-browser testing. Real browser automation. Test real-time WebSocket updates. |

**Confidence:** HIGH - Official Next.js docs explicitly recommend Vitest + Playwright

**Installation:**
```bash
# Unit/component testing
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths

# E2E testing
npm install -D @playwright/test
npx playwright install
```

**Configuration:**
```typescript
// vitest.config.mts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
  },
})
```

**Testing Strategy:**
- **Vitest:** Unit tests for calculations (profit, fuel economy), component rendering
- **Playwright:** E2E tests for real-time telemetry updates, job tracking flows, AI dispatcher
- **Note:** Async Server Components NOT supported by Vitest (use Playwright for those)

**Rationale:**
- Currently ZERO test coverage (per PROJECT.md context)
- Vitest 5-10x faster than Jest = better DX for TDD
- Next.js official docs recommend this exact combo
- Playwright tests real WebSocket behavior (critical for 1Hz telemetry)

**Sources:**
- [Next.js Vitest docs](https://nextjs.org/docs/app/guides/testing/vitest)
- [Next.js Playwright docs](https://nextjs.org/docs/pages/guides/testing/playwright)
- [Vitest vs Jest 2026 comparison](https://dev.to/dataformathub/vitest-vs-jest-30-why-2026-is-the-year-of-browser-native-testing-2fgb)

---

### Performance Monitoring

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Sentry | @sentry/nextjs ^9.x | Error tracking, performance monitoring, session replay | Purpose-built Next.js SDK. Monitors client/server/edge. One-command setup. Session replay for debugging real-time issues. Free tier available. |
| Vercel Analytics (optional) | Built-in | Web Vitals tracking | If deploying to Vercel, free built-in analytics. Zero config. |

**Confidence:** HIGH - Official Sentry Next.js integration, widely adopted

**Installation:**
```bash
# One-command setup
npx @sentry/wizard@latest -i nextjs
```

**Rationale:**
- Project has performance issues (per PROJECT.md: "performance issues")
- Real-time dashboards need performance monitoring (1Hz updates can cause memory leaks)
- Sentry session replay invaluable for debugging real-time telemetry issues
- Tracks slow Supabase queries, WebSocket disconnects, component re-render storms
- Free tier sufficient for early development

**Monitoring Priorities:**
- Real-time telemetry update performance (should handle 1Hz without janking)
- Supabase query performance (job history loads)
- Memory leaks from WebSocket subscriptions
- Chart rendering performance (Tremor/Recharts with live data)

**Source:** [Sentry Next.js docs](https://sentry.io/for/nextjs/)

---

### Design System Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Storybook | ^8.x | Component documentation & isolation | Industry standard for design systems. Isolate components from app. Visual regression testing. Document component states. React 19 compatible (with known minor issues). |

**Confidence:** MEDIUM - React 19 compatibility has minor issues but non-blocking

**Installation:**
```bash
npx storybook@latest init
```

**Rationale:**
- 10 dashboard pages + shared components = need component library
- Storybook isolates components for styling (automotive theme iteration)
- Documents component variants (light/dark, different gauge ranges, error states)
- Team collaboration (designer reviews components in isolation)
- NOT critical for MVP but valuable for "professional" aesthetic goal

**Caveats:**
- React 19 + Storybook has minor compatibility issues (tracked, non-blocking)
- Consider deferring to Phase 2 if slows down initial development

**Sources:**
- [Storybook Next.js docs](https://storybook.js.org/docs/get-started/frameworks/nextjs)
- [Storybook releases](https://github.com/storybookjs/storybook/releases)

---

### Real-Time Optimization (Supabase)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @supabase/supabase-js | ^2.x | Supabase client (already using) | Already in stack. WebSocket-based real-time. Handles 10K+ concurrent connections. ~50KB gzipped. Zero performance impact on Lighthouse scores. |

**Confidence:** HIGH - Already in use, proven performance

**No new installation needed.** Optimization recommendations:

**Performance Best Practices:**
```typescript
// 1. Selective table subscriptions (only enable real-time for telemetry table)
// 2. Filter subscriptions to user data only
const channel = supabase
  .channel('telemetry')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'telemetry',
      filter: `user_id=eq.${userId}` // CRITICAL: filter at DB level
    },
    (payload) => setTelemetry(payload.new)
  )
  .subscribe()

// 3. Cleanup on unmount
useEffect(() => {
  return () => supabase.removeChannel(channel)
}, [])

// 4. Throttle UI updates if needed (1Hz is manageable, but gauges may update faster than necessary)
```

**Performance Notes:**
- Supabase real-time handles 10K+ concurrent WebSocket connections
- 50KB gzipped client (negligible)
- REST API typically 20-50ms for indexed queries
- Built-in connection pooling
- **Bottleneck:** DB reads (100 users subscribed to table = 100 reads per insert)

**Rationale:**
- Already using Supabase, no alternatives needed
- Focus on optimization patterns (selective subscriptions, cleanup)
- Monitor with Sentry for WebSocket disconnects

**Sources:**
- [Supabase Realtime benchmarks](https://supabase.com/docs/guides/realtime/benchmarks)
- [Supabase Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs)

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Component Library | shadcn/ui (copy-paste) | MUI, Ant Design, Chakra UI | Too opinionated. Automotive aesthetic requires full control. Heavy bundles. |
| Component Library | shadcn/ui | Build from scratch | Reinventing accessibility, keyboard nav, ARIA. Slower development. |
| Charts | Tremor + react-d3-speedometer | Victory, Nivo, ApexCharts | Victory: heavy bundle. Nivo: D3 complexity. ApexCharts: poor React integration. |
| Charts | Tremor | Only Recharts | Tremor provides dashboard-specific components (BarList, Tracker, KPI cards). Recharts requires more boilerplate. |
| Gauges | react-d3-speedometer | MUI Gauge, Syncfusion | MUI Gauge too minimal. Syncfusion proprietary/paid. react-d3-speedometer lightweight + automotive look. |
| Testing | Vitest | Jest | Jest slower (2-10x), worse ESM support, worse DX. Vitest official Next.js recommendation. |
| E2E | Playwright | Cypress | Playwright cross-browser, faster, better async handling, Next.js official recommendation. |
| Monitoring | Sentry | LogRocket, Datadog | LogRocket expensive. Datadog overkill for project scale. Sentry free tier sufficient. |
| Design System | Storybook | Ladle, Histoire | Storybook industry standard, better docs, larger ecosystem. |
| Real-Time | Supabase Realtime | Pusher, Ably, Socket.io | Already using Supabase. Adding separate real-time service adds complexity, cost, latency. |

---

## Installation Summary

```bash
# UI Components (copy-paste model)
npx shadcn@latest init
npx shadcn@latest add button card dialog dropdown-menu

# Charts & Visualization
npm install @tremor/react@next  # React 19 beta
npm install react-d3-speedometer
npm install recharts react-is@19.0.0  # Fallback if needed

# Tables (already in stack, confirm version)
npm install @tanstack/react-table

# Testing
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
npm install -D @playwright/test
npx playwright install

# Monitoring
npx @sentry/wizard@latest -i nextjs

# Design System (optional, defer to Phase 2)
npx storybook@latest init
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

---

## Version Compatibility Matrix

| Package | React 19 | Next.js 16 | Tailwind v4 | Notes |
|---------|----------|------------|-------------|-------|
| shadcn/ui | ✅ | ✅ | ✅ | Full support confirmed |
| Radix UI | ✅ | ✅ | ✅ | Underlying shadcn/ui primitives |
| Tremor | ✅ (beta) | ✅ | ✅ | React 19 in @next tag |
| react-d3-speedometer | ✅ (v3.x) | ✅ | N/A | v3 for React 19 |
| Recharts | ✅ | ✅ | N/A | May need react-is override |
| TanStack Table | ✅ | ✅ | N/A | Minor compiler issue, non-blocking |
| Vitest | ✅ | ✅ | N/A | Official Next.js recommendation |
| Playwright | ✅ | ✅ | N/A | Framework-agnostic |
| Sentry | ✅ | ✅ | N/A | Dedicated Next.js SDK |
| Storybook | ⚠️ | ⚠️ | N/A | Minor React 19 issues, non-blocking |
| Supabase | ✅ | ✅ | N/A | Already in use |

**Legend:** ✅ Full support | ⚠️ Minor issues | ❌ Not compatible | N/A Not applicable

---

## Tech Stack Decision Rationale

### Why Copy-Paste (shadcn/ui) Over npm Component Library?

1. **Automotive Theme Requirements:** Amber/white/green color scheme, dark theme, card-based layout. Pre-built libraries (MUI, Ant Design) force their aesthetic.
2. **No Breaking Changes:** Copy-paste means no dependency updates breaking components.
3. **Tree-Shakeable:** Only add components you need. No bundle bloat.
4. **Full Control:** Can modify copied components for specific automotive UI patterns.

### Why Tremor Over Pure Recharts?

1. **Dashboard-Specific Components:** Tremor provides BarList, Tracker, KPI cards out of the box. Recharts requires building these from scratch.
2. **Consistent Theming:** Tremor built on Tailwind CSS 4 (already using).
3. **Real-Time Friendly:** Tremor components handle state updates efficiently (tested with Supabase real-time).
4. **Professional Aesthetic:** Tremor designed for dashboards, not generic charting.

### Why Vitest Over Jest?

1. **Speed:** 5-10x faster (critical for TDD workflow).
2. **Official Recommendation:** Next.js docs explicitly recommend Vitest.
3. **Better ESM Support:** Jest ESM support still problematic in 2026.
4. **Modern DX:** Browser mode, better error messages, native async/await.

### Why Sentry Over Alternatives?

1. **Next.js SDK:** Purpose-built for App Router, Server Components, Edge.
2. **Session Replay:** Critical for debugging real-time telemetry issues.
3. **Free Tier:** Sufficient for development and early production.
4. **One-Command Setup:** `npx @sentry/wizard` configures everything.

### Why Not Build Gauges From Scratch?

1. **Complexity:** Circular gauge with needle animation requires canvas/SVG expertise.
2. **Accessibility:** Pre-built libraries handle ARIA, keyboard nav.
3. **Time:** Building custom gauges = 2-3 days. react-d3-speedometer = 30 minutes.
4. **Maintenance:** Community maintains library, fixes bugs, adds features.

---

## Sources

### Official Documentation
- [Next.js Testing: Vitest](https://nextjs.org/docs/app/guides/testing/vitest)
- [Next.js Testing: Playwright](https://nextjs.org/docs/pages/guides/testing/playwright)
- [shadcn/ui React 19 Documentation](https://ui.shadcn.com/docs/react-19)
- [Tremor Documentation](https://www.tremor.so/)
- [TanStack Table Documentation](https://tanstack.com/table/latest)
- [Sentry Next.js Integration](https://sentry.io/for/nextjs/)
- [Supabase Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs)
- [Supabase Realtime Benchmarks](https://supabase.com/docs/guides/realtime/benchmarks)
- [Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4)

### Community Resources
- [Vitest vs Jest 2026: Browser-Native Testing](https://dev.to/dataformathub/vitest-vs-jest-30-why-2026-is-the-year-of-browser-native-testing-2fgb)
- [Building Luxury Analytics Dashboard with Next.js 16 & Tailwind v4](https://dev.to/fytroy/building-a-luxury-analytics-dashboard-with-nextjs-16-tailwind-v4-155h)
- [15 Best React UI Libraries for 2026](https://www.builder.io/blog/react-component-libraries-2026)
- [Top 7 React Chart Libraries for 2026](https://dev.to/basecampxd/top-7-react-chart-libraries-for-2026-features-use-cases-and-benchmarks-412c)
- [Tremor React 19 Announcement](https://x.com/tremorlabs/status/1868722998590759361)
- [Storybook Next.js Documentation](https://storybook.js.org/docs/get-started/frameworks/nextjs)

### Package References
- [react-d3-speedometer npm](https://www.npmjs.com/package/react-d3-speedometer)
- [@tremor/react npm](https://www.npmjs.com/package/@tremor/react)
- [@tanstack/react-table npm](https://www.npmjs.com/package/@tanstack/react-table)
- [shadcn/ui Changelog](https://ui.shadcn.com/docs/changelog)

---

## Next Steps for Roadmap Creation

This stack enables the following roadmap phases:

1. **Phase 1: Foundation**
   - Install testing stack (Vitest + Playwright)
   - Initialize shadcn/ui
   - Set up Sentry monitoring
   - Establish component structure

2. **Phase 2: Component Library**
   - Build automotive-themed base components (Button, Card, Dialog)
   - Create gauge components with react-d3-speedometer
   - Set up Storybook (optional)

3. **Phase 3: Real-Time Telemetry**
   - Optimize Supabase subscriptions
   - Build live dashboard with gauges
   - Test performance with Sentry

4. **Phase 4: Analytics & Charts**
   - Integrate Tremor charts
   - Build job history table with TanStack Table
   - Implement responsive layouts

5. **Phase 5: Polish & Performance**
   - Comprehensive test coverage
   - Performance optimization based on Sentry data
   - Cross-device testing with Playwright

**Key Dependencies:**
- Phase 1 must complete before Phase 2 (foundation)
- Phase 3 requires Phase 2 (gauges need base components)
- Phase 4 requires Phase 3 (charts consume same real-time data)
- Phase 5 requires all previous phases (testing entire system)

**Research Flags:**
- Phase 3 may need additional research on WebSocket memory management at scale
- Phase 4 may need custom Tremor theme research for automotive colors
