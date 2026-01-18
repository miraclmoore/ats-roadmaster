import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/jobs/complete
// Called when a job is completed/delivered
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate required fields
    if (!data.user_id && !data.api_key) {
      return NextResponse.json(
        { error: 'user_id or api_key is required' },
        { status: 400 }
      );
    }

    if (!data.job_id) {
      return NextResponse.json(
        { error: 'job_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // If using API key (from SDK plugin), look up user_id
    let userId = data.user_id;
    if (data.api_key && !userId) {
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('user_id')
        .eq('api_key', data.api_key)
        .single();

      if (!prefs) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }

      userId = prefs.user_id;
    }

    // Get telemetry data for this job to calculate performance metrics
    const { data: telemetry } = await supabase
      .from('telemetry')
      .select('*')
      .eq('job_id', data.job_id)
      .order('created_at', { ascending: true });

    // Calculate performance metrics from telemetry
    let fuelConsumed = null;
    let damageTaken = null;
    let avgSpeed = null;
    let avgRpm = null;

    if (telemetry && telemetry.length > 0) {
      const first = telemetry[0];
      const last = telemetry[telemetry.length - 1];

      // Fuel consumed (difference between start and end)
      if (first.fuel_current && last.fuel_current) {
        fuelConsumed = first.fuel_current - last.fuel_current;
      }

      // Total damage taken (sum of all damage increases)
      const totalDamage =
        (last.engine_damage || 0) +
        (last.transmission_damage || 0) +
        (last.chassis_damage || 0) +
        (last.wheels_damage || 0) +
        (last.cabin_damage || 0) +
        (last.cargo_damage || 0);
      damageTaken = totalDamage * 100; // Convert to percentage

      // Average speed and RPM
      const speeds = telemetry.map((t) => t.speed || 0).filter((s) => s > 0);
      const rpms = telemetry.map((t) => t.rpm || 0).filter((r) => r > 0);

      if (speeds.length > 0) {
        avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      }

      if (rpms.length > 0) {
        avgRpm = rpms.reduce((a, b) => a + b, 0) / rpms.length;
      }
    }

    // Update job with completion data
    // Note: profit/fuel_cost/damage_cost are calculated automatically by database trigger
    const { data: job, error } = await supabase
      .from('jobs')
      .update({
        completed_at: new Date().toISOString(),
        delivered_late: data.delivered_late || false,
        fuel_consumed: fuelConsumed,
        damage_taken: damageTaken,
        avg_speed: avgSpeed,
        avg_rpm: avgRpm,
      })
      .eq('id', data.job_id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Job complete error:', error);
      return NextResponse.json(
        { error: 'Failed to complete job' },
        { status: 500 }
      );
    }

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job,
      metrics: {
        fuel_consumed: fuelConsumed,
        damage_taken: damageTaken,
        avg_speed: avgSpeed ? Math.round(avgSpeed) : null,
        profit: job.profit,
        fuel_economy: job.fuel_economy,
      },
    });
  } catch (error) {
    console.error('Job complete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
