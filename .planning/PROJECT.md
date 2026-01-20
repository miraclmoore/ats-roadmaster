# RoadMaster Pro

## What This Is

RoadMaster Pro is a premium cloud-based companion dashboard for American Truck Simulator and Euro Truck Simulator 2 that combines immersive real-time telemetry display with business intelligence analytics and AI-powered insights. Players run the app on a second screen (tablet, phone, or monitor) to access critical truck data and business metrics without alt-tabbing or pausing their game, maintaining complete immersion while making data-driven decisions about routes, performance, and profitability.

## Core Value

**Immersive telemetry experience that doesn't break the drive.** Players glance at their second screen and instantly see everything they need - speed, RPM, fuel, route details, vehicle status - without interrupting gameplay. Everything else supports this: the analytics help them choose better routes, the AI recommends profitable jobs, but the live dashboard is what keeps them in the truck.

## Requirements

### Validated

Existing capabilities from current codebase:

- ✓ C# plugin captures ATS/ETS telemetry via SDK at 1Hz — existing
- ✓ Plugin streams telemetry to cloud via HTTP POST — existing
- ✓ Supabase backend (PostgreSQL + Auth + Realtime) — existing
- ✓ Real-time WebSocket updates to dashboard — existing
- ✓ User authentication with API key generation — existing
- ✓ Database schema for jobs, telemetry, achievements, companies — existing
- ✓ Live telemetry display with gauges (speed, RPM, fuel) — existing
- ✓ Route Advisor card (destination, cargo, ETA, distance) — existing
- ✓ Routes page showing profitability analysis — existing
- ✓ Expenses page tracking fuel and damage costs — existing
- ✓ Database triggers for profit calculations — existing
- ✓ Company stats tracking (jobs completed, on-time %, damage) — existing
- ✓ Multi-device responsive design foundations — existing

### Active

New work for this brownfield project:

#### Design System Overhaul
- [ ] **DESIGN-01**: Complete UI/UX redesign following "professional but warm" aesthetic
- [ ] **DESIGN-02**: Implement automotive-authentic color palette (dark theme, amber warnings, white/green displays)
- [ ] **DESIGN-03**: Card-based layout system consistent across all 10 pages
- [ ] **DESIGN-04**: Dense information presentation without clutter
- [ ] **DESIGN-05**: Responsive layouts optimized for mobile, tablet, and monitor
- [ ] **DESIGN-06**: Smooth transitions and subtle animations for real-time data

#### Core Functionality Fixes
- [ ] **FIX-01**: Verify and fix profit calculation implementation (fuel cost, damage cost, profit per mile)
- [ ] **FIX-02**: Implement proper fuel range calculation based on current fuel and average MPG
- [ ] **FIX-03**: Fix telemetry data aggregation for completed jobs (fuel consumed, damage taken, avg speed/RPM)

#### Security & Performance
- [ ] **SEC-01**: Implement rate limiting on API endpoints (especially telemetry at 1Hz)
- [ ] **SEC-02**: Move API keys to environment variables, create example config files
- [ ] **SEC-03**: Audit service role client usage, add secondary user_id validation
- [ ] **PERF-01**: Replace SELECT * queries with specific field selections
- [ ] **PERF-02**: Implement telemetry retention policy (archive/delete old data after 7-30 days)
- [ ] **PERF-03**: Add caching layer for route statistics and expensive queries
- [ ] **PERF-04**: Optimize database indexes for common query patterns

#### Page Completion
- [ ] **PAGE-01**: Redesign Live Telemetry page with complete vehicle status, cruise control, alerts
- [ ] **PAGE-02**: Complete Jobs page with history, filtering, profit breakdown
- [ ] **PAGE-03**: Enhance Routes page with cargo type analysis and best route recommendations
- [ ] **PAGE-04**: Build Analytics page with performance trends and driving efficiency metrics
- [ ] **PAGE-05**: Complete Companies page showing reputation and relationship tracking
- [ ] **PAGE-06**: Enhance Expenses page with monthly breakdowns and cost trends
- [ ] **PAGE-07**: Build HOS (Hours of Service) page tracking driving time and rest requirements
- [ ] **PAGE-08**: Complete Achievements page with progress tracking and unlocks
- [ ] **PAGE-09**: Build AI page with Claude-powered route recommendations based on user data
- [ ] **PAGE-10**: Complete Settings page with alert thresholds, units, preferences, API key management

