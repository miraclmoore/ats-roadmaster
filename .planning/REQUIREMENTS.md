# Requirements: RoadMaster Pro

**Defined:** 2026-01-20
**Core Value:** Immersive telemetry experience that doesn't break the drive

## v1 Requirements

Requirements for complete dashboard redesign and feature completion.

### Design System

- [ ] **DESIGN-01**: User sees consistent card-based layout across all 10 pages
- [ ] **DESIGN-02**: User experiences dark theme with automotive-authentic colors (amber warnings, white/green displays)
- [ ] **DESIGN-03**: User can view dashboard on mobile, tablet, or monitor with responsive layouts
- [ ] **DESIGN-04**: User sees smooth transitions and animations for real-time data updates
- [ ] **DESIGN-05**: User experiences "professional but warm" aesthetic throughout app
- [ ] **DESIGN-06**: User can navigate between 10 pages using consistent sidebar navigation
- [ ] **DESIGN-07**: User sees high-contrast typography with clear visual hierarchy

### Core Functionality Fixes

- [ ] **FIX-01**: User sees accurate profit calculation (income - fuel cost - damage cost)
- [ ] **FIX-02**: User sees accurate profit per mile calculation
- [ ] **FIX-03**: User sees fuel range calculation based on current fuel and average MPG
- [ ] **FIX-04**: User sees accurate fuel consumed totals for completed jobs
- [ ] **FIX-05**: User sees accurate damage taken percentage for completed jobs
- [ ] **FIX-06**: User sees accurate average speed and RPM for completed jobs

### Security

- [ ] **SEC-01**: API endpoints have rate limiting to prevent DDoS (different limits for telemetry vs mutations)
- [ ] **SEC-02**: API keys are stored in environment variables, not plain text config files
- [ ] **SEC-03**: Service role client usage includes secondary user_id validation
- [ ] **SEC-04**: User API keys follow secure generation pattern (rm_ + 64 hex chars)
- [ ] **SEC-05**: API routes validate all required fields before database operations

### Performance

- [ ] **PERF-01**: Database queries select specific fields instead of SELECT *
- [ ] **PERF-02**: Telemetry data older than 30 days is automatically archived or deleted
- [ ] **PERF-03**: Route statistics queries use caching to avoid repeated expensive calculations
- [ ] **PERF-04**: Database has appropriate indexes for common query patterns
- [ ] **PERF-05**: Supabase real-time subscriptions filter by user_id to prevent DB read explosion
- [ ] **PERF-06**: WebSocket subscriptions are properly cleaned up to prevent memory leaks
- [ ] **PERF-07**: Real-time UI updates are throttled to 500ms to prevent re-render storms

### Live Telemetry Page

- [ ] **LIVE-01**: User sees real-time speed gauge updated every 500ms
- [ ] **LIVE-02**: User sees real-time RPM gauge updated every 500ms
- [ ] **LIVE-03**: User sees real-time fuel level gauge with percentage and gallons
- [ ] **LIVE-04**: User sees fuel range calculation (miles remaining based on current fuel and MPG)
- [ ] **LIVE-05**: User sees Route Advisor card with destination, cargo, ETA, and distance
- [ ] **LIVE-06**: User sees current speed limit indicator
- [ ] **LIVE-07**: User sees cruise control status (enabled/disabled and set speed)
- [ ] **LIVE-08**: User sees parking brake status indicator
- [ ] **LIVE-09**: User sees motor brake status indicator
- [ ] **LIVE-10**: User sees retarder level indicator
- [ ] **LIVE-11**: User sees air pressure gauge
- [ ] **LIVE-12**: User sees vehicle damage indicators for engine, transmission, chassis, wheels, cabin, cargo
- [ ] **LIVE-13**: User sees current gear display
- [ ] **LIVE-14**: User sees "Connected" status when telemetry is streaming
- [ ] **LIVE-15**: User sees "Waiting for game data" when no telemetry available
- [ ] **LIVE-16**: User can switch between different dashboard profiles (compact, detailed, custom)

### Jobs Page

- [ ] **JOBS-01**: User sees complete job history sorted by most recent first
- [ ] **JOBS-02**: User can filter jobs by date range
- [ ] **JOBS-03**: User can filter jobs by route (origin/destination)
- [ ] **JOBS-04**: User can filter jobs by cargo type
- [ ] **JOBS-05**: User sees profit breakdown for each job (income, fuel cost, damage cost, net profit)
- [ ] **JOBS-06**: User sees performance metrics for each job (fuel economy, damage %, on-time status)
- [ ] **JOBS-07**: User sees job duration and completion time
- [ ] **JOBS-08**: User can view job details including cargo weight and distance
- [ ] **JOBS-09**: User sees visual indicator for late deliveries
- [ ] **JOBS-10**: User sees summary cards showing total jobs, total profit, average profit per mile

