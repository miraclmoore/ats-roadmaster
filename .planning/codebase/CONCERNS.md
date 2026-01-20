# Technical Concerns & Issues

**Analysis Date:** 2026-01-19

## Critical Issues

### Missing Core Feature Implementation
**Severity:** CRITICAL
**Location:** `web/lib/calculations/profit.ts`

**Issue:** Profit calculation is documented in CLAUDE.md as a core feature, but the implementation files are missing or incomplete.

**Evidence:**
- `CLAUDE.md` describes `calculateJobProfit()`, `calculateProfitPerMile()` functions
- `web/lib/calculations/` directory may not exist or lacks these files
- Database triggers reference these calculations

**Impact:**
The entire economic analysis feature - the core value proposition - cannot function without profit calculations.

**Fix Approach:**
1. Create `web/lib/calculations/profit.ts` with documented functions
2. Implement fuel cost calculation (gallons * $4.05 price)
3. Implement damage cost calculation (linear scaling to $10k max)
4. Implement profit = income - fuel_cost - damage_cost
5. Add profit per mile calculation
6. Update database triggers to use these functions

---

### Zero Test Coverage
**Severity:** CRITICAL
**Location:** Entire codebase

**Issue:** No testing framework configured, zero automated tests exist.

**Evidence:**
- No test files (`*.test.ts`, `*.spec.ts`) found
- No testing dependencies in `web/package.json`
- Manual testing docs exist but no automation

**Impact:**
- No regression safety
- Refactoring is risky
- Bug introduction likely
- Cannot verify calculations are correct

**Fix Approach:**
1. Add Vitest + React Testing Library
2. Start with critical calculation functions (pure, easy to test)
3. Add API route tests
4. Add component render tests
5. Set up CI to run tests

---

## High Severity Issues

### Security: Plain Text API Keys
**Severity:** HIGH
**Location:** `plugin/RoadMasterPlugin/config.json`, `web/app/api/*`

**Issue:** API keys stored in plain text config files.

**Evidence:**
- Plugin config.json contains apiKey field
- No encryption or secret management
- Keys transmitted in request body

**Impact:**
- Keys visible in file system
- Keys could leak via version control if user commits config
- Compromise of user's RoadMaster account

**Fix Approach:**
1. Use environment variables for sensitive data
2. Add config.json to .gitignore with example file
3. Consider OS keychain integration for plugin
4. Rate limit API endpoints

---

### Security: Service Role Key Usage
**Severity:** HIGH
**Location:** `web/lib/supabase/service.ts`, API routes

**Issue:** Service role client bypasses Row Level Security.

**Evidence:**
- API routes use service client instead of user-scoped client
- RLS policies exist but are bypassed
- Potential for privilege escalation if API key validation has bugs

**Impact:**
- If API key validation fails, could access other users' data
- Single point of failure for data security

**Fix Approach:**
1. Use user-scoped clients where possible
2. Add secondary user_id validation in API routes
3. Audit all service client usage
4. Add integration tests for RLS enforcement

---

### Security: No Rate Limiting
**Severity:** HIGH
**Location:** `web/app/api/*`

**Issue:** API endpoints have no rate limiting.

**Evidence:**
- No rate limiting middleware
- 1Hz telemetry = 3600 requests/hour per user
- No DDoS protection

**Impact:**
- Malicious plugin could flood API
- Database could be overwhelmed
- Cost explosion on Supabase

**Fix Approach:**
1. Add rate limiting middleware (e.g., `@upstash/ratelimit`)
2. Limit by API key
3. Different limits for telemetry vs mutations
4. Return 429 status when exceeded

---

### Performance: SELECT * Queries
**Severity:** HIGH
**Location:** `web/app/(dashboard)/live/page.tsx`, API routes

**Issue:** Using `SELECT *` instead of specific fields.

**Evidence:**
```typescript
.select('*, jobs(*)')  // Fetches ALL fields
```

**Impact:**
- Unnecessary data transfer
- Slower queries
- Higher bandwidth costs
- Real-time subscriptions send more data than needed

**Fix Approach:**
1. List specific fields needed
2. Only join related tables when necessary
3. Create database views for common queries
4. Use GraphQL or generated types to enforce field selection

---

### Performance: Unbounded Telemetry Growth
**Severity:** HIGH
**Location:** `telemetry` table

**Issue:** Telemetry table grows infinitely (1Hz * hours played).

**Evidence:**
- No retention policy
- No data archiving
- Table will grow to millions of rows per user

**Impact:**
- Slow queries over time
- Expensive storage
- Real-time subscriptions may slow down

**Fix Approach:**
1. Add Supabase cron job to archive old telemetry (>7 days)
2. Move to separate `telemetry_archive` table
3. Or delete telemetry older than retention period
4. Add indexes on `created_at` for efficient deletion

