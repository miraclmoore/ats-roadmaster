import { createServiceClient } from '@/lib/supabase/service';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/jobs/start
// Called when a job is started in the game
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

    if (!data.source_city || !data.destination_city || !data.cargo_type || !data.income || !data.distance) {
      return NextResponse.json(
        { error: 'Missing required job fields' },
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

    // Create new job
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        user_id: userId,
        source_city: data.source_city,
        source_company: data.source_company || null,
        destination_city: data.destination_city,
        destination_company: data.destination_company || null,
        cargo_type: data.cargo_type,
        cargo_weight: data.cargo_weight || null,
        income: data.income,
        distance: data.distance,
        started_at: new Date().toISOString(),
        deadline: data.deadline || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Job start error:', error);
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job_id: job.id,
      job,
    });
  } catch (error) {
    console.error('Job start API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
