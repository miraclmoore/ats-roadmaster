---
phase: 02-security-hardening
plan: 04a
type: execute
wave: 2
depends_on: ['01', '02', '03']
files_modified:
  - web/app/api/telemetry/route.ts
  - web/app/api/jobs/start/route.ts
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
    - path: web/app/api/telemetry/route.ts
      provides: Secured telemetry endpoint with all layers
      contains: "telemetryLimiter.limit"
      min_lines: 100
    - path: web/app/api/jobs/start/route.ts
      provides: Secured job start endpoint
      contains: "mutationLimiter.limit"
      min_lines: 80
  key_links:
    - from: web/app/api/telemetry/route.ts
      to: web/app/api/telemetry/schema.ts
      via: telemetrySchema.safeParse
      pattern: "telemetrySchema\\.safeParse"
    - from: web/app/api/telemetry/route.ts
      to: web/lib/ratelimit.ts
      via: telemetryLimiter.limit
      pattern: "telemetryLimiter\\.limit"
---

<objective>
Apply security layers (rate limiting, validation, error monitoring) to telemetry and job start endpoints in the correct order.

Purpose: Transform vulnerable API routes into production-ready endpoints that prevent DDoS, reject malformed data, and provide observability. Implements SEC-01 through SEC-05 requirements.

Output: Telemetry and job start routes secured with layered defense: validation first (fast path rejection), authentication second (identify user), rate limiting third (prevent per-user abuse), secondary validation fourth (prevent privilege escalation), Sentry throughout (observes errors).
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
@web/app/api/telemetry/route.ts
@web/app/api/jobs/start/route.ts
@web/lib/supabase/service.ts
</context>

<tasks>

<task type="auto">
  <name>Secure telemetry endpoint</name>
  <files>web/app/api/telemetry/route.ts</files>
  <action>
**Prerequisite:** web/app/api/telemetry/schema.ts created in plan 02-02

