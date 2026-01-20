# Project Research Summary

**Project:** RoadMaster Pro Dashboard UI/UX Redesign
**Domain:** Real-Time Telemetry Dashboard (Brownfield Refactoring)
**Researched:** January 20, 2026
**Confidence:** HIGH

## Executive Summary

RoadMaster Pro is a real-time companion dashboard for American Truck Simulator players that tracks economic performance through live telemetry. The current working system (Next.js 16 + React 19 + Tailwind v4 + Supabase) has "terrible" UI/UX that needs transformation to "professional but warm" with automotive-authentic aesthetics. This is a brownfield refactoring focused on systematic UI improvements, testing infrastructure, and performance optimization.

**Recommended approach:** Build on the existing stack rather than rebuild. Add shadcn/ui (copy-paste model) for consistent design system primitives, Tremor charts for analytics, and react-d3-speedometer for automotive gauges. Most critically, establish comprehensive testing infrastructure (Vitest + Playwright) before refactoring to prevent regressions. The architecture follows Next.js App Router best practices with Server Components by default and "use client" only for real-time WebSocket subscriptions. Focus on automotive HMI design language (dark theme, warm amber/gold accents, arc gauges) to differentiate from generic business dashboards.

**Key risks:** The existing real-time telemetry system has critical pitfalls that must be addressed during refactoring: WebSocket memory leaks from unclosed subscriptions (crashes after 2-3 hours), unbounded telemetry table growth (31.5M rows/year per user), React re-render storms from unoptimized real-time updates, and zero test coverage for profit calculations. The roadmap must prioritize testing infrastructure first (Phase 1), then security hardening (Phase 2), before attempting performance optimization (Phase 3). Attempting UI polish without fixing these foundational issues will create a beautiful but broken dashboard.

## Key Findings

### Recommended Stack

The research confirms the existing stack is solid (Next.js 16, React 19, Tailwind v4, Supabase). The focus should be on strategic additions rather than replacement. The copy-paste approach with shadcn/ui is critical - it provides full control over automotive theming without npm dependency bloat. Tremor provides dashboard-specific components (BarList, KPI cards, Tracker) built on Tailwind CSS 4 for consistency. Testing infrastructure is the highest priority addition, as the project currently has ZERO test coverage.

**Core technologies:**
- **shadcn/ui (copy-paste)**: Design system primitives - Full customization for automotive color scheme, no breaking changes, tree-shakeable
- **Tremor 4.x + react-d3-speedometer**: Data visualization - Tremor for analytics charts, speedometer for automotive gauges, both React 19 compatible
- **TanStack Table v8**: Job history tables - Already in stack, headless for custom styling, performant with large datasets
- **Vitest + Playwright**: Testing infrastructure - Official Next.js recommendation, 5-10x faster than Jest, critical for safe refactoring
- **Sentry**: Performance monitoring - Tracks real-time issues, session replay for debugging, free tier sufficient

**Critical version requirements:**
- Tremor requires @next tag for React 19 support (`npm install @tremor/react@next`)
- react-d3-speedometer requires v3.x for React 19 compatibility
- Storybook has minor React 19 issues - defer to Phase 2 or later

### Expected Features

