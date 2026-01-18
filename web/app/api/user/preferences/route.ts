import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse request body
  const body = await request.json();
  const { units, currency, timezone } = body;

  // Validate inputs
  if (!units || !currency || !timezone) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Update user_preferences
  const { error: updateError } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      units,
      currency,
      timezone,
      updated_at: new Date().toISOString(),
    });

  if (updateError) {
    console.error('Error updating preferences:', updateError);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: 'Preferences updated successfully',
  });
}
