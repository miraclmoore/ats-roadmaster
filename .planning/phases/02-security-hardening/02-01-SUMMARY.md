---
phase: 02-security-hardening
plan: 01
subsystem: infra
tags: [rate-limiting, redis, upstash, api-security, owasp]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: API routes and dashboard infrastructure
provides:
  - Rate limiting infrastructure with three tiers (telemetry, mutation, auth)
  - Upstash Redis integration for serverless rate limiting
  - Sliding window algorithm to prevent boundary exploitation
affects: [02-02, 02-03, 02-04a, 02-04b, all API routes]

# Tech tracking
tech-stack:
  added: ["@upstash/ratelimit@^2.0.8", "@upstash/redis@^1.36.1", "@radix-ui/react-slot"]
  patterns: ["Sliding window rate limiting", "Redis-backed serverless rate limiting", "Multi-tier rate limiting by endpoint type"]

key-files:
  created: ["web/lib/ratelimit.ts"]
  modified: ["web/package.json", "web/.env.example"]

key-decisions:
  - "Use Upstash Redis for serverless-compatible rate limiting"
  - "Implement three-tier rate limiting: telemetry (7200/hour), mutation (100/hour), auth (20/15min)"
  - "Use sliding window algorithm to prevent boundary exploitation"
  - "Enable analytics for rate limit monitoring in Upstash"

patterns-established:
  - "Rate limiter instances exported from centralized lib/ratelimit.ts module"
  - "Redis.fromEnv() pattern for automatic environment variable loading"
  - "Descriptive prefixes for Redis keys to aid debugging (ratelimit:telemetry, ratelimit:mutation, ratelimit:auth)"

# Metrics
duration: 3min
completed: 2026-01-20
---

# Phase 2 Plan 01: Rate Limiting Infrastructure Summary

**Upstash Redis-backed rate limiting with sliding window algorithm and three tiers tuned to SDK behavior: 7200/hour for telemetry (2x buffer for 1Hz sampling), 100/hour for mutations, 20/15min for auth operations**

## Performance

- **Duration:** 3 min 15 sec
- **Started:** 2026-01-20T20:51:53Z
- **Completed:** 2026-01-20T20:55:08Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Established Redis-backed rate limiting infrastructure using Upstash (serverless-compatible)
- Created three rate limiter instances tuned to different usage patterns and security requirements
- Implemented sliding window algorithm to prevent boundary exploitation attacks
- Documented Upstash setup requirements in .env.example for developer onboarding

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Upstash dependencies** - `a030a59` (chore)
2. **Task 2: Create rate limiter configuration** - `8a737b0` (feat) - NOTE: Committed as part of 02-03 execution
3. **Task 3: Document Upstash setup requirements** - Already in .env.example (no commit needed)

Note: Tasks 2 and 3 were completed in a prior session but no SUMMARY was generated. This SUMMARY documents the completed work.

## Files Created/Modified
- `web/lib/ratelimit.ts` - Exports telemetryLimiter, mutationLimiter, and authLimiter with Upstash Redis backend
- `web/package.json` - Added @upstash/ratelimit and @upstash/redis dependencies
- `web/.env.example` - Documented UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN setup instructions

## Decisions Made

**1. Upstash Redis for Serverless Rate Limiting**
- Rationale: HTTP-based Redis client works in Next.js Edge runtime, Lambda, and Node.js without persistent connections
- Alternative considered: Vercel KV (too expensive), Redis Labs (requires connection pooling)
- Outcome: Perfect fit for serverless architecture

**2. Three-Tier Rate Limiting Strategy**
- Telemetry: 7200 req/hour (2x buffer for SDK's 3600/hour at 1Hz)
- Mutation: 100 req/hour (40x typical gameplay of ~2.5 jobs/hour)
- Auth: 20 req/15min (prevents brute force API key regeneration)
- Rationale: Different endpoints have different legitimate usage patterns and risk profiles
- Outcome: Protects resources without impacting legitimate gameplay

**3. Sliding Window Algorithm**
- Rationale: Prevents boundary exploitation where user sends 3600 requests at 00:59, then 3600 more at 01:00
- Alternative considered: Fixed window (simpler but exploitable), token bucket (overkill for this use case)
- Outcome: More accurate rate limiting with negligible performance overhead

**4. Analytics Enabled**
- Rationale: Upstash tracks rate limit hits for monitoring and debugging
- Trade-off: Slight overhead, but essential for identifying abuse patterns
- Outcome: Will enable data-driven rate limit tuning in production

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing @radix-ui/react-slot dependency**
- **Found during:** Task 2 (TypeScript compilation check)
- **Issue:** badge.tsx component imports @radix-ui/react-slot but package.json didn't have the dependency, causing build failure
- **Fix:** Ran `npm install @radix-ui/react-slot` to unblock build verification
- **Files modified:** web/package.json, web/package-lock.json
- **Verification:** `npm run build` succeeded after installation
- **Committed in:** Included in 8a737b0 (part of task 2 commit from prior session)

---

**Total deviations:** 1 auto-fixed (1 blocking issue)
**Impact on plan:** Auto-fix necessary to verify rate limiter TypeScript compilation. No scope creep.

## Issues Encountered

**Issue: Tasks already executed in prior session**
- Tasks 2 and 3 were completed in a prior session (commit 8a737b0) but no SUMMARY was generated
- This SUMMARY documents the completed work retroactively
- Resolution: Verified all success criteria met, documented actual commit hashes and timeline

**Issue: Rate limiter committed in wrong plan (02-03 instead of 02-01)**
- The ratelimit.ts file was committed in plan 02-03's commit (8a737b0)
- This suggests plans were executed out of order or bundled together
- Resolution: Documented actual commit hash, marked plan as complete

## User Setup Required

**External services require manual configuration.** Users need to:

1. Create Upstash account at https://console.upstash.com/login
2. Create new Redis database (Global recommended for multi-region support)
3. Copy REST URL and REST Token from database details
4. Add to .env.local:
   ```
   UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token-here
   ```

Setup instructions documented in web/.env.example.

## Next Phase Readiness

**Ready for next plans:**
- Rate limiter instances exported and ready for integration in API routes
- Plans 02-02 (input validation), 02-04a (telemetry endpoints), and 02-04b (mutation endpoints) can now import and use rate limiters
- No blockers

**Concerns:**
- Need to integrate rate limiters into actual API routes (deferred to 02-04a and 02-04b)
- Need to test rate limiting behavior under load (deferred to testing phase)
- Upstash free tier has 10k requests/day limit - may need upgrade for production

**Documentation needs:**
- Add rate limiting behavior to API documentation
- Document 429 error handling for SDK plugin
- Create runbook for monitoring rate limit hits in Upstash dashboard

---
*Phase: 02-security-hardening*
*Completed: 2026-01-20*
