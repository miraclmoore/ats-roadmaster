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
