---
phase: 02-security-hardening
plan: 04b
type: execute
wave: 2
depends_on: ['02-01', '02-02', '02-03']
files_modified:
  - web/app/api/jobs/complete/route.ts
  - web/app/api/user/regenerate-key/route.ts
  - web/app/api/user/preferences/route.ts
  - web/app/api/user/preferences/schema.ts
autonomous: true

must_haves:
  truths:
    - API routes validate input with Zod before database operations
    - Rate limiting returns 429 with Retry-After header when exceeded
    - Validation errors return 400 with detailed error messages
    - Service role operations include secondary user_id validation
    - Errors are captured in Sentry with PII scrubbed
    - API client receives rate limit information to implement backoff strategies
    - Initial API key generation follows SEC-04 pattern (rm_ + 64 hex chars)
  artifacts:
    - path: web/app/api/jobs/complete/route.ts
      provides: Secured job complete endpoint
      contains: "validateUserOwnsResource"
      min_lines: 80
    - path: web/app/api/user/regenerate-key/route.ts
      provides: Secured API key regeneration
      contains: "authLimiter.limit"
      min_lines: 60
    - path: web/app/api/user/preferences/route.ts
      provides: Secured preferences endpoint
      contains: "authLimiter.limit"
      min_lines: 80
    - path: web/app/api/user/preferences/schema.ts
      provides: Preferences validation schema
      exports: [preferencesSchema]
      min_lines: 20
  key_links:
    - from: web/app/api/jobs/complete/route.ts
      to: web/lib/supabase/validation.ts
      via: validateUserOwnsResource call
      pattern: "validateUserOwnsResource"
    - from: web/app/api/jobs/complete/route.ts
      to: web/lib/ratelimit.ts
      via: mutationLimiter.limit
      pattern: "mutationLimiter\\.limit"
    - from: web/app/api/user/preferences/route.ts
      to: web/app/api/user/preferences/schema.ts
      via: preferencesSchema import
      pattern: "import.*preferencesSchema"
---

<objective>
Apply security layers (rate limiting, validation, error monitoring) to job complete, API key regeneration, and user preferences endpoints in the correct order. Audit initial API key generation to ensure SEC-04 compliance.

Purpose: Complete the security hardening of all Phase 2 API routes by securing job completion, API key management, and user preferences endpoints. Implements SEC-01 through SEC-05 requirements. AI endpoints deferred to Phase 6.

Output: Job complete, API key regeneration, and preferences routes secured with layered defense: validation first (fast path rejection), authentication second (identify user), rate limiting third (prevent per-user abuse), secondary validation fourth (prevent privilege escalation), Sentry throughout (observes errors). Initial key generation pattern confirmed.
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
@web/app/api/user/preferences/route.ts
@web/lib/supabase/service.ts

**Note on AI endpoints:** /api/ai/chat is a Phase 6 feature (AI-powered insights). It will be secured with aggressive rate limiting (10 req/hour due to expensive Claude API calls) when Phase 6 is implemented. Deferring security to Phase 6 keeps concerns aligned with feature delivery.
</context>

<tasks>

<task type="auto">
  <name>Secure job complete endpoint</name>
  <files>web/app/api/jobs/complete/route.ts</files>
  <action>
**Prerequisite:** web/app/api/jobs/complete/schema.ts created in plan 02-02

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

<task type="auto">
  <name>Secure user preferences endpoint</name>
  <files>web/app/api/user/preferences/route.ts, web/app/api/user/preferences/schema.ts</files>
  <action>
**Step 1: Create preferences validation schema**

Create web/app/api/user/preferences/schema.ts:

```typescript
import { z } from "zod";

export const preferencesSchema = z.object({
  fuel_alert_threshold: z.number().int().min(0).max(100).optional(),
  rest_alert_minutes: z.number().int().min(0).max(480).optional(), // max 8 hours
  maintenance_alert_threshold: z.number().int().min(0).max(100).optional(),

  units: z.enum(['imperial', 'metric']).optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).optional(),
  timezone: z.string().max(100).optional(), // IANA timezone identifier
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;
```

**Step 2: Secure preferences endpoint**

