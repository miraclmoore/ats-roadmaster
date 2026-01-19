import { createClient } from '@supabase/supabase-js';

// Service role client - bypasses RLS for API key lookups
// Only use this for authenticated API routes that verify API keys
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
