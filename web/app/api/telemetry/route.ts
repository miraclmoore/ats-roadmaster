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
