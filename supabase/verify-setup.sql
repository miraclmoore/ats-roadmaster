-- RoadMaster Pro - Verification Queries
-- Run these in Supabase SQL Editor to verify your database setup

-- 1. Check all tables exist
SELECT
  table_name,
  CASE
    WHEN table_name IN ('jobs', 'telemetry', 'user_achievements', 'company_stats', 'user_preferences')
    THEN '✅ Found'
    ELSE '⚠️ Missing'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('jobs', 'telemetry', 'achievements', 'user_achievements', 'company_stats', 'user_preferences')
ORDER BY table_name;

-- 2. Check RLS is enabled on all tables
SELECT
  tablename,
  CASE
    WHEN rowsecurity = true THEN '✅ Enabled'
    ELSE '❌ Disabled'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('jobs', 'telemetry', 'achievements', 'user_achievements', 'company_stats', 'user_preferences')
ORDER BY tablename;

-- 3. Check achievements were seeded
SELECT
  code,
  name,
  category,
  requirement_value
FROM achievements
ORDER BY requirement_value;

-- 4. Check triggers exist
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN ('jobs', 'users')
ORDER BY event_object_table, trigger_name;

-- 5. If you have a test user, check their API key was created
-- Replace 'your-email@example.com' with your actual email
SELECT
  user_id,
  api_key,
  units,
  currency
FROM user_preferences
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