Update web/app/api/user/preferences/route.ts:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authLimiter } from '@/lib/ratelimit';
import { preferencesSchema } from './schema';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: prefs, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      Sentry.captureException(error, { user: { id: user.id } });
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    return NextResponse.json(prefs || {});
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const result = preferencesSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit
    const { success, limit, reset, remaining } = await authLimiter.limit(user.id);
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

    // Update preferences (RLS enforces user_id)
    const { error: updateError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...result.data,
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      Sentry.captureException(updateError, { user: { id: user.id } });
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
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

**Security notes:**
- GET has no rate limit (reads are cheap)
- POST uses authLimiter (20 req/15min) for updates
- Zod validates all preference values (no invalid data)
- RLS automatically scopes to authenticated user
  </action>
  <verify>
```bash
cd web && npx tsc --noEmit app/api/user/preferences/schema.ts app/api/user/preferences/route.ts
```
Should compile successfully.

Check rate limiting on POST:
```bash
grep "authLimiter.limit" web/app/api/user/preferences/route.ts
```
Should show rate limiting in POST handler only.

Check schema validation:
```bash
grep "preferencesSchema.safeParse" web/app/api/user/preferences/route.ts
```
Should show validation before update.
  </verify>
  <done>Preferences endpoint secured with Zod validation and auth rate limiting on POST, GET remains unlocked for cheap reads</done>
</task>

<task type="auto">
  <name>Audit initial API key generation (SEC-04 pattern verification)</name>
  <files>None (audit only)</files>
  <action>
Audit codebase to verify initial API key generation follows SEC-04 pattern (rm_ + 64 hex chars):

**Step 1: Search for API key generation**

```bash
cd web && grep -rn "api_key.*=" app/ lib/ --include="*.ts" --include="*.tsx" | grep -v "const { api_key" | grep -v "data.api_key"
```

Look for assignments to api_key field.

**Step 2: Check database triggers**

```bash
ls supabase/migrations/*.sql 2>/dev/null && grep -l "api_key" supabase/migrations/*.sql 2>/dev/null
```

Check if Postgres triggers generate API keys on user creation.

**Step 3: Check signup flow**

```bash
ls web/app/api/auth/signup/route.ts 2>/dev/null && cat web/app/api/auth/signup/route.ts
```

Check if signup route creates API key.

**Step 4: Check for client-side generation**

```bash
cd web && grep -rn "randomBytes" components/ app/\(auth\)/ app/\(dashboard\)/ --include="*.ts" --include="*.tsx"
```

Verify no client-side key generation (should be server-only).

**Step 5: Document findings**

In SUMMARY.md, document:
- Where initial API keys are generated (signup route, database trigger, or manual regeneration only)
- Confirm pattern matches SEC-04: `rm_${randomBytes(32).toString('hex')}`
- If no initial generation exists, note that users must regenerate via /api/user/regenerate-key

**Expected results:**
- Initial keys generated server-side only
- Pattern: rm_ + 64 hex chars (32 random bytes)
- OR: No initial generation, users must regenerate manually
  </action>
  <verify>
```bash
# Verify regenerate-key follows pattern
grep -A2 "rm_.*randomBytes" web/app/api/user/regenerate-key/route.ts
```
Should show pattern: `rm_${randomBytes(32).toString('hex')}`

```bash
# Confirm no client-side generation
cd web && ! grep -r "randomBytes" components/ app/\(dashboard\)/ --include="*.tsx" --include="*.ts"
```
Exit code 0 means no client-side usage (good).
  </verify>
  <done>Audit confirms API key generation (initial and regeneration) follows SEC-04 pattern (rm_ + 64 hex chars) and occurs server-side only, OR documents that initial generation doesn't exist yet</done>
</task>

</tasks>

<verification>
1. Schema files from plan 02-02 verified to exist before importing
2. All API routes compile without TypeScript errors
3. Job complete endpoint uses mutationLimiter (100/hour)
4. Regenerate key uses authLimiter (20/15min)
5. Preferences POST uses authLimiter, GET has no rate limit
6. All POST routes validate input (job complete with Zod, regenerate with session auth, preferences with Zod)
7. All routes return 429 with Retry-After header on rate limit
8. Job complete includes secondary validation (validateUserOwnsResource)
9. All routes capture errors in Sentry
10. All success responses include X-RateLimit-* headers for client backoff strategies
11. Initial API key generation pattern verified to follow SEC-04 (or documented as not yet implemented)
12. AI endpoint security deferred to Phase 6 (documented in context)
</verification>

<success_criteria>
- Job complete, API key regeneration, and preferences routes secured with appropriate rate limiters
- Validation errors return 400 with detailed Zod error messages
- Rate limit exceeded returns 429 with Retry-After header
- Secondary validation prevents privilege escalation on job operations
- Sentry captures all errors with PII already scrubbed (from plan 03)
- TypeScript compilation succeeds for all modified routes
- Schema dependencies from plan 02-02 confirmed before usage
- Rate limit headers inform clients when to retry (observable by plugin/client)
- Initial API key generation follows SEC-04 pattern or is documented as handled by regeneration only
- AI endpoint security explicitly deferred to Phase 6 (noted in context and success criteria)
</success_criteria>

<output>
After completion, create `.planning/phases/02-security-hardening/02-04b-SUMMARY.md`
</output>
