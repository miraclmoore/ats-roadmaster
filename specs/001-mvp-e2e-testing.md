# MVP End-to-End Testing Specification

**Version:** 1.0  
**Created:** January 18, 2026  
**Type:** Testing & Validation  
**Status:** Ready for Execution

---

## Executive Summary

This specification defines comprehensive end-to-end testing of the RoadMaster Pro MVP to validate the complete data pipeline from ATS gameplay through to dashboard analytics. All Phase 1 features from the PRD must be validated before proceeding to Phase 2 development.

---

## Test Objectives

### Primary Goals
1. Validate complete data flow: ATS → Plugin → API → Database → Dashboard
2. Verify all MVP features work with real gameplay
3. Measure performance against PRD targets
4. Identify critical bugs before Phase 2
5. Confirm system ready for production use

### Success Criteria
- ✅ All 8 functional tests pass
- ✅ Performance meets PRD targets (<500ms API latency, <1% CPU overhead)
- ✅ No data loss or corruption
- ✅ Dashboard displays accurate real-time data
- ✅ AI Dispatcher provides data-driven recommendations

---

## Test Environment

### Required Components

**Software:**
- Windows 10/11 (64-bit)
- American Truck Simulator (latest version)
- .NET 6.0 Runtime (x64)
- Node.js 18+ (for web app)
- Modern web browser (Chrome/Edge/Firefox)

**Services:**
- Supabase project (configured)
- Vercel deployment OR localhost:3000
- Anthropic API key (for AI features)

**Hardware:**
- CPU: 4+ cores recommended
- RAM: 8GB+ minimum
- Storage: 2GB+ free space
- Network: Stable internet connection

---

## Pre-Test Setup Checklist

### 1. Database Configuration

**Supabase Setup:**
```sql
-- Run this migration in Supabase SQL Editor:
-- File: supabase/migrations/001_initial_schema.sql
-- Verify tables exist: jobs, telemetry, user_preferences, achievements, company_stats, user_achievements
```

**Verify RLS Policies:**
- Users can only access their own data
- Service role can bypass RLS for API operations

### 2. Web Application Setup

**Environment Variables (`.env.local`):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
ANTHROPIC_API_KEY=sk-ant-xxx...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Installation:**
```bash
cd web
npm install
npm run dev
# Verify runs at http://localhost:3000
```

**Pre-flight Checks:**
- ✅ Can access login page
- ✅ Can create new account
- ✅ Dashboard loads after login
- ✅ Settings page shows API key

### 3. Plugin Configuration

**Build Plugin:**
```bash
cd plugin
.\build.bat
# Verify: bin/x64/Release/net6.0/RoadMasterPlugin.dll exists
```

**Install to ATS:**
```bash
.\install.bat
# Installs DLL to: C:\Users\{USERNAME}\Documents\American Truck Simulator\plugins\
```

**Configure API Key:**
```json
// File: {ATS_DIR}/plugins/RoadMasterPlugin/config.json
{
  "ApiKey": "rm_YOUR_KEY_FROM_DASHBOARD",
  "ApiUrl": "http://localhost:3000"
}
```

---

## Test Execution Plan

### Test 1: Initial Connection
**ID:** T001  
**Priority:** Critical  
**Duration:** 5 minutes

**Objective:** Verify plugin connects to ATS and establishes API communication

**Prerequisites:**
- Plugin installed to ATS directory
- config.json has valid API key
- Web app running
- User logged in to dashboard

**Test Steps:**
1. Launch American Truck Simulator
2. Observe plugin console window (should auto-launch)
3. Check for initialization messages
4. Verify "Connected to American Truck Simulator" appears
5. Check "API configured: {url}" message
6. Confirm no error messages

**Expected Results:**
```
🚛 RoadMaster Pro - ATS Telemetry Plugin
==========================================

✅ API configured: http://localhost:3000
✅ Connected to American Truck Simulator

Monitoring telemetry data (1Hz sampling)...
```

**Pass Criteria:**
- ✅ Plugin loads without errors
- ✅ ATS connection successful
- ✅ API connection successful
- ✅ No crashes or exceptions
- ✅ ATS gameplay not affected