Rewrite web/app/api/telemetry/route.ts with all security layers:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { telemetrySchema } from './schema';
import { telemetryLimiter } from '@/lib/ratelimit';
import { createServiceClient } from '@/lib/supabase/service';
import { validateApiKey, validateUserOwnsResource } from '@/lib/supabase/validation';
import * as Sentry from '@sentry/nextjs';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Parse JSON (don't trust input yet)
    const body = await req.json();

    // 2. Validate with Zod
    const result = telemetrySchema.safeParse(body);
    if (!result.success) {
      Sentry.captureMessage('Telemetry validation failed', {
        level: 'warning',
        extra: { errors: result.error.format() },
      });

      return NextResponse.json(
        {
          error: 'Validation failed',
          details: result.error.format()
        },
        { status: 400 }
      );
    }

    const data = result.data;

    // 3. Authenticate via API key if provided
    let userId = data.user_id;
    if (data.api_key && !userId) {
      userId = await validateApiKey(data.api_key);
      if (!userId) {
        Sentry.captureMessage('Invalid API key used', {
          level: 'warning',
        });

        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 4. Rate limit (per user)
    const { success, limit, reset, remaining } = await telemetryLimiter.limit(userId);
    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          limit,
          remaining: 0,
          reset: new Date(reset).toISOString(),
        },
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

    // 5. Secondary validation if job_id provided
    if (data.job_id) {
      const ownsJob = await validateUserOwnsResource(userId, 'jobs', data.job_id);
      if (!ownsJob) {
        Sentry.captureMessage('User attempted to update unowned job', {
          level: 'warning',
          extra: { userId, jobId: data.job_id },
        });

        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    // 6. Insert data (using service client)
    const supabase = createServiceClient();
    const { error } = await supabase.from('telemetry').insert({
      user_id: userId,
      job_id: data.job_id || null,
      speed: data.speed,
      rpm: data.rpm,
      gear: data.gear,
      fuel_current: data.fuel_current,
      fuel_capacity: data.fuel_capacity,
      engine_damage: data.engine_damage,
      transmission_damage: data.transmission_damage,
      chassis_damage: data.chassis_damage,
      wheels_damage: data.wheels_damage,
      cabin_damage: data.cabin_damage,
      cargo_damage: data.cargo_damage,
      position_x: data.position_x,
      position_y: data.position_y,
      position_z: data.position_z,
      game_time: data.game_time,
      cruise_control_speed: data.cruise_control_speed,
      cruise_control_enabled: data.cruise_control_enabled,
      parking_brake: data.parking_brake,
      motor_brake: data.motor_brake,
      retarder_level: data.retarder_level,
      air_pressure: data.air_pressure,
      brake_temperature: data.brake_temperature,
      navigation_distance: data.navigation_distance,
      navigation_time: data.navigation_time,
      speed_limit: data.speed_limit,
    });

    if (error) {
      Sentry.captureException(error, {
        extra: { userId, jobId: data.job_id },
      });

      return NextResponse.json(
        { error: 'Failed to insert telemetry' },
        { status: 500 }
      );
    }

    // 7. Success response with rate limit headers
    const duration = Date.now() - startTime;

    return NextResponse.json(
      { success: true },
      {
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
          'X-Response-Time': `${duration}ms`,
        }
      }
    );

  } catch (error) {
    Sentry.captureException(error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Security layer order:**
1. Parse JSON (untrusted input)
2. Validate schema (reject malformed data early - fast path, fails most attacks)
3. Authenticate (API key lookup - slower, but needed for rate limiting)
4. Rate limit (prevent per-user resource exhaustion)
5. Secondary validation (prevent privilege escalation)
6. Database operation (safe to proceed)
7. Sentry (observe errors throughout)

**Why this order is acceptable:**
- Validation CPU cost is minimal (Zod is fast, ~microseconds for this schema)
- Validation fails the vast majority of attack payloads (invalid types, ranges)
- Rate limiting BEFORE validation would require anonymous rate limiting (IP-based)
- Per-user rate limiting is more effective than IP-based (IP can be rotated)
- The 2x buffer in telemetry limiter (7200/hour vs 3600/hour SDK rate) provides headroom
- Authenticated rate limiting prevents legitimate users from being blocked by IP sharing

**Alternative considered:** Rate limit before validation using IP-based limiting. Rejected because:
- VPN/proxy rotation bypasses IP rate limiting easily
- Shared IPs (corporate, mobile) would block legitimate users
- Per-user limiting is more granular and effective
  </action>
  <verify>
```bash
# Verify schema files from plan 02-02 exist before importing
ls web/app/api/telemetry/schema.ts
```
Should show file exists.

```bash
cd web && npx tsc --noEmit app/api/telemetry/route.ts
```
Should compile with no errors.

Check security layers:
```bash
grep -E "(telemetrySchema|telemetryLimiter|validateApiKey|Sentry)" web/app/api/telemetry/route.ts
```
Should show all security imports and usage.
  </verify>
  <done>Telemetry endpoint secured with validation, rate limiting, secondary checks, and error monitoring</done>
</task>

<task type="auto">
  <name>Secure job start endpoint</name>
  <files>web/app/api/jobs/start/route.ts</files>
  <action>
**Prerequisite:** web/app/api/jobs/start/schema.ts created in plan 02-02

Update web/app/api/jobs/start/route.ts with security layers:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { jobStartSchema } from './schema';
import { mutationLimiter } from '@/lib/ratelimit';
import { createServiceClient } from '@/lib/supabase/service';
import { validateApiKey } from '@/lib/supabase/validation';
import * as Sentry from '@sentry/nextjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate
    const result = jobStartSchema.safeParse(body);
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

    // Insert job
    const supabase = createServiceClient();
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        user_id: userId,
        source_city: data.source_city,
        source_company: data.source_company,
        destination_city: data.destination_city,
        destination_company: data.destination_company,
        cargo_type: data.cargo_type,
        cargo_weight: data.cargo_weight,
        income: data.income,
        distance: data.distance,
        deadline: data.deadline,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      Sentry.captureException(error, { extra: { userId } });
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    return NextResponse.json(
      { job },
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
ls web/app/api/jobs/start/schema.ts
```
Should show file exists.

```bash
cd web && npx tsc --noEmit app/api/jobs/start/route.ts
```
Should compile successfully.

Check security layers:
```bash
grep -E "(jobStartSchema|mutationLimiter|validateApiKey|Sentry)" web/app/api/jobs/start/route.ts
```
Should show all security imports and usage.
  </verify>
  <done>Job start endpoint secured with schema validation, rate limiting, and error monitoring</done>
</task>

</tasks>

<verification>
1. Schema files from plan 02-02 verified to exist before importing
2. Both API routes compile without TypeScript errors
3. Telemetry endpoint uses telemetryLimiter (7200/hour)
4. Job start endpoint uses mutationLimiter (100/hour)
5. Both routes validate input with Zod before operations
6. Both routes return 429 with Retry-After header on rate limit
7. Both routes capture errors in Sentry
8. Both success responses include X-RateLimit-* headers for client backoff strategies
</verification>

<success_criteria>
- Telemetry and job start routes secured with appropriate rate limiters
- Validation errors return 400 with detailed Zod error messages
- Rate limit exceeded returns 429 with Retry-After header
- Sentry captures all errors with PII already scrubbed (from plan 03)
- TypeScript compilation succeeds for all modified routes
- Schema dependencies from plan 02-02 confirmed before usage
- Rate limit headers inform clients when to retry (observable by plugin/client)
</success_criteria>

<output>
After completion, create `.planning/phases/02-security-hardening/02-04a-SUMMARY.md`
</output>