---

### Performance: No Caching
**Severity:** MEDIUM
**Location:** Dashboard, API routes

**Issue:** No caching of expensive queries.

**Evidence:**
- Route profitability calculated on every page load
- No Redis or in-memory cache
- AI chat rebuilds context every time

**Impact:**
- Slower page loads
- Higher database load
- Higher API costs (Claude API)

**Fix Approach:**
1. Cache route statistics (Redis or Vercel KV)
2. Invalidate on new job completion
3. Cache AI prompts with recent data
4. Use SWR for client-side caching

---

## Medium Severity Issues

### Tech Debt: HttpClient Misuse (C# Plugin)
**Severity:** MEDIUM
**Location:** `plugin/RoadMasterPlugin/ApiClient.cs`

**Issue:** Creating new HttpClient on every request.

**Evidence:**
```csharp
var client = new HttpClient();  // Inside method
```

**Impact:**
- Socket exhaustion with high frequency requests
- Poor performance

**Fix Approach:**
1. Use static HttpClient or HttpClientFactory
2. Reuse single client instance
3. Configure default headers once

---

### Tech Debt: TypeScript `@ts-ignore`
**Severity:** MEDIUM
**Location:** `web/app/(dashboard)/live/page.tsx`

**Issue:** Using `@ts-ignore` to suppress type errors.

**Evidence:**
```typescript
// @ts-ignore - jobs relation
handleTelemetryUpdate(data, data.jobs || null);
```

**Impact:**
- Bypasses type safety
- Hides potential runtime errors
- Makes refactoring harder

**Fix Approach:**
1. Properly type the Supabase query response
2. Use type assertions with validation
3. Update database types generation

---

### Tech Debt: Magic Numbers
**Severity:** LOW
**Location:** Calculation functions

**Issue:** Hardcoded values without named constants.

**Evidence:**
- Fuel price: $4.05 (not in constant)
- Max damage cost: $10,000 (not in constant)
- Fuel economy: 6 mpg assumption (not in constant)

**Impact:**
- Hard to update when game economy changes
- Not obvious what numbers represent

**Fix Approach:**
1. Extract to named constants
2. Consider making configurable per user
3. Document assumptions in comments

---

### Tech Debt: Missing Error Boundaries
**Severity:** MEDIUM
**Location:** React components

**Issue:** No error boundaries to catch render errors.

**Evidence:**
- No `ErrorBoundary` components found
- Errors crash entire page

**Impact:**
- Poor user experience on errors
- No graceful degradation

**Fix Approach:**
1. Add Next.js error boundaries (`error.tsx`)
2. Add component-level boundaries for critical features
3. Log errors to monitoring service

---

## Low Severity Issues

### Missing Environment Variable Validation
**Severity:** LOW
**Location:** Environment configuration

**Issue:** No validation that required env vars are set.

**Evidence:**
- Direct access to `process.env.X`
- No startup checks

**Impact:**
- Cryptic errors if env var missing
- Hard to debug deployment issues

**Fix Approach:**
1. Add env validation using Zod
2. Fail fast on startup if required vars missing
3. Provide helpful error messages

---

### Inconsistent Error Messages
**Severity:** LOW
**Location:** API routes, components

**Issue:** Error messages don't follow consistent format.

**Evidence:**
- Mix of "Failed to X", "Error: X", "X error"
- Some user-facing, some technical

**Impact:**
- Harder to debug
- Poor UX

**Fix Approach:**
1. Create error message standards
2. Separate user-facing vs internal errors
3. Use error codes for categorization

---

## Fragile Code Areas

### Real-Time Subscription Management
**Location:** `web/app/(dashboard)/live/page.tsx`

**Complexity:** High
**Why Fragile:**
- Complex cleanup logic
- Fallback polling mechanism
- Throttling state management
- Race conditions possible

**Recommendation:**
- Add comprehensive error logging
- Write integration tests
- Consider extracting to custom hook

---

### Job Lifecycle State Machine
**Location:** API routes, database triggers

**Complexity:** Medium
**Why Fragile:**
- Job created → in progress → completed flow
- Telemetry association timing-dependent
- Trigger order matters

**Recommendation:**
- Document state transitions
- Add state validation
- Consider using database constraints

---

## Technical Debt Summary

**Total Issues:** 20+
**Critical:** 2 (missing profit calc, no tests)
**High:** 5 (security, performance)
**Medium:** 5 (tech debt, error handling)
**Low:** 3 (minor improvements)

**Priority Fix Order:**
1. Implement missing profit calculations
2. Set up testing framework
3. Add rate limiting
4. Fix service role security
5. Optimize SELECT queries
6. Add telemetry retention policy

---

*Analysis: 2026-01-19*
