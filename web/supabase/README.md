# Supabase Setup for RoadMaster Pro

## Initial Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Copy your project URL and keys:
   - Go to Project Settings → API
   - Copy `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

3. Create `.env.local` in the web directory:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your Supabase credentials in `.env.local`

## Database Migration

### Option 1: Supabase Dashboard (Recommended for first time)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy the contents of `migrations/001_initial_schema.sql`
5. Paste and run the query

### Option 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Verify Setup

After running the migration, verify in your Supabase dashboard:

1. **Tables** (Database → Tables):
   - jobs
   - telemetry
   - achievements
   - user_achievements
   - company_stats
   - user_preferences

2. **RLS Policies** (Authentication → Policies):
   - Each table should have policies enabled
   - Users can only access their own data

3. **Indexes**:
   - Check that indexes are created on frequently queried columns

## Authentication Setup

1. Go to Authentication → Providers
2. Enable Email provider
3. (Optional) Enable Google OAuth:
   - Get credentials from Google Cloud Console
   - Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`

## API Key for SDK Plugin

Users will need an API key to authenticate the C# telemetry plugin. This is stored in the `user_preferences` table and should be generated on signup.

Example key generation:
```sql
UPDATE user_preferences
SET api_key = gen_random_uuid()::text
WHERE user_id = 'user-id-here';
```

## Testing

Test the setup with a simple query:

```sql
SELECT * FROM jobs WHERE user_id = auth.uid();
```

This should return empty results (no errors) if RLS is working correctly.