### Routes Page

- [ ] **ROUTE-01**: User sees list of all routes driven, sorted by profitability
- [ ] **ROUTE-02**: User sees profit per mile for each route
- [ ] **ROUTE-03**: User sees number of jobs completed on each route
- [ ] **ROUTE-04**: User sees average damage percentage for each route
- [ ] **ROUTE-05**: User sees on-time delivery percentage for each route
- [ ] **ROUTE-06**: User sees total distance driven on each route
- [ ] **ROUTE-07**: User sees best cargo type for each route (highest profit per mile)
- [ ] **ROUTE-08**: User sees summary showing best route, total routes, total jobs
- [ ] **ROUTE-09**: User can click route to see detailed job history for that route
- [ ] **ROUTE-10**: User sees route profitability trends over time

### Analytics Page

- [ ] **ANALYTICS-01**: User sees overall performance trends (profit, fuel economy, damage)
- [ ] **ANALYTICS-02**: User sees driving efficiency metrics (average speed, RPM patterns)
- [ ] **ANALYTICS-03**: User sees monthly income and expense breakdown
- [ ] **ANALYTICS-04**: User sees fuel economy trends over time
- [ ] **ANALYTICS-05**: User sees damage trends over time
- [ ] **ANALYTICS-06**: User sees on-time delivery percentage trends
- [ ] **ANALYTICS-07**: User sees top 5 most profitable routes chart
- [ ] **ANALYTICS-08**: User sees cargo type profitability comparison
- [ ] **ANALYTICS-09**: User sees total miles driven and total jobs completed
- [ ] **ANALYTICS-10**: User can select date range for analytics

### Companies Page

- [ ] **COMPANY-01**: User sees list of all companies they've delivered to
- [ ] **COMPANY-02**: User sees jobs completed count for each company
- [ ] **COMPANY-03**: User sees on-time delivery percentage for each company
- [ ] **COMPANY-04**: User sees average damage percentage for each company
- [ ] **COMPANY-05**: User sees reputation rating for each company (based on on-time % and damage)
- [ ] **COMPANY-06**: User can sort companies by jobs completed, on-time %, or damage
- [ ] **COMPANY-07**: User sees company relationship status indicator (excellent/good/fair/poor)
- [ ] **COMPANY-08**: User can click company to see detailed job history

### Expenses Page

- [ ] **EXPENSE-01**: User sees total fuel costs across all jobs
- [ ] **EXPENSE-02**: User sees total damage costs across all jobs
- [ ] **EXPENSE-03**: User sees total expenses (fuel + damage)
- [ ] **EXPENSE-04**: User sees net profit (income - expenses)
- [ ] **EXPENSE-05**: User sees average fuel cost per job
- [ ] **EXPENSE-06**: User sees average damage cost per job
- [ ] **EXPENSE-07**: User sees monthly expense breakdown chart
- [ ] **EXPENSE-08**: User sees expense category comparison (fuel vs damage)
- [ ] **EXPENSE-09**: User sees expense trends over time
- [ ] **EXPENSE-10**: User can filter expenses by date range

### HOS (Hours of Service) Page

- [ ] **HOS-01**: User sees total driving time from telemetry data
- [ ] **HOS-02**: User sees driving time for current session
- [ ] **HOS-03**: User sees estimated time until rest required (configurable threshold)
- [ ] **HOS-04**: User receives alert when approaching rest time threshold
- [ ] **HOS-05**: User sees driving time trends over days/weeks
- [ ] **HOS-06**: User can configure rest alert threshold in settings
- [ ] **HOS-07**: User sees average session duration
- [ ] **HOS-08**: User sees longest continuous drive time

### Achievements Page

- [ ] **ACHIEVE-01**: User sees all available achievements with unlock status
- [ ] **ACHIEVE-02**: User sees progress toward locked achievements
- [ ] **ACHIEVE-03**: User sees achievement categories (career, distance, financial, efficiency, performance)
- [ ] **ACHIEVE-04**: User sees achievement unlock date for completed achievements
- [ ] **ACHIEVE-05**: User sees achievement descriptions and requirements
- [ ] **ACHIEVE-06**: User sees visual indicator for newly unlocked achievements
- [ ] **ACHIEVE-07**: User sees total achievements unlocked count
- [ ] **ACHIEVE-08**: User can filter achievements by category
- [ ] **ACHIEVE-09**: User can filter achievements by locked/unlocked status

