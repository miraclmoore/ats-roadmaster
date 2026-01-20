# Project State: RoadMaster Pro

## Project Reference

**Core Value:** Immersive telemetry experience that doesn't break the drive

**Current Focus:** Foundation & Testing - Establish comprehensive test coverage and design system primitives for safe brownfield refactoring

**Key Context:** Brownfield project with working telemetry pipeline but "terrible UI" and zero test coverage. Must establish safety net before refactoring existing code to avoid breaking profit calculations and real-time features.

---

## Current Position

**Phase:** 1 of 6 (Foundation & Testing)
**Plan:** 01 of 4 in phase
**Status:** In progress
**Last activity:** 2026-01-20 - Completed 01-01-PLAN.md

**Progress:** ██░░░░░░░░░░░░░░░░░░ 25% (1/4 plans in Phase 1)

**Active Requirements:** TEST-01 through TEST-10, DESIGN-01 (partial), DESIGN-07 (partial)

**Next Milestone:** Developer can run tests for profit calculations and real-time telemetry flows

---

## Performance Metrics

**Requirements:**
- Total v1: 127
- Completed: 0
- In Progress: 0
- Pending: 127
- Coverage: 100%

**Phases:**
- Total: 6
- Completed: 0
- Current: Phase 1
- Remaining: 6

**Velocity:** N/A (project just started)

---

## Accumulated Context

### Recent Decisions

**2026-01-20: Vitest with v8 Coverage (01-01)**
- Decision: Use Vitest with v8 coverage provider for all unit and integration tests
- Rationale: Native ESM support, faster than Jest, accurate coverage with v8 provider
- Outcome: 65 tests passing with 100% coverage for profit and efficiency calculations
- Phase: 01-01

**2026-01-20: Mock Supabase at Module Level (01-01)**
- Decision: Mock Supabase service client at module level for API route tests
- Rationale: Prevents real database calls, ensures fast test execution, predictable test data
- Outcome: 19 API integration tests verify request/response contracts without database
- Phase: 01-01

**2026-01-20: Exclude E2E from Vitest (01-01)**
- Decision: Exclude e2e tests from Vitest configuration
- Rationale: Prevent conflicts between Playwright and Vitest test frameworks
- Outcome: Vitest runs unit/integration tests, Playwright handles e2e separately
- Phase: 01-01

**2026-01-20: shadcn/ui for Design System (01-04)**
- Decision: Use shadcn/ui over Tremor or other component libraries
- Rationale: Copy-paste model provides full control for automotive theming, no version lock-in
- Outcome: Button/Card/Badge components installed with automotive theme applied
- Phase: 01-04

**2026-01-20: Tailwind v4 @theme inline Directive (01-04)**
- Decision: Use hsl() color format with @theme inline directive for Tailwind v4
- Rationale: Tailwind v4 requirement, enables proper theme variable mapping
- Outcome: Automotive color palette (amber primary, steel blue secondary, red accent) applied globally
- Phase: 01-04

**2026-01-20: CI Coverage Reports Always-On (01-04)**
- Decision: Upload coverage reports on every run (not just failures)
- Rationale: Track coverage metrics over time, identify trends
- Outcome: GitHub Actions workflow uploads coverage artifacts with 7-day retention
- Phase: 01-04

**2026-01-20: Root package.json for Database Tests (01-03)**
- Decision: Created root-level package.json for test:db scripts
- Rationale: Supabase directory is at project root, not under web/
- Outcome: Database tests accessible via npm run test:db from project root
- Phase: 01-03

**2026-01-20: RLS Testing with request.jwt.claims.sub (01-03)**
- Decision: Use request.jwt.claims.sub to simulate user authentication in RLS tests
- Rationale: Works with Supabase RLS implementation without complex auth setup
- Outcome: 24 RLS tests verify user data isolation across all tables
- Phase: 01-03

**2026-01-20: Roadmap Created**
- Decision: Foundation-first approach (testing → security → design → features)
- Rationale: Cannot safely refactor brownfield codebase without test coverage; zero tests currently
- Outcome: 6-phase roadmap with strict dependency ordering

**2026-01-20: Standard Depth Selected**
- Decision: Use standard depth (5-8 phases)
- Rationale: Balances granularity with manageable planning overhead
- Outcome: 6 phases derived from natural delivery boundaries

### Key Learnings

**From Codebase Audit:**
- Critical: Profit calculations documented but implementation needs verification via tests
- Critical: Zero test coverage creates risk for refactoring
- Critical: Security vulnerabilities (service role bypass, no rate limiting) must be fixed before scaling
- Critical: Performance bottlenecks (WebSocket memory leaks, unbounded telemetry growth)

**From Research:**
- shadcn/ui copy-paste model provides full control for automotive theming
- Tremor requires @next tag for React 19 support
- WebSocket subscriptions must include cleanup functions to prevent memory leaks
- Throttle real-time updates to 500ms to prevent re-render storms

**From Plan Execution (01-01):**
- toBeCloseTo() essential for floating point comparisons in tests
- Exclude e2e tests from Vitest to prevent framework conflicts
- Mock Supabase at module level provides clean test isolation
- 100% coverage achievable for pure calculation functions

**From Plan Execution (01-04):**
- Tailwind v4 requires CSS variables outside @layer base
- Tailwind v4 @theme inline directive maps variables to utilities
- GitHub Actions with coverage artifacts enables metric tracking
- shadcn/ui components use class-variance-authority for variant management

### Technical Constraints

**SDK Limitations:**
- No weather data available from ATS/ETS SDK
- No navigation route access
- No save file data (bank balance, garages, owned trucks)
- No freight market before job acceptance

**Real-Time Requirements:**
- Telemetry updates at 1Hz from game
- Dashboard must handle high-frequency data without degradation
- Multi-device support (mobile, tablet, monitor)

**Stack Constraints:**
- Next.js 16 + React 19 + TypeScript
- Supabase (PostgreSQL + Auth + Realtime)
- Tailwind CSS 4
- C# plugin compatibility (backend changes must not break existing plugin)

---

## Active Todos

1. Create Phase 1 plan with `/gsd:plan-phase 1`
2. Establish Vitest + Playwright test infrastructure
3. Initialize shadcn/ui with automotive theme
4. Write comprehensive tests for profit calculation functions
5. Create reusable design system components (StatCard, GaugeWidget)

---

## Known Blockers

None currently.

---

## Session Continuity

**Last Session:** 2026-01-20 16:31:40Z
**Activity:** Executed 01-01-PLAN.md (Vitest Testing Infrastructure)
**Outcome:** Vitest installed, 65 tests passing, 100% coverage for calculations

**Stopped at:** Completed 01-01-PLAN.md
**Resume file:** None (plan complete)

**Next Session:**
- Goal: Execute remaining Phase 1 plans (01-02, 01-03, 01-04)
- Expected: Complete component tests, database tests, and design system
- Note: Plan 01-01 complete; 3 more plans in Phase 1

**Context for Handoff:**
- Vitest 4.0.17 installed with jsdom and v8 coverage
- 65 tests passing (22 profit, 24 efficiency, 19 API routes)
- Test infrastructure ready for component testing
- 4 commits made: Vitest config, profit tests, efficiency tests, API route tests

---

*Last updated: 2026-01-20 16:31:40Z*
*Last plan executed: 01-01-PLAN.md*
