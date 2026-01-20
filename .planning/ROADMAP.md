# RoadMaster Pro Roadmap

**Project:** RoadMaster Pro - Dashboard UI/UX Redesign
**Core Value:** Immersive telemetry experience that doesn't break the drive
**Depth:** Standard
**Created:** 2026-01-20

## Overview

Transform existing working telemetry system from "terrible UI" to professional automotive-authentic dashboard through systematic refactoring. Foundation-first approach establishes testing infrastructure and fixes critical security/performance issues before UI polish, ensuring safe refactoring of brownfield codebase.

## Phases

### Phase 1: Foundation & Testing
**Goal:** Developers can safely refactor existing code with comprehensive test coverage

**Dependencies:** None (foundation phase)

**Requirements:** TEST-01, TEST-02, TEST-03, TEST-04, TEST-05, TEST-06, TEST-07, TEST-08, TEST-09, TEST-10, DESIGN-01 (partial - establish design system primitives), DESIGN-07 (partial - typography standards)

**Success Criteria:**
1. Developer runs `npm test` and sees all profit calculation functions pass unit tests
2. Developer runs `npm run test:e2e` and sees real-time telemetry flow verified end-to-end
3. Developer runs `npm run test:db` and sees all RLS policies and database triggers tested
4. Developer imports shadcn/ui Button, Card, Badge components with automotive theme applied
5. CI pipeline runs tests automatically on every commit and blocks merge on failure

**Plans:** 6 plans (all complete)
**Status:** Complete
**Completed:** 2026-01-20

Plans:
- [x] 01-01-PLAN.md — Vitest setup + unit tests for profit/efficiency calculations
- [x] 01-02-PLAN.md — Playwright setup + E2E test for live telemetry flow
- [x] 01-03-PLAN.md — pgTAP database/RLS tests
- [x] 01-04-PLAN.md — shadcn/ui initialization + automotive theme + CI pipeline
- [x] 01-05-PLAN.md — Adjust coverage thresholds for brownfield codebase reality (gap closure)
- [x] 01-06-PLAN.md — Trigger CI workflow execution to verify end-to-end (gap closure)

---

### Phase 2: Security Hardening
**Goal:** Dashboard is protected from critical security vulnerabilities and exploits

**Dependencies:** Phase 1 (tests enable safe security refactoring)

**Requirements:** SEC-01, SEC-02, SEC-03, SEC-04, SEC-05

**Success Criteria:**
1. Developer audits codebase and confirms zero service role key usage in client-side code
2. User making 10 telemetry requests in 1 second receives 429 rate limit error after threshold
3. Developer views Sentry dashboard and sees real-time error tracking and performance monitoring
4. API route validates all required fields and returns 400 error for missing user_id before database operation
5. User's API key follows secure generation pattern (rm_ prefix + 64 hex characters)

**Plans:** 4 plans

Plans:
- [ ] 02-01-PLAN.md — Rate limiting infrastructure with Upstash Redis
- [ ] 02-02-PLAN.md — Input validation with Zod schemas
- [ ] 02-03-PLAN.md — Error monitoring with Sentry
- [ ] 02-04-PLAN.md — Apply security layers to all API routes

---

### Phase 3: Design System & Core Fixes
**Goal:** Users experience consistent professional aesthetic across all pages with accurate financial data

**Dependencies:** Phase 1 (design system primitives), Phase 2 (secure foundation)

**Requirements:** DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05, DESIGN-06, DESIGN-07, FIX-01, FIX-02, FIX-03, FIX-04, FIX-05, FIX-06

**Success Criteria:**
1. User opens dashboard on mobile, tablet, and desktop and sees responsive card-based layout on all devices
2. User views any page and experiences dark theme with amber warnings and white/green displays
3. User sees smooth transitions and subtle animations when real-time telemetry data updates
4. User views completed job and sees accurate profit calculation (income $2,500 - fuel $180 - damage $45 = profit $2,275)
5. User sees fuel range calculation showing "285 miles remaining" based on current 60 gallons fuel and 4.75 MPG average
6. User views job history and sees accurate aggregate metrics (fuel consumed, damage taken, avg speed/RPM)

**Plans:** 0 plans

Plans:
- [ ] TBD (created by /gsd:plan-phase 3)

---

### Phase 4: Real-Time Telemetry & Performance
**Goal:** Users glance at live dashboard and instantly see critical truck data without gameplay interruption

**Dependencies:** Phase 3 (design system components), Phase 2 (monitoring for optimization)

**Requirements:** LIVE-01 through LIVE-16, PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, PERF-07

