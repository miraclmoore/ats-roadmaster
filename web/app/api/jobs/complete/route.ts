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