### AI Page

- [ ] **AI-01**: User can ask AI dispatcher for route recommendations
- [ ] **AI-02**: AI provides recommendations based on user's actual historical data
- [ ] **AI-03**: AI shows specific profit numbers from user's route history
- [ ] **AI-04**: AI provides 1 primary recommendation + 2 alternatives
- [ ] **AI-05**: AI considers current truck status (fuel, damage, location)
- [ ] **AI-06**: User sees streaming AI responses in real-time
- [ ] **AI-07**: User can start new conversation with AI
- [ ] **AI-08**: User sees conversation history with AI
- [ ] **AI-09**: AI responses include specific dollar amounts and percentages from user data
- [ ] **AI-10**: User sees "thinking" indicator while AI generates response

### Settings Page

- [ ] **SETTINGS-01**: User can set fuel alert threshold (percentage)
- [ ] **SETTINGS-02**: User can set rest alert threshold (minutes)
- [ ] **SETTINGS-03**: User can set maintenance alert threshold (damage percentage)
- [ ] **SETTINGS-04**: User can select preferred units (imperial/metric)
- [ ] **SETTINGS-05**: User can select preferred currency
- [ ] **SETTINGS-06**: User can select timezone
- [ ] **SETTINGS-07**: User can view their API key
- [ ] **SETTINGS-08**: User can regenerate API key
- [ ] **SETTINGS-09**: User sees confirmation modal before regenerating API key
- [ ] **SETTINGS-10**: User can copy API key to clipboard
- [ ] **SETTINGS-11**: User sees plugin installation instructions
- [ ] **SETTINGS-12**: User can switch dashboard profile (compact/detailed/custom)
- [ ] **SETTINGS-13**: User can configure visible cards for custom profile

### Testing

- [ ] **TEST-01**: Project has Vitest configured for unit and integration tests
- [ ] **TEST-02**: Project has Playwright configured for E2E tests
- [ ] **TEST-03**: Profit calculation functions have unit tests
- [ ] **TEST-04**: Fuel economy calculation functions have unit tests
- [ ] **TEST-05**: API route handlers have integration tests
- [ ] **TEST-06**: Database triggers have tests
- [ ] **TEST-07**: Real-time subscription components have tests with WebSocket mocking
- [ ] **TEST-08**: Critical UI components have render tests
- [ ] **TEST-09**: CI pipeline runs tests on every commit
- [ ] **TEST-10**: Test coverage report is generated and reviewed

### Edge Cases

- [ ] **EDGE-01**: User experiences graceful fallback when network disconnects (plugin and dashboard)
- [ ] **EDGE-02**: User sees automatic polling retry when WebSocket fails
- [ ] **EDGE-03**: User sees loading states and skeleton screens during data fetch
- [ ] **EDGE-04**: User sees meaningful empty states for new accounts with no data
- [ ] **EDGE-05**: User encounters error and sees error boundary preventing full-page crash

## v2 Requirements

Deferred to future release.

### Advanced Analytics
- **ANALYTICS-V2-01**: Heat map showing best times/days for specific routes
- **ANALYTICS-V2-02**: Predictive analytics for fuel costs based on historical trends
- **ANALYTICS-V2-03**: Comparative analysis with community averages (if multi-user launched)

### Social Features
- **SOCIAL-01**: Share achievements with other players
- **SOCIAL-02**: Compare route profitability with community
- **SOCIAL-03**: Leaderboards for efficiency metrics

### Advanced AI
- **AI-V2-01**: AI analyzes driving patterns to suggest efficiency improvements
- **AI-V2-02**: AI predicts optimal job timing based on historical patterns
- **AI-V2-03**: AI provides fuel-saving route alternatives

