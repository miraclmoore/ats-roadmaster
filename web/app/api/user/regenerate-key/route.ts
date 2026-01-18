import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function POST() {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Generate new API key in format: rm_{random_string}
  const newApiKey = `rm_${randomBytes(32).toString('hex')}`;

  // Update user_preferences with new API key
  const { error: updateError } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      api_key: newApiKey,
      updated_at: new Date().toISOString(),
    });

  if (updateError) {
    console.error('Error regenerating API key:', updateError);
    return NextResponse.json(
      { error: 'Failed to regenerate API key' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    api_key: newApiKey,
    message: 'API key regenerated successfully',
  });
}
