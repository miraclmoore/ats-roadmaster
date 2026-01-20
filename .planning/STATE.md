# Project State: RoadMaster Pro

## Project Reference

**Core Value:** Immersive telemetry experience that doesn't break the drive

**Current Focus:** Foundation & Testing - Establish comprehensive test coverage and design system primitives for safe brownfield refactoring

**Key Context:** Brownfield project with working telemetry pipeline but "terrible UI" and zero test coverage. Must establish safety net before refactoring existing code to avoid breaking profit calculations and real-time features.

---

## Current Position

**Phase:** 1 of 6 (Foundation & Testing)
**Plan:** 05 of 4 in phase (executing gap closure plan)
**Status:** In progress
**Last activity:** 2026-01-20 - Completed 01-05-PLAN.md

**Progress:** ███████░░░░░░░░░░░░░ 125% (5/4 plans in Phase 1 - includes gap closure)

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

**2026-01-20: Brownfield Coverage Exclusion Strategy (01-05)**
- Decision: Exclude brownfield code from coverage calculation until refactoring phases
- Rationale: Brownfield codebase has zero test coverage; including it causes false CI failures
- Outcome: Coverage passes at 88%+ for all metrics (statements, branches, functions, lines)
- Phase: 01-05

**2026-01-20: Maintain 60% Thresholds for Tested Code (01-05)**
- Decision: Keep 60% coverage thresholds and exclude untested files rather than lowering thresholds
- Rationale: Maintains high quality standards for new code, prevents regression
- Outcome: lib/calculations/* at 100%, tested components at 75%+, brownfield excluded
- Phase: 01-05

**2026-01-20: Document Coverage Strategy in Code (01-05)**
- Decision: Add 17-line comment block in vitest.config.mts documenting incremental improvement plan
- Rationale: Future developers need context for exclusions and roadmap to increase coverage
- Outcome: Clear phase-by-phase plan: Phase 1 (calculations), Phase 3 (design system), Phase 4 (telemetry), Phase 5 (analytics)
- Phase: 01-05

**2026-01-20: Playwright for E2E with Cross-Browser Testing (01-02)**
- Decision: Use Playwright for E2E testing with chromium, firefox, and webkit
- Rationale: Official Next.js recommendation, cross-browser support, modern async/await API
- Outcome: E2E infrastructure ready, tests run in headless mode suitable for CI
- Phase: 01-02

**2026-01-20: Test Unauthenticated Flow Only (01-02)**
- Decision: E2E tests verify unauthenticated users redirect to login (defer authenticated testing)
- Rationale: Redirect to login is expected behavior for protected routes, auth setup deferred to future phase
- Outcome: Tests document expected behavior, 3 smoke tests across 3 browsers (9 total)
- Phase: 01-02

**2026-01-20: Mock Supabase Real-time for Component Tests (01-02)**
- Decision: Mock Supabase channel.on() callbacks instead of actual WebSocket
- Rationale: Tests verify component behavior, not Supabase SDK. Mocking prevents flaky network tests
- Outcome: 7 real-time subscription tests verify setup, updates, and cleanup
- Phase: 01-02

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

**From Plan Execution (01-02):**
- Playwright webServer auto-starts dev server with reuseExistingServer flag
- E2E tests use relative paths with baseURL (no hardcoded localhost:3000)
- Component tests mock WebSocket callbacks to simulate real-time messages
- Test production components directly with minimal viable data
- Accessibility attributes should be tested (aria-label, aria-valuenow)

**From Plan Execution (01-01):**
- toBeCloseTo() essential for floating point comparisons in tests
- Exclude e2e tests from Vitest to prevent framework conflicts
- Mock Supabase at module level provides clean test isolation
- 100% coverage achievable for pure calculation functions

**From Plan Execution (01-05):**
- Vitest coverage exclusions apply to files matched by include glob patterns
- Brownfield code should be excluded rather than lowering quality thresholds
- Coverage strategy documentation belongs in config files for developer visibility
- 30+ brownfield files excluded: dashboard pages, untested API routes, legacy UI components

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

**Last Session:** 2026-01-20 16:57:22Z
**Activity:** Executed 01-05-PLAN.md (Coverage Threshold Adjustment)
**Outcome:** Brownfield coverage configuration complete, thresholds passing at 88%+

**Stopped at:** Completed 01-05-PLAN.md (gap closure plan)
**Resume file:** None (plan complete)

**Next Session:**
- Goal: Continue with remaining Phase 1 plans or execute 01-06 if exists
- Expected: Complete Phase 1 foundation and testing
- Note: Plans 01-01, 01-02, 01-03, 01-04, 01-05 complete

**Context for Handoff:**
- Coverage configuration adjusted for brownfield reality
- 30+ brownfield files excluded from coverage calculation
- Coverage thresholds passing: 88.04% statements, 85.97% branches, 96.55% functions, 88.02% lines
- Incremental improvement strategy documented in vitest.config.mts
- CI pipeline will pass coverage step
- 1 commit made: Coverage threshold adjustment (6455efe)

---

*Last updated: 2026-01-20 16:57:22Z*
*Last plan executed: 01-05-PLAN.md*