### Mobile App
- **MOBILE-01**: Native iOS app
- **MOBILE-02**: Native Android app

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-player/social features in v1 | Solo experience first, validate core value before adding social |
| Native mobile apps | Web-responsive sufficient for v1, avoid platform-specific complexity |
| Garage/truck management | SDK provides no access to save file data (garages, bank balance, owned trucks) |
| Freight market browser | SDK cannot see available jobs before player accepts them |
| Hired driver tracking | SDK only provides player's truck telemetry, not AI drivers |
| Weather integration | SDK provides zero weather data, external APIs don't match game weather |
| Navigation route overlay | SDK limitation, cannot access navigation routing data |
| Real-world traffic/weather APIs | Game randomizes these, no correlation with real-world conditions |
| Video streaming/recording | Out of scope for dashboard application |
| VR support | Not applicable for second-screen companion dashboard |
| Offline mode | Cloud-based by design, requires active connection for real-time updates |
| Custom dashboard builder UI | Too complex for v1, provide 3 preset profiles instead |
| Export to Excel/CSV | PDF export sufficient for v1, defer spreadsheet formats |
| Multi-language support | English-only for v1, add i18n in v2 if demand exists |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DESIGN-01 | Phase 3 | Pending |
| DESIGN-02 | Phase 3 | Pending |
| DESIGN-03 | Phase 3 | Pending |
| DESIGN-04 | Phase 3 | Pending |
| DESIGN-05 | Phase 3 | Pending |
| DESIGN-06 | Phase 3 | Pending |
| DESIGN-07 | Phase 3 | Pending |
| FIX-01 | Phase 3 | Pending |
| FIX-02 | Phase 3 | Pending |
| FIX-03 | Phase 3 | Pending |
| FIX-04 | Phase 3 | Pending |
| FIX-05 | Phase 3 | Pending |
| FIX-06 | Phase 3 | Pending |
| SEC-01 | Phase 2 | Pending |
| SEC-02 | Phase 2 | Pending |
| SEC-03 | Phase 2 | Pending |
| SEC-04 | Phase 2 | Pending |
| SEC-05 | Phase 2 | Pending |
| PERF-01 | Phase 4 | Pending |
| PERF-02 | Phase 4 | Pending |
| PERF-03 | Phase 4 | Pending |
| PERF-04 | Phase 4 | Pending |
| PERF-05 | Phase 4 | Pending |
| PERF-06 | Phase 4 | Pending |
| PERF-07 | Phase 4 | Pending |
| LIVE-01 | Phase 4 | Pending |
| LIVE-02 | Phase 4 | Pending |
| LIVE-03 | Phase 4 | Pending |
| LIVE-04 | Phase 4 | Pending |
| LIVE-05 | Phase 4 | Pending |
| LIVE-06 | Phase 4 | Pending |
| LIVE-07 | Phase 4 | Pending |
| LIVE-08 | Phase 4 | Pending |
| LIVE-09 | Phase 4 | Pending |
| LIVE-10 | Phase 4 | Pending |
| LIVE-11 | Phase 4 | Pending |
| LIVE-12 | Phase 4 | Pending |
| LIVE-13 | Phase 4 | Pending |
| LIVE-14 | Phase 4 | Pending |
| LIVE-15 | Phase 4 | Pending |
| LIVE-16 | Phase 4 | Pending |
| JOBS-01 | Phase 5 | Pending |
| JOBS-02 | Phase 5 | Pending |
| JOBS-03 | Phase 5 | Pending |
| JOBS-04 | Phase 5 | Pending |
| JOBS-05 | Phase 5 | Pending |
| JOBS-06 | Phase 5 | Pending |
| JOBS-07 | Phase 5 | Pending |
| JOBS-08 | Phase 5 | Pending |
| JOBS-09 | Phase 5 | Pending |
| JOBS-10 | Phase 5 | Pending |
| ROUTE-01 | Phase 5 | Pending |
| ROUTE-02 | Phase 5 | Pending |
| ROUTE-03 | Phase 5 | Pending |
| ROUTE-04 | Phase 5 | Pending |
| ROUTE-05 | Phase 5 | Pending |
| ROUTE-06 | Phase 5 | Pending |
| ROUTE-07 | Phase 5 | Pending |
| ROUTE-08 | Phase 5 | Pending |
| ROUTE-09 | Phase 5 | Pending |
| ROUTE-10 | Phase 5 | Pending |
| ANALYTICS-01 | Phase 5 | Pending |
| ANALYTICS-02 | Phase 5 | Pending |
| ANALYTICS-03 | Phase 5 | Pending |
| ANALYTICS-04 | Phase 5 | Pending |
| ANALYTICS-05 | Phase 5 | Pending |
| ANALYTICS-06 | Phase 5 | Pending |
| ANALYTICS-07 | Phase 5 | Pending |
| ANALYTICS-08 | Phase 5 | Pending |
| ANALYTICS-09 | Phase 5 | Pending |
| ANALYTICS-10 | Phase 5 | Pending |
| COMPANY-01 | Phase 5 | Pending |
| COMPANY-02 | Phase 5 | Pending |
| COMPANY-03 | Phase 5 | Pending |
| COMPANY-04 | Phase 5 | Pending |
| COMPANY-05 | Phase 5 | Pending |
| COMPANY-06 | Phase 5 | Pending |
| COMPANY-07 | Phase 5 | Pending |
| COMPANY-08 | Phase 5 | Pending |
| EXPENSE-01 | Phase 5 | Pending |
| EXPENSE-02 | Phase 5 | Pending |
| EXPENSE-03 | Phase 5 | Pending |
| EXPENSE-04 | Phase 5 | Pending |
| EXPENSE-05 | Phase 5 | Pending |
| EXPENSE-06 | Phase 5 | Pending |
| EXPENSE-07 | Phase 5 | Pending |
| EXPENSE-08 | Phase 5 | Pending |
| EXPENSE-09 | Phase 5 | Pending |
| EXPENSE-10 | Phase 5 | Pending |
| HOS-01 | Phase 5 | Pending |
| HOS-02 | Phase 5 | Pending |
| HOS-03 | Phase 5 | Pending |
| HOS-04 | Phase 5 | Pending |
| HOS-05 | Phase 5 | Pending |
| HOS-06 | Phase 5 | Pending |
| HOS-07 | Phase 5 | Pending |
| HOS-08 | Phase 5 | Pending |
| ACHIEVE-01 | Phase 5 | Pending |
| ACHIEVE-02 | Phase 5 | Pending |
| ACHIEVE-03 | Phase 5 | Pending |
| ACHIEVE-04 | Phase 5 | Pending |
| ACHIEVE-05 | Phase 5 | Pending |
| ACHIEVE-06 | Phase 5 | Pending |
| ACHIEVE-07 | Phase 5 | Pending |
| ACHIEVE-08 | Phase 5 | Pending |
| ACHIEVE-09 | Phase 5 | Pending |
| AI-01 | Phase 6 | Pending |
| AI-02 | Phase 6 | Pending |
| AI-03 | Phase 6 | Pending |
| AI-04 | Phase 6 | Pending |
| AI-05 | Phase 6 | Pending |
| AI-06 | Phase 6 | Pending |
| AI-07 | Phase 6 | Pending |
| AI-08 | Phase 6 | Pending |
| AI-09 | Phase 6 | Pending |
| AI-10 | Phase 6 | Pending |
| SETTINGS-01 | Phase 6 | Pending |
| SETTINGS-02 | Phase 6 | Pending |
| SETTINGS-03 | Phase 6 | Pending |
| SETTINGS-04 | Phase 6 | Pending |
| SETTINGS-05 | Phase 6 | Pending |
| SETTINGS-06 | Phase 6 | Pending |
| SETTINGS-07 | Phase 6 | Pending |
| SETTINGS-08 | Phase 6 | Pending |
| SETTINGS-09 | Phase 6 | Pending |
| SETTINGS-10 | Phase 6 | Pending |
| SETTINGS-11 | Phase 6 | Pending |
| SETTINGS-12 | Phase 6 | Pending |
| SETTINGS-13 | Phase 6 | Pending |
| TEST-01 | Phase 1 | Complete |
| TEST-02 | Phase 1 | Complete |
| TEST-03 | Phase 1 | Complete |
| TEST-04 | Phase 1 | Complete |
| TEST-05 | Phase 1 | Complete |
| TEST-06 | Phase 1 | Complete |
| TEST-07 | Phase 1 | Complete |
| TEST-08 | Phase 1 | Complete |
| TEST-09 | Phase 1 | Complete |
| TEST-10 | Phase 1 | Complete |
| EDGE-01 | Phase 6 | Pending |
| EDGE-02 | Phase 6 | Pending |
| EDGE-03 | Phase 6 | Pending |
| EDGE-04 | Phase 6 | Pending |
| EDGE-05 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 127 total
- Mapped to phases: 127 (100%)
- Unmapped: 0

**Phase Distribution:**
- Phase 1 (Foundation & Testing): 10 requirements
- Phase 2 (Security Hardening): 5 requirements
- Phase 3 (Design System & Core Fixes): 13 requirements
- Phase 4 (Real-Time Telemetry & Performance): 23 requirements
- Phase 5 (Analytics & Page Completion): 66 requirements
- Phase 6 (AI & Polish): 28 requirements

---
*Requirements defined: 2026-01-20*
*Last updated: 2026-01-20 with phase traceability*