**Failure Modes:**
- ❌ "Cannot connect to American Truck Simulator" → Check SCS SDK enabled
- ❌ "API key not configured" → Update config.json
- ❌ API connection timeout → Check web app is running

---

### Test 2: Job Start Event
**ID:** T002  
**Priority:** Critical  
**Duration:** 10 minutes

**Objective:** Validate job creation and data capture

**Prerequisites:**
- Test 1 passed
- In-game (not in menu)
- Dashboard open in browser

**Test Steps:**
1. Navigate to freight market in ATS
2. Accept any quick job (cargo/route doesn't matter)
3. Watch plugin console for "Job started" message
4. Refresh dashboard (or wait for auto-update)
5. Verify job appears in "Current Job" section
6. Check Jobs page for active job entry

**Expected Console Output:**
```
🚛 Job started: Phoenix, AZ → San Diego, CA
   Cargo: Electronics
   Income: $2,450
   Distance: 380 km
```

**Expected Dashboard:**
- Active job card visible on main dashboard
- Route: {Source City} → {Destination City}
- Cargo type displayed
- Income amount shown
- Distance displayed
- Status: "In Progress"

**Database Verification:**
```sql
SELECT * FROM jobs 
WHERE user_id = '{your_user_id}' 
AND completed_at IS NULL 
ORDER BY started_at DESC 
LIMIT 1;
```

**Pass Criteria:**
- ✅ Plugin detects job start (income changed from 0 to positive)
- ✅ API call succeeds (returns job_id)
- ✅ Database record created
- ✅ Dashboard displays job within 5 seconds
- ✅ All job fields populated correctly

**Data Accuracy Checks:**
- Source city matches in-game
- Destination city matches in-game
- Cargo type matches
- Income amount matches
- Distance within ±5%

---

### Test 3: Telemetry Streaming
**ID:** T003  
**Priority:** Critical  
**Duration:** 15 minutes

**Objective:** Validate real-time telemetry data flow at 1Hz

**Prerequisites:**
- Test 2 passed
- Active job in progress
- Truck on the road

**Test Steps:**
1. Start driving the truck
2. Navigate to Live Telemetry page in dashboard
3. Observe gauges updating in real-time
4. Perform various actions:
   - Accelerate to 60+ mph
   - Shift through gears
   - Use fuel (drive 10+ miles)
   - Check damage (bump into something gently)
5. Verify all metrics update smoothly
6. Check database for telemetry records

**Metrics to Monitor:**
| Metric | In-Game | Dashboard | Tolerance |
|--------|---------|-----------|-----------|
| Speed | 65 mph | ? | ±3 mph |
| RPM | 1,450 | ? | ±50 rpm |
| Gear | 9 | ? | Exact |
| Fuel % | 72% | ? | ±5% |

**Expected Behavior:**
- Gauges update ~1 per second (no faster than 2Hz, no slower than 0.5Hz)
- Values smooth (no jumping)
- No flickering or lag
- Speed gauge red zone at 75+ mph
- RPM gauge red zone at 2400+ rpm
- Fuel gauge red at <20%

**Database Verification:**
```sql
SELECT COUNT(*) as total_records,
       MIN(created_at) as first_record,
       MAX(created_at) as last_record,
       MAX(created_at) - MIN(created_at) as time_span
FROM telemetry
WHERE user_id = '{your_user_id}'
  AND created_at > NOW() - INTERVAL '5 minutes';
```

Should show ~300 records per 5 minutes (1 per second).

**Pass Criteria:**
- ✅ Telemetry streams continuously
- ✅ Update rate 0.8-1.2Hz
- ✅ Values match in-game (within tolerance)
- ✅ No data loss or gaps
- ✅ job_id properly linked

---

### Test 4: Job Completion
**ID:** T004  
**Priority:** Critical  
**Duration:** 30-60 minutes (complete full job)

**Objective:** Validate job completion event and profit calculation

**Prerequisites:**
- Test 3 passed
- Active job started

**Test Steps:**
1. Complete the delivery in ATS
2. Drive to destination and park at delivery marker
3. Confirm delivery in-game
4. Watch plugin console for completion message
5. Check dashboard for updated job status
6. Verify profit calculation displayed
7. Navigate to Jobs page - verify job moved to completed

**Expected Console Output:**
```
✅ Job completed: Phoenix → San Diego
   Status: ✓ On Time
   Profit calculated and saved to dashboard
```

**Expected Dashboard Updates:**
- Main dashboard: Job removed from "Active Job"
- Main dashboard: Job appears in "Recent Deliveries"
- Jobs page: Status changed to "On Time" or "Late"
- Jobs page: Profit value displayed (green if positive)

**Profit Calculation Verification:**
```
Expected Profit Formula:
Net Profit = Income - Fuel Cost - Damage Cost

Where:
- Income = Job income from game
- Fuel Cost = Fuel consumed (gallons) × $3.50/gal
- Damage Cost = Damage % × Base repair cost

Manual calculation:
Income: $2,450
Fuel: ~25 gal × $3.50 = $87.50
Damage: 2% × $500 = $10
Expected Profit: $2,450 - $87.50 - $10 = $2,352.50

Dashboard should show ~$2,353
```

**Pass Criteria:**
- ✅ Plugin detects completion (income changed from positive to 0)
- ✅ API call succeeds
- ✅ Database updated with completed_at timestamp
- ✅ Profit calculated correctly (±$50 tolerance)
- ✅ Late delivery detected if applicable
- ✅ Dashboard updates within 5 seconds

---

### Test 5: Dashboard Analytics
**ID:** T005  
**Priority:** High  
**Duration:** 15 minutes (after 2-3 jobs completed)

**Objective:** Validate analytics calculations and visualizations

**Prerequisites:**
- 2-3 jobs completed
- Data in database

**Test Steps:**
1. Navigate to Analytics page
2. Verify all charts render without errors
3. Check "Income & Profit Trend" line chart
4. Check "Top Cargo Types by Profit" bar chart
5. Check "Most Profitable Routes" list
6. Manually verify calculations against raw data

**Charts to Validate:**

**1. Income & Profit Trend**
- X-axis: Dates of last 10 jobs
- Y-axis: Dollar amounts
- Two lines: Income (cyan) and Profit (green)
- Lines should trend together with profit lower than income

**2. Cargo Profitability**
- Bars show average profit per cargo type
- Sorted highest to lowest
- At least 1 cargo type if jobs completed

**3. Top Routes**
- List of routes with average profit
- Format: "City A → City B"
- Shows number of deliveries
- Sorted by profit descending

**Manual Calculation Example:**
```sql
-- Get raw data
SELECT cargo_type, AVG(profit) as avg_profit, COUNT(*) as jobs
FROM jobs
WHERE user_id = '{your_user_id}'
  AND completed_at IS NOT NULL
GROUP BY cargo_type;

-- Compare with dashboard values
-- Should match within $5
```

**Pass Criteria:**
- ✅ All charts render without errors
- ✅ Data represents completed jobs only
- ✅ Calculations accurate (spot-check 2 values)
- ✅ Charts responsive (work on mobile)
- ✅ No console errors
- ✅ Page loads in <2 seconds

---

### Test 6: AI Dispatcher ("Roadie")
**ID:** T006  
**Priority:** High  
**Duration:** 10 minutes

**Objective:** Validate AI provides data-driven, personalized recommendations

**Prerequisites:**
- 2-3 jobs completed (need data for AI context)
- ANTHROPIC_API_KEY configured

**Test Steps:**
1. Navigate to AI Dispatcher page
2. Read initial greeting from Roadie
3. Ask test questions and evaluate responses
4. Verify AI references actual player data
5. Check response time

**Test Questions:**

**Q1: "What are my most profitable routes?"**
Expected Response Elements:
- Lists specific routes from player's history
- Cites actual profit amounts
- Mentions number of runs completed
- Uses CB radio lingo (10-4, good buddy, etc.)
- Response under 150 words

Example Good Response:
```
10-4, driver! Looking at your log, here's what's paying the bills:

Phoenix → San Diego with electronics is your money maker - 
you've hauled that 3 times averaging $1,390 profit each run. 
That's solid.

Your Tucson → Phoenix runs average $220 profit (2 runs). 
Not bad for the short haul.

My recommendation: Keep taking that Phoenix-San Diego 
electronics freight when you can. At $1,390 a pop, that's 
your bread and butter route.

Catch you on the flip-side! 🚛
```

**Q2: "How can I improve my fuel economy?"**
Expected Response Elements:
- References player's actual MPG data
- Compares to potential improvements
- Provides actionable tips
- Calculates potential savings

**Q3: "What should I haul next?"**
Expected Response Elements:
- Suggests based on current location (if known)
- References profitable cargo types from history
- Considers truck condition if mentioned
- Practical recommendation

**Pass Criteria:**
- ✅ AI responds within 3 seconds
- ✅ Mentions specific routes from player history
- ✅ Cites actual profit numbers (within $50)
- ✅ Uses CB radio personality consistently
- ✅ Responses relevant and actionable
- ✅ No hallucinated data (fake routes/numbers)

**Failure Modes:**
- ❌ Generic responses not using player data
- ❌ Made-up routes not in player history
- ❌ API errors or timeouts
- ❌ Out of character responses

---

### Test 7: Real-time Updates
**ID:** T007  
**Priority:** High  
**Duration:** 15 minutes

**Objective:** Validate Supabase Realtime subscriptions

**Prerequisites:**
- Dashboard open in browser
- Plugin running
- Logged in

**Test Steps:**
1. Open dashboard in browser (main page)
2. Position browser and ATS side-by-side (if possible)
3. Start a new job in ATS
4. **Do NOT refresh browser** - watch for auto-update
5. Observe job appears automatically
6. Complete the job
7. Observe job status updates automatically

**Expected Behavior:**

**On Job Start:**
- Dashboard shows "Active Job" card appears
- No page refresh needed
- Updates within 5 seconds of plugin event

**On Job Complete:**
- "Active Job" card disappears
- Job appears in "Recent Deliveries"
- Status badge updates
- No page refresh needed

**On Telemetry Update (Live page):**
- Gauges update smoothly
- No page refresh needed
- Updates continuous while driving

**Pass Criteria:**
- ✅ Dashboard updates without manual refresh
- ✅ Job start detected automatically
- ✅ Job completion detected automatically
- ✅ Live Telemetry updates in real-time
- ✅ Latency <5 seconds for events
- ✅ No WebSocket disconnections

**Failure Modes:**
- ❌ Requires manual refresh to see updates
- ❌ WebSocket connection fails
- ❌ Updates delayed >10 seconds

---

### Test 8: Settings & API Key Management
**ID:** T008  
**Priority:** Medium  
**Duration:** 10 minutes

**Objective:** Validate user settings and API key functionality

**Test Steps:**

**Part 1: API Key Display & Copy**
1. Navigate to Settings page
2. Verify API key displayed (format: `rm_xxxxx...`)
3. Click "Copy" button
4. Paste into notepad - verify it copied correctly
5. Compare with plugin config.json - should match

**Part 2: API Key Regeneration**
1. Click "Regenerate API Key" button
2. Confirm warning dialog
3. Proceed with regeneration
4. Observe new key displayed
5. Copy new key

**Part 3: Update Plugin Config**
1. Close ATS if running
2. Edit plugin config.json with new API key
3. Save file
4. Restart ATS
5. Verify plugin connects successfully

**Part 4: Old Key Invalid**
1. Try using old API key in config.json
2. Plugin should fail to authenticate
3. Error message: "Invalid API key"

**Part 5: Preferences**
1. Change units (Imperial ↔ Metric)
2. Change currency (USD → EUR → GBP)
3. Change timezone
4. Click "Save Preferences"
5. Verify "Saved!" confirmation
6. Refresh page - verify preferences persist

**Pass Criteria:**
- ✅ API key displayed correctly
- ✅ Copy function works
- ✅ Regeneration creates new key immediately
- ✅ Old key invalidated instantly
- ✅ New key works in plugin
- ✅ Warning dialog prevents accidental regeneration
- ✅ Preferences save and persist

---

## Performance Validation

### Performance Targets (from PRD)

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Plugin CPU usage | <1% additional | <3% |
| Plugin memory | Stable, no leaks | <50MB growth/hour |
| API latency (avg) | <500ms | <1000ms |
| API latency (p95) | <1000ms | <2000ms |
| Dashboard load time | <2 seconds | <5 seconds |
| Telemetry update rate | 1Hz (±10%) | 0.5-2Hz |
| ATS FPS impact | <5% decrease | <10% decrease |

### Performance Test Procedure

**Duration:** 60 minutes continuous gameplay

**Measurements:**

1. **ATS FPS:**
   - Baseline: Run ATS 5 min WITHOUT plugin, record avg FPS
   - With plugin: Run ATS 60 min WITH plugin, record avg FPS
   - Calculate: FPS impact % = (Baseline - WithPlugin) / Baseline × 100

2. **Plugin Memory:**
   - Use Task Manager to monitor "RoadMasterPlugin" process
   - Record memory usage every 15 minutes
   - Expected: Stable or <50MB growth over 60 min

3. **API Latency:**
   - Open browser DevTools → Network tab
   - Filter for API calls (/api/telemetry, /api/jobs)
   - Record response times for 20 samples
   - Calculate average and p95

4. **Dashboard Load Time:**
   - Clear browser cache
   - Navigate to main dashboard
   - Record time from click to fully rendered (Chrome DevTools Performance)
   - Repeat 3 times, take average

**Performance Test Results Template:**
```
=== RoadMaster Pro Performance Results ===
Test Date: ___________
Test Duration: 60 minutes
ATS Version: ___________

ATS Performance:
- Baseline FPS (no plugin): ___ fps
- With Plugin FPS: ___ fps  
- FPS Impact: ___% (Target: <5%)

Plugin Performance:
- CPU Usage: ___%  (Target: <1%)
- Memory Start: ___ MB
- Memory 15min: ___ MB
- Memory 30min: ___ MB
- Memory 45min: ___ MB
- Memory 60min: ___ MB
- Memory Growth: ___ MB/hour (Target: <50MB)

API Performance:
- Telemetry Avg Latency: ___ ms (Target: <500ms)
- Telemetry p95 Latency: ___ ms (Target: <1000ms)
- Job Start Latency: ___ ms
- Job Complete Latency: ___ ms

Dashboard Performance:
- Cold Load Time: ___ seconds (Target: <2s)
- Warm Load Time: ___ seconds
- Live Telemetry Update Rate: ___ Hz (Target: 1Hz ±10%)

PASS/FAIL: ___________
Notes: _____________________
```

---

## Test Documentation

### Required Artifacts

1. **Completed TEST_RESULTS.md**
   - All test results filled in
   - Performance measurements
   - Screenshots attached/linked
   - Bugs documented
   - Sign-off completed

2. **Test Summary Report** (`specs/001-mvp-e2e-testing-results.md`)
   - Executive summary
   - Pass/fail decision
   - Critical issues list
   - Performance vs targets table
   - Recommendations

3. **Screenshots** (minimum required)
   - Plugin console during job
   - Dashboard with active job
   - Live Telemetry page
   - Analytics charts
   - AI Dispatcher conversation
   - Jobs history table

4. **Database Export** (optional but recommended)
   - Export sample of jobs table
   - Export sample of telemetry table
   - For debugging if issues found

---

## Pass/Fail Criteria

### PASS - Ready for Phase 2
**All of the following:**
- ✅ All 8 functional tests passed
- ✅ Performance meets all targets
- ✅ Zero critical bugs
- ✅ Data accuracy within specified tolerances
- ✅ No data loss or corruption observed
- ✅ User experience smooth and responsive

**Outcome:** Proceed to Phase 2 development

---

### CONDITIONAL PASS - Minor Issues
**If:**
- ⚠️ 7-8 tests passed, 0-1 failed with workaround
- ⚠️ Performance meets most targets (1-2 slightly below)
- ⚠️ 1-2 non-critical bugs found
- ⚠️ Minor UI/UX issues noted

**Requirements:**
- Document all issues
- Create bug fix tickets
- Plan remediation

**Outcome:** May proceed to Phase 2 with parallel bug fixes

---

### FAIL - Must Fix Before Phase 2
**If any of:**
- ❌ >2 functional tests failed
- ❌ Plugin crashes or causes ATS instability
- ❌ Data loss or corruption
- ❌ API authentication failures
- ❌ Critical calculation errors (profit, fuel economy)
- ❌ Performance significantly below targets (>50% miss)

**Required Actions:**
1. Stop Phase 2 planning
2. Debug and fix critical issues
3. Re-run full test suite
4. Achieve PASS or CONDITIONAL PASS before proceeding

---

## Post-Test Actions

### If PASS or CONDITIONAL PASS:

1. **Archive Test Results**
   - Commit TEST_RESULTS.md to git
   - Commit test summary to git
   - Tag commit: `v1.0-mvp-tested`

2. **Update README**
   - Add "✅ MVP Tested" badge
   - Update project status
   - Link to test results

3. **Create Phase 2 Spec**
   - File: `specs/002-route-profitability-analysis.md`
   - First Phase 2 feature from PRD
   - Follow Speckit format

4. **Celebrate!** 🎉
   - MVP is working!
   - You've shipped a functional product!

### If FAIL:

1. **Create Debug Plan**
   - List all failures
   - Prioritize by severity
   - Assign estimated fix time

2. **Fix Critical Issues**
   - Address failures one by one
   - Test each fix in isolation

3. **Re-test**
   - Run failed tests again
   - May skip tests that passed initially
   - Update TEST_RESULTS.md

4. **Repeat Until PASS**

---

## Appendix A: Common Issues & Solutions

### Plugin Won't Start
**Symptoms:** Plugin window doesn't appear, ATS loads normally  
**Causes:**
- .NET 6.0 runtime not installed
- Plugin DLL not in correct directory
- ATS plugins folder doesn't exist

**Solutions:**
- Install .NET 6.0 Desktop Runtime (x64)
- Run install.bat again
- Create plugins folder manually: `Documents\American Truck Simulator\plugins`

---

### "Cannot Connect to ATS"
**Symptoms:** Plugin starts but can't read telemetry  
**Causes:**
- SCS SDK not enabled in game
- Not in-game (in menu instead)
- Memory Mapped File access denied

**Solutions:**
- Enable SDK in ATS settings
- Start a delivery/drive around
- Run ATS as administrator

---

### API Connection Timeout
**Symptoms:** Plugin can't reach web app  
**Causes:**
- Web app not running
- Wrong API URL in config
- Firewall blocking localhost

**Solutions:**
- Check `npm run dev` is running
- Verify ApiUrl in config.json
- Allow Node.js through Windows Firewall

---

### Dashboard Not Updating
**Symptoms:** Jobs don't appear, telemetry frozen  
**Causes:**
- Supabase Realtime not enabled
- RLS policies blocking inserts
- API authentication failing

**Solutions:**
- Enable Realtime in Supabase dashboard
- Check RLS policies allow service role
- Verify API key is valid (not regenerated)

---

### Profit Calculations Wrong
**Symptoms:** Profit doesn't match expected value  
**Causes:**
- Fuel price constant outdated
- Damage cost formula incorrect
- Currency conversion error

**Solutions:**
- Check profit.ts calculations
- Verify fuel/damage costs with in-game values
- Update constants if needed

---

## Appendix B: Speckit Workflow Reference

This spec follows Speckit methodology:

1. **Specify** - This document (complete ✅)
2. **Plan** - Test execution order and dependencies (defined ✅)
3. **Implement** - Execute tests (ready to begin)
4. **Validate** - Check pass/fail criteria (after testing)
5. **Document** - Create summary report (after testing)

---

**END OF SPECIFICATION**

Ready to begin testing? Follow Phase 2: Environment Setup, then execute tests in order T001 → T008.
