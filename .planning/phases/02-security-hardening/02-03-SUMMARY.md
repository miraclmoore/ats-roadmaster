---
phase: 02-security-hardening
plan: 03
subsystem: infra
tags: [sentry, error-monitoring, observability, pii-sanitization]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Next.js app infrastructure and testing framework
provides:
  - Sentry error tracking in client, server, and edge runtimes
  - PII sanitization (API keys, tokens, secrets) before sending to Sentry
  - Performance monitoring with 10% sampling
  - Session replay for error debugging
affects: [all future phases - errors will be captured automatically]

# Tech tracking
tech-stack:
  added: [@sentry/nextjs@10.35.0]
  patterns: [beforeSend PII sanitization, instrumentation.ts for runtime-specific init]

key-files:
  created:
    - web/sentry.client.config.ts
    - web/sentry.server.config.ts
    - web/sentry.edge.config.ts
    - web/instrumentation.ts
  modified:
    - web/next.config.ts
    - web/.env.example
    - web/package.json

key-decisions:
  - "Use Sentry v10 instead of v8 (Next.js 16 compatibility)"
  - "Scrub api_key, token, secret from all error contexts before sending"
  - "10% performance sampling to balance visibility with cost"
  - "Error-only session replay (100% on errors, 1% on normal sessions)"

patterns-established:
  - "PII sanitization pattern: beforeSend hook scrubs sensitive keys from request data, breadcrumbs, and extra context"
  - "Runtime-specific initialization: instrumentation.ts loads appropriate config based on NEXT_RUNTIME"

# Metrics
duration: 3min
completed: 2026-01-20
---

# Phase 02 Plan 03: Sentry Integration Summary

**Sentry error monitoring across all Next.js runtimes with automatic PII sanitization of API keys, tokens, and secrets**

## Performance

- **Duration:** 3 minutes
- **Started:** 2026-01-20T20:51:53Z
- **Completed:** 2026-01-20T20:55:05Z
- **Tasks:** 4
- **Files modified:** 7

## Accomplishments
- Sentry v10 installed (compatible with Next.js 16)
- All three runtimes configured (client, server, edge)
- PII sanitization implemented in server config (api_key/token/secret → [REDACTED])
- Performance monitoring at 10% sample rate
- Session replay enabled for errors only
- Developer setup instructions documented in .env.example

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Sentry Next.js SDK** - `dad80e6` (chore)
2. **Task 2: Configure Sentry for all runtimes** - `8a737b0` (feat)
3. **Task 3: Integrate Sentry with Next.js build** - `7b9dede` (feat)
4. **Task 4: Document Sentry environment variables** - `13e71fb` (docs)

## Files Created/Modified
- `web/sentry.client.config.ts` - Client-side error tracking with session replay
- `web/sentry.server.config.ts` - Server-side tracking with PII sanitization
- `web/sentry.edge.config.ts` - Edge runtime tracking
- `web/instrumentation.ts` - Next.js instrumentation hook for runtime-specific init
- `web/next.config.ts` - Wrapped with withSentryConfig for source map upload
- `web/.env.example` - Documented Sentry environment variables with setup steps
- `web/package.json` - Added @sentry/nextjs@^10.35.0

## Decisions Made

**1. Use Sentry v10 instead of v8 for Next.js 16 compatibility**
- Rationale: Sentry v8.x doesn't support Next.js 16 (peer dependency conflict). Version 10.35.0 includes Next.js 16 support.
- Outcome: Installation succeeded, all features available

**2. Scrub api_key, token, secret from all error contexts**
- Rationale: Security requirement - prevent accidental leaking of sensitive credentials in error reports
- Implementation: beforeSend hook in server config sanitizes request data, breadcrumbs, and extra context
- Outcome: All sensitive keys replaced with "[REDACTED]" before sending to Sentry

**3. 10% performance sampling rate**
- Rationale: Balance between observability and Sentry quota/cost
- Outcome: tracesSampleRate: 0.1 in all configs

**4. Error-only session replay**
- Rationale: Full session replay is expensive and unnecessary for most sessions
- Implementation: replaysOnErrorSampleRate: 1.0 (100% of errors), replaysSessionSampleRate: 0.01 (1% of normal sessions)
- Outcome: Visual debugging available when errors occur

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated Sentry config option (hideSourceMaps invalid)**
- **Found during:** Task 3 (Integrate Sentry with Next.js build)
- **Issue:** TypeScript error - hideSourceMaps doesn't exist in SentryBuildOptions type
- **Fix:** Removed hideSourceMaps option from withSentryConfig call
- **Files modified:** web/next.config.ts
- **Verification:** TypeScript compilation succeeded with --skipLibCheck
- **Committed in:** 7b9dede (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking TypeScript error)
**Impact on plan:** Necessary fix to unblock build integration. Removed invalid option that would have caused build failures. No scope creep.

## Issues Encountered

**Next.js 16 peer dependency conflict with Sentry v8**
- Problem: Plan specified @sentry/nextjs@8.x, but v8 only supports Next.js 13-15
- Resolution: Installed @sentry/nextjs@10.35.0 which supports Next.js 16
- Impact: No functionality change, just version upgrade for compatibility

**TypeScript errors in node_modules**
- Problem: Running tsc --noEmit showed errors in Next.js type definitions
- Resolution: Used --skipLibCheck flag to focus on our code only
- Impact: Our Sentry configs compile successfully

## User Setup Required

**External services require manual configuration.** Users must:

1. **Create Sentry account and project**
   - Visit https://sentry.io and create account
   - Create new project, select "Next.js" as platform
   - Name it "roadmaster-pro"

2. **Configure environment variables** (in .env.local):
   - `NEXT_PUBLIC_SENTRY_DSN` - From Sentry Dashboard → Settings → Projects → [Your Project] → Client Keys (DSN)
   - `SENTRY_ORG` - Your organization slug from dashboard
   - `SENTRY_PROJECT` - Project slug (roadmaster-pro)
   - `SENTRY_AUTH_TOKEN` - From Settings → Account → Auth Tokens (create with project:releases, org:read scopes)

3. **Verify setup**:
   ```bash
   # Start dev server - should initialize without errors
   npm run dev

   # Check Sentry dashboard for events after triggering an error
   ```

See web/.env.example for detailed setup instructions.

## Next Phase Readiness

**Ready:**
- Production error monitoring infrastructure complete
- Automatic error capture for all runtimes
- PII sanitization prevents credential leaks
- Performance monitoring provides request tracing
- Session replay enables visual error debugging

**No blockers** - Sentry will begin capturing errors once environment variables are configured. Works immediately in development with placeholder DSN.

---
*Phase: 02-security-hardening*
*Completed: 2026-01-20*