**Success Criteria:**
1. User drives truck in-game and sees live speed, RPM, fuel gauges update smoothly within 500ms
2. User views Route Advisor card and sees current destination, cargo, ETA, and distance updating in real-time
3. User sees all vehicle damage indicators (engine, transmission, chassis, wheels, cabin, cargo) with color-coded warnings
4. User sees cruise control status, parking brake, motor brake, retarder level, air pressure, current gear, and speed limit
5. User leaves dashboard open for 3+ hours without memory leaks or performance degradation
6. User sees "Connected" status when telemetry streaming, "Waiting for game data" when not in-game
7. Database queries run efficiently with specific field selection (no SELECT *) and appropriate indexes
8. Telemetry data older than 30 days is automatically archived or deleted

**Plans:** 0 plans

Plans:
- [ ] TBD (created by /gsd:plan-phase 4)

---

### Phase 5: Analytics & Page Completion
**Goal:** Users access comprehensive business analytics and performance tracking across all 10 pages

**Dependencies:** Phase 4 (real-time patterns established), Phase 3 (design system complete)

**Requirements:** JOBS-01 through JOBS-10, ROUTE-01 through ROUTE-10, ANALYTICS-01 through ANALYTICS-10, COMPANY-01 through COMPANY-08, EXPENSE-01 through EXPENSE-10, HOS-01 through HOS-08, ACHIEVE-01 through ACHIEVE-09

**Success Criteria:**
1. User opens Jobs page and sees complete history with filtering by date, route, cargo type, and profit breakdown per job
2. User opens Routes page and sees profitability analysis sorted by profit per mile with best cargo recommendations
3. User opens Analytics page and sees performance trends (profit, fuel economy, damage) with date range selector
4. User opens Companies page and sees reputation tracking for all delivery companies with relationship status indicators
5. User opens Expenses page and sees monthly cost breakdowns with fuel vs damage comparison charts
6. User opens HOS page and sees driving time tracking with configurable rest alerts
7. User opens Achievements page and sees unlock status with progress bars for locked achievements
8. User navigates between all 10 pages using persistent sidebar with consistent layout and smooth transitions

**Plans:** 0 plans

Plans:
- [ ] TBD (created by /gsd:plan-phase 5)

---

### Phase 6: AI & Polish
**Goal:** Users receive personalized AI-powered route recommendations based on their actual performance data

**Dependencies:** Phase 5 (all analytics data available for AI context)

**Requirements:** AI-01 through AI-10, SETTINGS-01 through SETTINGS-13, EDGE-01 through EDGE-05

**Success Criteria:**
1. User asks AI dispatcher "What route should I take next?" and receives streaming response with specific profit numbers from their history
2. AI provides 1 primary recommendation + 2 alternatives considering current truck status (fuel 45%, damage 8%, location Seattle)
3. User sees conversation history with AI and can start new conversations
4. User configures alert thresholds (fuel 30%, rest 60 min, maintenance 15% damage) in Settings page
5. User views/copies/regenerates API key with confirmation modal in Settings
6. User experiences graceful fallbacks when WebSocket disconnects (automatic polling retry)
7. User sees meaningful empty states for new accounts with no data ("Complete your first job to see analytics")
8. User encounters error and sees error boundary preventing full-page crash with actionable message

**Plans:** 0 plans

Plans:
- [ ] TBD (created by /gsd:plan-phase 6)

---

## Progress Tracking

| Phase | Requirements | Status | Completion |
|-------|-------------|--------|------------|
| 1 - Foundation & Testing | 12 | Complete | 100% |
| 2 - Security Hardening | 5 | Planning | 0% |
| 3 - Design System & Core Fixes | 19 | Pending | 0% |
| 4 - Real-Time Telemetry & Performance | 23 | Pending | 0% |
| 5 - Analytics & Page Completion | 75 | Pending | 0% |
| 6 - AI & Polish | 23 | Pending | 0% |

**Total:** 157 requirement mappings (some requirements contribute to multiple phases)
**v1 Requirements:** 127/127 mapped (100% coverage)

---

## Phase Dependencies

```
Phase 1 (Foundation & Testing)
    ↓
Phase 2 (Security Hardening)
    ↓
Phase 3 (Design System & Core Fixes)
    ↓
Phase 4 (Real-Time Telemetry & Performance)
    ↓
Phase 5 (Analytics & Page Completion)
    ↓
Phase 6 (AI & Polish)
```

**Rationale:**
- Testing first enables safe refactoring of brownfield codebase
- Security fixes critical vulnerabilities before complexity increases
- Design system establishes consistency before building 10 pages
- Real-time optimization informs patterns for analytics pages
- AI requires complete analytics data for context

---

*Last updated: 2026-01-20*
