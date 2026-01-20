import { createServiceClient } from "./service";

/**
 * Validates an API key and returns the associated user_id.
 * Uses service role client to bypass RLS for API key lookup.
 *
 * @param apiKey - API key in format rm_[64 hex chars]
 * @returns user_id if valid, null if invalid
 */
export async function validateApiKey(apiKey: string): Promise<string | null> {
  const supabase = createServiceClient();

  const { data: prefs, error } = await supabase
    .from('user_preferences')
    .select('user_id')
    .eq('api_key', apiKey)
    .single();

  if (error || !prefs) {
    return null;
  }

  return prefs.user_id;
}

/**
 * Secondary validation: confirms user owns a resource.
 * Use AFTER service role operations to prevent unauthorized access.
 * Defense in depth - ensures API key lookup didn't bypass intended RLS.
 *
 * @param userId - Authenticated user ID
 * @param table - Table name (jobs, telemetry, etc.)
 * @param resourceId - Resource UUID to check
 * @returns true if user owns resource, false otherwise
 */
export async function validateUserOwnsResource(
  userId: string,
  table: string,
  resourceId: string
): Promise<boolean> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from(table)
    .select('user_id')
    .eq('id', resourceId)
    .single();

  if (error || !data) {
    return false;
  }

  // Secondary validation: confirm user_id matches
  return data.user_id === userId;
}
