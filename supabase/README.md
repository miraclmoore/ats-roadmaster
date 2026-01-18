# RoadMaster Pro - Supabase Database Setup

This directory contains database migrations for RoadMaster Pro.

## Quick Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `migrations/001_initial_schema.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

You should see: `Success. No rows returned`

### Option 2: Using Supabase CLI

```bash
# From the project root
cd /Users/chanmoore/dev/ats-roadmaster

# Run the migration
supabase db push

# Or apply migrations manually
supabase db reset
```

## What Gets Created

### Tables
- **jobs** - All trucking jobs (started, completed, in-progress)
- **telemetry** - Real-time truck data from the game (1Hz sampling)
- **achievements** - Achievement definitions
- **user_achievements** - User progress on achievements
- **company_stats** - Reputation/stats with trucking companies
- **user_preferences** - User settings and API keys

### Security (RLS)
- All tables have Row Level Security enabled
- Users can only access their own data
- Policies enforce `auth.uid() = user_id`

### Automatic Features

1. **API Key Generation**
   - Every new user gets a unique API key: `rm_xxxxxxxx...`
   - Used by the C# telemetry plugin to authenticate

2. **Profit Calculations**
   - Automatically calculates fuel cost, damage cost, profit
   - Updates profit per mile and fuel economy
   - Triggers on job completion

3. **Company Stats**
   - Tracks your performance with each trucking company
   - Auto-updates when jobs complete
   - Maintains on-time delivery percentage

### Achievements Seeded
- First Delivery
- Century Driver (100 jobs)
- Road Warrior (1,000 miles)
- Profitable Hauler ($10k profit)
- Fuel Master (8 MPG average)
- Perfect Record (10 on-time in a row)
- Careful Driver (0% damage job)

## Verify Setup

After running the migration, verify in Supabase Dashboard:

1. **Table Editor** → You should see 6 tables
2. **Database** → **Policies** → Each table should have RLS enabled
3. **Authentication** → Sign up a test user
4. **Table Editor** → **user_preferences** → Verify API key was created

## Get Your API Key

After signing up in the app:

```sql
-- Run this in SQL Editor (replace with your email)
SELECT api_key
FROM user_preferences
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

Or check the Dashboard page in the app - it displays your API key.

## Testing with Sample Data

Want to test the UI with fake jobs? Run this:

```sql
-- Insert sample jobs (replace USER_ID with your auth.users.id)
INSERT INTO jobs (
  user_id,
  source_city,
  destination_city,
  cargo_type,
  income,
  distance,
  started_at,
  completed_at,
  fuel_consumed,
  damage_taken
) VALUES
  ('YOUR_USER_ID', 'Los Angeles', 'San Francisco', 'Electronics', 12500, 382, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 55.2, 2.5),
  ('YOUR_USER_ID', 'Phoenix', 'Las Vegas', 'Machinery', 8900, 297, NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours', 42.1, 1.2),
  ('YOUR_USER_ID', 'Seattle', 'Portland', 'Food Products', 6200, 173, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '2 hours', 25.8, 0.5);
```

## Next Steps

After database setup:
1. ✅ Database is ready
2. 🔄 Create API routes (telemetry, jobs)
3. 🔄 Build C# SDK plugin
4. 🔄 Connect AI Dispatcher to Claude API

## Troubleshooting

**Error: "relation already exists"**
- Tables already created - migration ran successfully before
- Safe to ignore or run `DROP TABLE` commands first

**Error: "permission denied"**
- Check you're running in Supabase SQL Editor
- Verify you have owner/admin access to the project

**API key not generating**
- Check if the trigger `on_auth_user_created` exists
- Manually run: `SELECT handle_new_user()` for existing users

## Database Schema Diagram

```
auth.users (Supabase Auth)
    ↓
user_preferences (1:1)
    - api_key (for SDK plugin)
    - alert thresholds
    - display settings
    ↓
jobs (1:many)
    - job details
    - financial data
    - performance metrics
    ↓
telemetry (1:many)
    - real-time truck data
    - linked to active job
    ↓
company_stats (1:many)
    - reputation tracking
    - per-company performance
    ↓
user_achievements (many:many)
    - achievement progress
    - unlock timestamps
```

---

**Ready to roll!** 🚛💨
