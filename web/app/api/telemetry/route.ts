import { createServiceClient } from '@/lib/supabase/service';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/telemetry
// Receives real-time telemetry data from the C# SDK plugin
// Samples at 1Hz from the game
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

    // Use service client to bypass RLS (API routes authenticate via API key)
    const supabase = createServiceClient();

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

    // Insert telemetry data
    const { error } = await supabase.from('telemetry').insert({
      user_id: userId,
      job_id: data.job_id || null,

      // Truck state
      speed: data.speed,
      rpm: data.rpm,
      gear: data.gear,
      fuel_current: data.fuel_current,
      fuel_capacity: data.fuel_capacity,

      // Damage (0.0 to 1.0 scale)
      engine_damage: data.engine_damage,
      transmission_damage: data.transmission_damage,
      chassis_damage: data.chassis_damage,
      wheels_damage: data.wheels_damage,
      cabin_damage: data.cabin_damage,
      cargo_damage: data.cargo_damage,

      // Position
      position_x: data.position_x,
      position_y: data.position_y,
      position_z: data.position_z,

      // Game time
      game_time: data.game_time,
    });

    if (error) {
      console.error('Telemetry insert error:', error);
      return NextResponse.json(
        { error: 'Failed to insert telemetry' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Telemetry API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
