---
phase: 02-security-hardening
plan: 04b
type: execute
wave: 2
depends_on: ['01', '02', '03']
files_modified:
  - web/app/api/jobs/complete/route.ts
  - web/app/api/user/regenerate-key/route.ts
autonomous: true

must_haves:
  truths:
    - API routes validate input with Zod before database operations
    - Rate limiting returns 429 with Retry-After header when exceeded
    - Validation errors return 400 with detailed error messages
    - Service role operations include secondary user_id validation
    - Errors are captured in Sentry with PII scrubbed
    - API client receives rate limit information to implement backoff strategies
  artifacts:
    - path: web/app/api/jobs/complete/route.ts
      provides: Secured job complete endpoint
      contains: "validateUserOwnsResource"
      min_lines: 80
    - path: web/app/api/user/regenerate-key/route.ts
      provides: Secured API key regeneration
      contains: "authLimiter.limit"
      min_lines: 60
  key_links:
    - from: web/app/api/jobs/complete/route.ts
      to: web/lib/supabase/validation.ts
      via: validateUserOwnsResource call
      pattern: "validateUserOwnsResource"
    - from: web/app/api/jobs/complete/route.ts
      to: web/lib/ratelimit.ts
      via: mutationLimiter.limit
      pattern: "mutationLimiter\\.limit"
---

<objective>
Apply security layers (rate limiting, validation, error monitoring) to job complete and API key regeneration endpoints in the correct order.

Purpose: Complete the security hardening of all API routes by securing job completion and API key management endpoints. Implements SEC-01 through SEC-05 requirements.

Output: Job complete and API key regeneration routes secured with layered defense: validation first (fast path rejection), authentication second (identify user), rate limiting third (prevent per-user abuse), secondary validation fourth (prevent privilege escalation), Sentry throughout (observes errors).
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/phases/02-security-hardening/02-RESEARCH.md
@.planning/phases/02-security-hardening/02-CONTEXT.md
@web/app/api/jobs/complete/route.ts
@web/app/api/user/regenerate-key/route.ts
@web/lib/supabase/service.ts
</context>

<tasks>

<task type="auto">
  <name>Secure job complete endpoint</name>
  <files>web/app/api/jobs/complete/route.ts</files>
  <action>
