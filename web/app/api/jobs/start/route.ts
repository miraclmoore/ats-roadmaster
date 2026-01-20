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