Dashboard UI/UX research reveals clear patterns: users expect card-based layouts, dark themes, and real-time updates as table stakes. The differentiators are automotive-authentic design (HMI principles, arc gauges, warm accents) and context-aware information density (lower density for overview pages, higher for analysis). Anti-features to avoid include fully customizable layouts (breaks consistency), 3D charts (distorts data), and weather widgets (SDK doesn't provide weather data).

**Must have (table stakes):**
- Card-based layout with consistent grid - Industry standard, reduces cognitive load
- Dark theme with warm accents - Fleet tracking standard, reduces eye strain during gameplay
- Real-time gauge updates (1Hz minimum) - Core value proposition, must update smoothly
- Standard status color coding - Green/yellow/red universal convention
- Responsive grid layouts - Users glance during gameplay (desktop) and check between sessions (mobile)
- Typography hierarchy for numbers vs labels - Numbers 2-3x larger, bold weight
- Sidebar navigation for 10 pages - Persistent, visible navigation scales better than tabs

**Should have (competitive):**
- Automotive HMI design language - Feels like truck instrument cluster, not corporate BI tool
- Context-aware information density - Overview pages (low density), analysis pages (higher density)
- Sparklines in job history - Shows trend without separate charts, "data-intense, design-simple"
- Multi-metric cards with smart layout - Consistent flow: Label → Value → Delta → Timeframe
- Route profitability heatmap - Color-coded table showing which routes made money

**Defer (v2+):**
- Fully customizable dashboard layouts - Breaks consistent mental model, too complex
- Advanced chart interactions (zoom, pan) - Wait until users demonstrate need
- Dark/light theme toggle - Users explicitly want dark, no one requested light mode
- 3D charts and gauges - Distorts data, accessibility issues, performance cost

### Architecture Approach

The architecture follows Next.js App Router server-first paradigm: Server Components by default for data fetching, Client Components only where interactivity is needed. Real-time telemetry uses throttled WebSocket updates (500ms) to prevent UI thrashing. The design system follows atomic design with shadcn/ui as atoms, composed widgets as molecules, and domain-specific components as organisms. State management is tripartite: server state (Supabase with stale-while-revalidate), real-time state (WebSocket with throttling), and local state (localStorage for preferences).

**Major components:**
1. **Design System Layer** - Atoms (shadcn/ui), Molecules (StatCard, GaugeWidget), Organisms (LiveDashboard, JobsTable)
2. **Presentation Layer** - Server Components (data fetch, auth) pass props to Client Components (interactivity, WebSocket subscriptions)
3. **State Management Layer** - Server state (cached with revalidation), Real-time state (throttled to 500ms), Local state (UI preferences)
4. **Data & Services Layer** - Supabase PostgreSQL + Realtime, row-level security enforced

**Key patterns:**
- **Server-First with Client Islands**: Server Components by default, "use client" only for hooks/events
- **Throttled Real-Time Updates**: 500ms throttle prevents React re-render storms (1Hz SDK → 2Hz UI)
- **Atomic Design with shadcn/ui**: Consistent component hierarchy ensures maintainability across 10 pages
- **Optimistic UI with Reconciliation**: Update immediately, reconcile with server for perceived performance

### Critical Pitfalls

Research identified 13 domain-specific pitfalls, with 4 critical ones that can cause rewrites or security breaches. These map directly to roadmap phases - Phase 1 must address testing gaps, Phase 2 must fix security issues, Phase 3 handles performance bottlenecks.

1. **WebSocket Memory Leaks** - Real-time subscriptions accumulate without cleanup, causing crashes after 2-3 hours. Prevention: Always return cleanup function in useEffect with `supabase.removeChannel(channel)`. Detection: Memory profiler shows increasing heap size.

2. **Service Role Key Exposure** - Using service role keys client-side bypasses all RLS, exposing entire database. Prevention: Use anon key client-side, service role ONLY in backend API routes. Detection: Grep repo for service role key in client code.

3. **Unbounded Telemetry Table Growth** - 3,600 rows/hour per user = 31.5M rows/year, causing query timeouts and storage exhaustion. Prevention: Implement PostgreSQL partitioning + 90-day retention policy + downsampling old data. Detection: Monitor table size with `pg_size_pretty()`.

4. **Missing Rate Limiting** - No API throttling allows DDoS, database connection exhaustion, billing overages. Prevention: Implement Upstash Redis rate limiting (2 req/sec per user) or Cloudflare rules. Detection: Monitor requests/second in Supabase dashboard.

5. **React Re-render Storms** - Real-time updates trigger full component tree re-renders, causing jank and 100% CPU. Prevention: Isolate real-time state to specific components, use React.memo() and useMemo(). Detection: React DevTools Profiler shows >10 re-renders per second.

## Implications for Roadmap

Based on research, the roadmap must follow strict dependency order: testing infrastructure before refactoring, security hardening before scaling, performance optimization only after measurement. The architecture research reveals 5 natural phases that address pitfalls systematically.

### Phase 1: Testing & Design System Foundation (Week 1)
**Rationale:** Cannot safely refactor existing code without tests. The current codebase has ZERO test coverage for profit calculations, real-time subscriptions, or UI components. Building UI components without a design system will create inconsistency across 10 pages.

**Delivers:**
- Vitest + React Testing Library + Playwright setup
- shadcn/ui initialized with base components (Button, Card, Badge, Dialog)
- 3-5 reusable widgets (StatCard, GaugeWidget, AlertBanner)
- Comprehensive test suite for calculation functions (profit, fuel economy, MPG)
- Database test suite for RLS policies and triggers

**Addresses features:**
- Consistent card-based layout (table stakes)
- Typography hierarchy standards (table stakes)

**Avoids pitfalls:**
- Pitfall 10: Untested profit calculations
- Pitfall 13: No strategy for testing database triggers/RLS
- Pitfall 9: Flaky real-time tests (establish robust async test patterns)

**Research flags:** Standard patterns, no additional research needed. Vitest and Playwright are well-documented with Next.js.

---

### Phase 2: Security Hardening (Week 1)
**Rationale:** Security vulnerabilities must be fixed before refactoring increases complexity. Service role key exposure and missing rate limiting are CRITICAL severity and can be exploited immediately.

**Delivers:**
- Audit all Supabase clients (ensure anon key client-side, service role only in API routes)
- Implement rate limiting with Upstash Redis (2 req/sec per user for telemetry endpoint)
- Add Sentry error tracking and performance monitoring
- Security test suite (RLS bypass tests, rate limit enforcement tests)

**Addresses features:**
- N/A (security is foundational, not user-facing)

**Avoids pitfalls:**
- Pitfall 2: Service role key exposure bypassing RLS
- Pitfall 4: Missing rate limiting enables DDoS
- Pitfall 12: No monitoring/observability (partial - sets up Sentry)

**Research flags:** May need research on Upstash Redis integration patterns with Next.js API routes.

---

### Phase 3: Real-Time Telemetry Optimization (Week 2)
**Rationale:** Real-time is the core value proposition but currently has memory leaks and performance issues. Must fix before adding more UI complexity. Dependencies from Phase 1 (testing) and Phase 2 (monitoring) enable safe optimization.

**Delivers:**
- WebSocket memory leak fixes (cleanup functions in all useEffect hooks)
- Throttled real-time updates (500ms) with custom hook
- Live dashboard page with automotive gauges (react-d3-speedometer)
- Component isolation to prevent re-render storms (React.memo, useMemo)
- E2E tests for real-time flows with Playwright

**Addresses features:**
- Real-time gauge updates (table stakes)
- Automotive HMI design language (differentiator)
- Persistent "current job" widget (differentiator)

**Avoids pitfalls:**
- Pitfall 1: WebSocket memory leaks
- Pitfall 6: React re-render storms
- Pitfall 9: Flaky real-time tests (uses polling patterns established in Phase 1)

**Research flags:** Standard patterns. Supabase Realtime + React hooks well-documented.

---

### Phase 4: Analytics & Dashboard Pages (Week 2-3)
**Rationale:** With testing, security, and real-time foundation solid, can safely build out remaining 9 pages. Tremor charts + TanStack Table enable rapid development of analytics features.

**Delivers:**
- Integrate Tremor charts (AreaChart for fuel consumption, BarList for route profitability, DonutChart for expenses)
- Job history table with TanStack Table (sorting, filtering, pagination)
- Analytics page with route profitability heatmap
- Responsive layouts for all 10 pages (mobile, tablet, desktop breakpoints)
- Sidebar navigation component

**Addresses features:**
- Responsive grid layouts (table stakes)
- Sidebar navigation (table stakes)
- Route profitability heatmap (differentiator)
- Sparklines in job history (differentiator)
- Context-aware information density (differentiator)

**Avoids pitfalls:**
- Pitfall 5: N+1 query problem (use Supabase relationship syntax for JOINs)
- Pitfall 7: SELECT * queries (audit all queries, select only needed columns)
- Pitfall 8: Stale data from missing cache invalidation (configure revalidation per route)

**Research flags:** May need research on custom Tremor themes for automotive color palette (amber/gold accents).

---

### Phase 5: Performance Optimization & Monitoring (Week 4)
**Rationale:** Only after all features implemented can we measure real bottlenecks. Premature optimization wastes time. Phase 2 Sentry setup enables data-driven optimization.

**Delivers:**
- PostgreSQL partitioning for telemetry table (monthly partitions)
- 90-day retention policy (delete old raw data, keep aggregated summaries)
- Virtualized lists for job history (>100 rows)
- Code splitting for heavy chart components
- Database indexes for frequently-queried columns
- Comprehensive monitoring dashboards (query performance, real-time subscription health, API response times)

**Addresses features:**
- N/A (optimization is behind-the-scenes)

**Avoids pitfalls:**
- Pitfall 3: Unbounded telemetry table growth
- Pitfall 5: N+1 query problem (final audit and optimization)
- Pitfall 12: No monitoring/observability (complete implementation)

**Research flags:** May need research on PostgreSQL partitioning automation with pg_cron and downsampling strategies for time-series data.

---

### Phase Ordering Rationale

**Why testing first:** Cannot safely refactor existing "terrible UI" without comprehensive test coverage. The current zero-test state means any change risks breaking profit calculations (core feature). Phase 1 establishes safety net.

**Why security second:** Service role key exposure and missing rate limiting are exploitable NOW. Must fix before increasing attack surface with new features. Also, Sentry setup in Phase 2 enables performance monitoring needed for Phase 5.

**Why real-time third:** It's the core value proposition but currently broken (memory leaks, re-render storms). Fixing it requires testing infrastructure (Phase 1) and monitoring (Phase 2). Also, real-time optimization informs component patterns used in Phase 4.

**Why analytics fourth:** Building 9 additional pages requires stable foundation (testing, security, real-time patterns). Tremor + TanStack Table make this phase rapid once patterns are established.

**Why performance last:** Can't optimize what you can't measure. Sentry from Phase 2 provides data. Also, premature optimization wastes time - measure real bottlenecks after features complete.

**Dependency chain:**
```
Phase 1 (Testing) → Phase 2 (Security) → Phase 3 (Real-time) → Phase 4 (Analytics) → Phase 5 (Performance)
       ↓                    ↓                    ↓                      ↓                      ↓
   Safety net         Monitoring          Core feature          Feature complete        Optimization
```

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 2:** Upstash Redis rate limiting integration patterns with Next.js API routes (not covered in standard docs)
- **Phase 4:** Custom Tremor theming for automotive color palette (amber/gold accents) - may need design system research
- **Phase 5:** PostgreSQL partitioning automation strategies and time-series downsampling best practices

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Vitest + Playwright setup well-documented in official Next.js docs
- **Phase 3:** Supabase Realtime + React hooks standard pattern, official docs comprehensive
- **Phase 4:** Tremor charts and TanStack Table have extensive examples and documentation

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations verified with official docs (Next.js, shadcn/ui, Tremor, Vitest, Playwright, Supabase). React 19 compatibility confirmed for all libraries. |
| Features | MEDIUM-HIGH | Dashboard design patterns verified with multiple authoritative sources (fleet tracking, automotive HMI, 2026 design trends). Some patterns inferred from general principles. |
| Architecture | HIGH | Next.js App Router patterns from official docs. Supabase Realtime architecture from official benchmarks. React performance patterns verified with multiple sources. |
| Pitfalls | HIGH | Critical pitfalls (memory leaks, RLS bypass, unbounded growth) verified with official Supabase docs and AWS/PostgreSQL resources. Real-world examples cited. |

**Overall confidence:** HIGH

The stack and architecture recommendations are rock-solid, verified with official documentation. Feature research has strong consensus across multiple sources. Pitfall research is comprehensive with real-world examples and official documentation. The main uncertainty is in UI/UX aesthetic details (exact color values, component spacing) which require iteration during implementation.

### Gaps to Address

**Automotive color palette specifics:** Research identified warm amber/gold/clay tones as differentiators but exact Tailwind v4 color values need design iteration. Recommendation: Start with suggested palette from FEATURES.md (background #0f1419, accent #d4922f), iterate based on visual testing.

**Tremor custom theming:** Tremor documentation shows theming capabilities but applying automotive aesthetic (warm accents, dark mode) may require trial-and-error. Recommendation: Budget time in Phase 4 for theme experimentation, potentially create custom Tremor theme file.

**Real-world user preferences:** Research based on general dashboard patterns, not specific ATS player surveys. Recommendation: Validate assumptions after MVP with user feedback, particularly around information density and gauge styles.

**Rate limiting thresholds:** Recommended 2 req/sec based on 1Hz SDK sampling with buffer, but optimal threshold may vary by user. Recommendation: Start conservative (2 req/sec), monitor in Phase 2, adjust based on real usage patterns.

**Data retention period:** 90-day retention recommended but ATS players may want longer history for year-over-year comparisons. Recommendation: Make configurable in user preferences, default to 90 days with option to extend.

## Sources

### Primary (HIGH confidence)
- [Next.js Testing: Vitest](https://nextjs.org/docs/app/guides/testing/vitest) - Official testing recommendations
- [Next.js Testing: Playwright](https://nextjs.org/docs/pages/guides/testing/playwright) - Official E2E testing guide
- [shadcn/ui React 19 Documentation](https://ui.shadcn.com/docs/react-19) - React 19 compatibility confirmed
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) - RLS best practices
- [Supabase Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) - Integration patterns
- [Supabase Realtime Benchmarks](https://supabase.com/docs/guides/realtime/benchmarks) - Performance characteristics
- [Supabase Auth Rate Limits](https://supabase.com/docs/guides/auth/rate-limits) - Rate limiting documentation
- [Next.js Caching Guide](https://nextjs.org/docs/app/guides/caching) - Cache invalidation strategies
- [TanStack Table Documentation](https://tanstack.com/table/latest) - Table implementation
- [Tremor Documentation](https://www.tremor.so/) - Chart library API

### Secondary (MEDIUM confidence)
- [9 Dashboard Design Principles (2026) | DesignRush](https://www.designrush.com/agency/ui-ux-design/dashboard/trends/dashboard-design-principles) - UI/UX patterns
- [6 Human-Centered HMI Design Principles for Smarter Automotive](https://www.aufaitux.com/blog/mi-design-principles-automotive-ux/) - Automotive design language
- [Fleet Management Dashboards: Real-Time Insights & Metrics](https://www.fleetio.com/features/fleet-management-dashboards) - Industry patterns
- [React Memory Leaks That Kill Performance](https://www.codewalnut.com/insights/5-react-memory-leaks-that-kill-performance) - WebSocket cleanup patterns
- [PostgreSQL Partitioning for Time-Series Data](https://stormatics.tech/blogs/improving-postgresql-performance-with-partitioning) - Partitioning strategies
- [AWS High-Performance Time-Series Tables](https://aws.amazon.com/blogs/database/designing-high-performance-time-series-data-tables-on-amazon-rds-for-postgresql/) - Time-series optimization
- [N+1 Query Problem Explained](https://planetscale.com/blog/what-is-n-1-query-problem-and-how-to-solve-it) - Query optimization
- [React Re-renders Cut by 60% in Complex Dashboard](https://medium.com/@sosohappy/react-rendering-bottleneck-how-i-cut-re-renders-by-60-in-a-complex-dashboard-ed14d5891c72) - Performance patterns

### Tertiary (LOW confidence)
- [Top 20 Modern Color Combinations Must Use in 2026](https://prodesignschool.com/design/top-20-modern-color-combinations-must-use-in-2026/) - Color palette trends
- [Building a Luxury Analytics Dashboard with Next.js 16 & Tailwind v4](https://dev.to/fytroy/building-a-luxury-analytics-dashboard-with-nextjs-16-tailwind-v4-155h) - Implementation examples
- Community blog posts on React performance optimization, dashboard design patterns

---
*Research completed: January 20, 2026*
*Ready for roadmap: yes*