Update web/app/api/jobs/complete/route.ts with security layers:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { jobCompleteSchema } from './schema';
import { mutationLimiter } from '@/lib/ratelimit';
import { createServiceClient } from '@/lib/supabase/service';
import { validateApiKey, validateUserOwnsResource } from '@/lib/supabase/validation';
import * as Sentry from '@sentry/nextjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate
    const result = jobCompleteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Authenticate
    let userId = data.user_id;
    if (data.api_key && !userId) {
      userId = await validateApiKey(data.api_key);
      if (!userId) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limit
    const { success, limit, reset, remaining } = await mutationLimiter.limit(userId);
    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(reset),
          }
        }
      );
    }

    // Secondary validation: user owns this job
    const ownsJob = await validateUserOwnsResource(userId, 'jobs', data.job_id);
    if (!ownsJob) {
      Sentry.captureMessage('User attempted to complete unowned job', {
        level: 'warning',
        extra: { userId, jobId: data.job_id },
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update job
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('jobs')
      .update({
        completed_at: new Date().toISOString(),
        cargo_damage: data.cargo_damage,
        delivered_late: data.delivered_late,
        fuel_consumed: data.fuel_consumed,
        damage_taken: data.damage_taken,
        avg_speed: data.avg_speed,
        avg_rpm: data.avg_rpm,
      })
      .eq('id', data.job_id);

    if (error) {
      Sentry.captureException(error, { extra: { userId, jobId: data.job_id } });
      return NextResponse.json({ error: 'Failed to complete job' }, { status: 500 });
    }

    return NextResponse.json(
      { success: true },
      {
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
        }
      }
    );

  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```
  </action>
  <verify>
```bash
# Verify schema files from plan 02-02 exist before importing
ls web/app/api/jobs/complete/schema.ts
```
Should show file exists.

```bash
cd web && npx tsc --noEmit app/api/jobs/complete/route.ts
```
Should compile successfully.

Check secondary validation:
```bash
grep "validateUserOwnsResource" web/app/api/jobs/complete/route.ts
```
Should show usage before update operation.
  </verify>
  <done>Job complete endpoint secured with schema validation, rate limiting, secondary checks, and error monitoring</done>
</task>

<task type="auto">
  <name>Secure API key regeneration endpoint</name>
  <files>web/app/api/user/regenerate-key/route.ts</files>
  <action>
Update web/app/api/user/regenerate-key/route.ts with security layers:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authLimiter } from '@/lib/ratelimit';
import { randomBytes } from 'crypto';
import * as Sentry from '@sentry/nextjs';

export async function POST() {
  try {
    const supabase = await createClient();

    // Authenticate user (uses Supabase session)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit (prevent abuse)
    const { success, limit, reset, remaining } = await authLimiter.limit(user.id);
    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Rate limit exceeded', reset: new Date(reset) },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(reset),
          }
        }
      );
    }

    // Generate cryptographically secure key
    // Format: rm_ + 64 hex chars (32 bytes = 256 bits of entropy)
    const newApiKey = `rm_${randomBytes(32).toString('hex')}`;

    // Update database (uses RLS - automatically scoped to user)
    const { error: updateError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        api_key: newApiKey,
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      Sentry.captureException(updateError, {
        user: { id: user.id },
      });

      return NextResponse.json(
        { error: 'Failed to regenerate API key' },
        { status: 500 }
      );
    }

    // Log security event
    Sentry.captureMessage('API key regenerated', {
      level: 'info',
      user: { id: user.id },
    });

    return NextResponse.json(
      {
        api_key: newApiKey,
        message: 'API key regenerated successfully',
      },
      {
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
        }
      }
    );

  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Security notes:**
- Uses authLimiter (20 req/15min) to prevent API key brute forcing
- crypto.randomBytes provides cryptographically secure random values
- Sentry logs key regeneration as security event (info level)
- Rate limit headers inform client when they can retry
  </action>
  <verify>
```bash
cd web && npx tsc --noEmit app/api/user/regenerate-key/route.ts
```
Should compile successfully.

Check cryptographic randomness:
```bash
grep "randomBytes" web/app/api/user/regenerate-key/route.ts
```
Should show crypto.randomBytes usage (not Math.random).
  </verify>
  <done>API key regeneration secured with auth rate limiter and cryptographic key generation</done>
</task>

</tasks>

<verification>
1. Schema files from plan 02-02 verified to exist before importing
2. Both API routes compile without TypeScript errors
3. Job complete endpoint uses mutationLimiter (100/hour)
4. Regenerate key uses authLimiter (20/15min)
5. Both routes validate input (job complete with Zod, regenerate with session auth)
6. Both routes return 429 with Retry-After header on rate limit
7. Job complete includes secondary validation (validateUserOwnsResource)
8. Both routes capture errors in Sentry
9. Both success responses include X-RateLimit-* headers for client backoff strategies
</verification>

<success_criteria>
- Job complete and API key regeneration routes secured with appropriate rate limiters
- Validation errors return 400 with detailed Zod error messages
- Rate limit exceeded returns 429 with Retry-After header
- Secondary validation prevents privilege escalation on job operations
- Sentry captures all errors with PII already scrubbed (from plan 03)
- TypeScript compilation succeeds for all modified routes
- Schema dependencies from plan 02-02 confirmed before usage
- Rate limit headers inform clients when to retry (observable by plugin/client)
</success_criteria>

<output>
After completion, create `.planning/phases/02-security-hardening/02-04b-SUMMARY.md`
</output>