#### Testing & Quality
- [ ] **TEST-01**: Set up testing framework (Vitest + React Testing Library)
- [ ] **TEST-02**: Write tests for profit calculation functions
- [ ] **TEST-03**: Write tests for API route handlers
- [ ] **TEST-04**: Add component render tests for critical UI
- [ ] **TEST-05**: Set up CI pipeline to run tests

#### Edge Cases & Polish
- [ ] **EDGE-01**: Handle network disconnections gracefully in plugin
- [ ] **EDGE-02**: Implement fallback polling when WebSocket fails
- [ ] **EDGE-03**: Add loading states and skeleton screens
- [ ] **EDGE-04**: Create meaningful empty states for new users
- [ ] **EDGE-05**: Add error boundaries to prevent full-page crashes

### Out of Scope

- Multi-player/social features — Solo experience, not a social platform
- Mobile app (native iOS/Android) — Web-first, responsive design sufficient
- Garage/truck management — SDK provides no access to save file data (garages, bank balance, owned trucks)
- Freight market browser — SDK cannot see available jobs before acceptance
- Hired driver tracking — SDK only provides player's truck telemetry, not AI drivers
- Weather integration — SDK provides no weather data
- Navigation route overlay — SDK limitation, cannot access navigation data
- Real-world traffic/weather APIs — Game randomizes these, no correlation with reality
- Video streaming/recording — Out of scope for dashboard app
- VR support — Not applicable for second-screen dashboard
- Offline mode — Cloud-based by design, requires connection

## Context

**Brownfield project** - Existing codebase with solid foundation but needs major refinement:

- **What works:** Telemetry pipeline (game → plugin → cloud → dashboard), database schema, real-time updates, basic pages
- **What's broken:** UI/UX is scattered and unprofessional, profit calculations may be buggy, zero test coverage, security vulnerabilities, performance issues
- **Why now:** Frustrated with current state, needs structured approach to audit and fix while completing missing features

**Technical environment:**
- ATS/ETS SDK v1.13+ (C# plugin via memory-mapped file)
- Next.js 16 + React 19 + TypeScript
- Supabase (PostgreSQL + Auth + Realtime)
- Anthropic Claude API for AI features
- Tailwind CSS 4 for styling

**User research findings:**
- Existing solutions only solve half the problem (either telemetry OR analytics, not both)
- Users want money/profit displays (missing from other tools)
- Navigation route data unavailable (SDK limitation - accepted)
- Fuel range calculations highly desired
- TrackSim/TrucksBook provide job logging but no real-time dashboard
- SIM Dashboard/SimHub provide gauges but no business analytics

**Design inspiration:**
- Professional fleet dashboard aesthetic (card-based, dark theme, organized)
- Automotive-authentic instead of corporate (amber warnings, white/green displays)
- "Professional but warm" - clean and organized but approachable

**Codebase concerns from audit:**
- Critical: Profit calculations documented but implementation needs verification
- Critical: Zero test coverage
- High: Security issues (plain text API keys, no rate limiting, service role bypassing RLS)
- High: Performance bottlenecks (SELECT *, unbounded telemetry growth, no caching)
- Medium: Technical debt (TypeScript @ts-ignore, magic numbers, HttpClient misuse in C#)

## Constraints

- **SDK Limitations**: Can only access data ATS/ETS SDK provides - no weather, no navigation routes, no save file data (bank balance, garages), no freight market before job acceptance
- **Real-time requirement**: Telemetry updates at 1Hz, dashboard must handle high-frequency data without performance degradation
- **Multi-device support**: Must work seamlessly on mobile (phone), tablet, and desktop/monitor with responsive layouts
- **Immersion priority**: Second-screen experience means player never needs to alt-tab or pause game
- **Solo development**: Just for personal use initially, no multi-user features or public launch pressure
- **Existing plugin compatibility**: C# plugin already written and working, backend changes must maintain compatibility

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Redesign UI instead of incremental fixes | Current UI described as "terrible" - better to establish design system upfront than patch | — Pending |
| Keep Dribbble-inspired card layout | User selected this as reference for "clean, tight, professional" aesthetic | — Pending |
| Automotive color palette (amber/white/green) | Matches real truck dashboards, feels authentic vs corporate teal/blue | — Pending |
| "Professional but warm" tone | Balance between gaming energy and organized utility, approachable not cold | — Pending |
| Complete all 10 pages | User specified "all 10 pages done" - comprehensive solution not MVP | — Pending |
| Fix security/performance before launch | Critical vulnerabilities identified, must address before any public use | — Pending |
| Add testing framework | Zero coverage is unacceptable, need regression safety for refactoring | — Pending |

---
*Last updated: 2026-01-20 after initialization*
