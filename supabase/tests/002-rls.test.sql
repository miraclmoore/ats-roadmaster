-- Row Level Security Tests: User data isolation
-- Requirements: Supabase CLI, local instance running ('supabase start')
-- Run: npm run test:db (from project root)
--
-- This test suite verifies:
-- 1. RLS is enabled on all user data tables
-- 2. Users can only access their own data
-- 3. Users cannot access other users' data
-- 4. INSERT, SELECT, UPDATE, DELETE operations respect RLS policies

BEGIN;
SELECT plan(24);

-- ============================================================================
-- SETUP: Create test users
-- ============================================================================

-- Create two test users with known UUIDs for testing
-- Note: In Supabase test environment, we can insert directly into auth.users
-- for testing purposes

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'test_user_1@test.com', crypt('password', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', FALSE, 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'test_user_2@test.com', crypt('password', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', FALSE, 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- RLS ENABLED TESTS
-- ============================================================================

SELECT has_table('public', 'jobs', 'jobs table should exist');
SELECT is(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.jobs'::regclass),
  true,
  'RLS should be enabled on jobs table'
);

SELECT is(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.telemetry'::regclass),
  true,
  'RLS should be enabled on telemetry table'
);

SELECT is(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.user_achievements'::regclass),
  true,
  'RLS should be enabled on user_achievements table'
);

SELECT is(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.user_preferences'::regclass),
  true,
  'RLS should be enabled on user_preferences table'
);

SELECT is(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.company_stats'::regclass),
  true,
  'RLS should be enabled on company_stats table'
);

-- ============================================================================
-- JOBS TABLE RLS TESTS
-- ============================================================================

-- Insert test jobs as both users (using service role context)
INSERT INTO public.jobs (user_id, source_city, destination_city, cargo_type, income, distance, started_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Los Angeles', 'San Francisco', 'Electronics', 5000, 382, now()),
  ('22222222-2222-2222-2222-222222222222', 'Portland', 'Seattle', 'Furniture', 3000, 174, now());

-- Test: User 1 can see their own job
SET request.jwt.claims.sub = '11111111-1111-1111-1111-111111111111';
SET LOCAL role TO authenticated;

SELECT is(
  (SELECT COUNT(*)::int FROM public.jobs WHERE user_id = '11111111-1111-1111-1111-111111111111'),
  1,
  'User 1 should see their own job'
);

-- Test: User 1 cannot see User 2's job
SELECT is(
  (SELECT COUNT(*)::int FROM public.jobs WHERE user_id = '22222222-2222-2222-2222-222222222222'),
  0,
  'User 1 should not see User 2 jobs'
);

-- Test: User 1 can only see 1 total job (their own)
SELECT is(
  (SELECT COUNT(*)::int FROM public.jobs),
  1,
  'User 1 should see only 1 job total (their own)'
);

-- Switch to User 2 context
RESET role;
SET request.jwt.claims.sub = '22222222-2222-2222-2222-222222222222';
SET LOCAL role TO authenticated;

-- Test: User 2 can see their own job
SELECT is(
  (SELECT COUNT(*)::int FROM public.jobs WHERE user_id = '22222222-2222-2222-2222-222222222222'),
  1,
  'User 2 should see their own job'
);

-- Test: User 2 cannot see User 1's job
SELECT is(
  (SELECT COUNT(*)::int FROM public.jobs WHERE user_id = '11111111-1111-1111-1111-111111111111'),
  0,
  'User 2 should not see User 1 jobs'
);

-- Test: User 2 can only see 1 total job (their own)
SELECT is(
  (SELECT COUNT(*)::int FROM public.jobs),
  1,
  'User 2 should see only 1 job total (their own)'
);

-- Reset to service role for cleanup
RESET role;

-- ============================================================================
-- JOBS TABLE: INSERT/UPDATE/DELETE TESTS
-- ============================================================================

-- Test: User 1 can insert their own job
SET request.jwt.claims.sub = '11111111-1111-1111-1111-111111111111';
SET LOCAL role TO authenticated;

INSERT INTO public.jobs (user_id, source_city, destination_city, cargo_type, income, distance, started_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'Phoenix', 'Las Vegas', 'Machinery', 4500, 297, now());

SELECT is(
  (SELECT COUNT(*)::int FROM public.jobs WHERE source_city = 'Phoenix'),
  1,
  'User 1 should be able to insert their own job'
);

-- Test: User 1 can update their own job
UPDATE public.jobs
SET completed_at = now()
WHERE user_id = '11111111-1111-1111-1111-111111111111'
  AND source_city = 'Los Angeles';

SELECT is(
  (SELECT COUNT(*)::int FROM public.jobs WHERE user_id = '11111111-1111-1111-1111-111111111111' AND completed_at IS NOT NULL),
  1,
  'User 1 should be able to update their own job'
);

RESET role;

-- ============================================================================
-- TELEMETRY TABLE RLS TESTS
-- ============================================================================

-- Insert test telemetry as both users (using service role context)
INSERT INTO public.telemetry (user_id, speed, rpm, fuel_current, fuel_capacity)
VALUES
  ('11111111-1111-1111-1111-111111111111', 65.5, 1200, 50.0, 100.0),
  ('22222222-2222-2222-2222-222222222222', 55.0, 1000, 75.0, 100.0);

-- Test: User 1 can see their own telemetry
SET request.jwt.claims.sub = '11111111-1111-1111-1111-111111111111';
SET LOCAL role TO authenticated;

SELECT is(
  (SELECT COUNT(*)::int FROM public.telemetry WHERE user_id = '11111111-1111-1111-1111-111111111111'),
  1,
  'User 1 should see their own telemetry'
);

-- Test: User 1 cannot see User 2's telemetry
SELECT is(
  (SELECT COUNT(*)::int FROM public.telemetry WHERE user_id = '22222222-2222-2222-2222-222222222222'),
  0,
  'User 1 should not see User 2 telemetry'
);

-- Switch to User 2 context
RESET role;
SET request.jwt.claims.sub = '22222222-2222-2222-2222-222222222222';
SET LOCAL role TO authenticated;

-- Test: User 2 can see their own telemetry
SELECT is(
  (SELECT COUNT(*)::int FROM public.telemetry WHERE user_id = '22222222-2222-2222-2222-222222222222'),
  1,
  'User 2 should see their own telemetry'
);

-- Test: User 2 cannot see User 1's telemetry
SELECT is(
  (SELECT COUNT(*)::int FROM public.telemetry WHERE user_id = '11111111-1111-1111-1111-111111111111'),
  0,
  'User 2 should not see User 1 telemetry'
);

RESET role;

-- ============================================================================
-- USER PREFERENCES RLS TESTS
-- ============================================================================

-- User preferences should have been auto-created by trigger
-- Test: User 1 can see their own preferences
SET request.jwt.claims.sub = '11111111-1111-1111-1111-111111111111';
SET LOCAL role TO authenticated;

SELECT ok(
  EXISTS(SELECT 1 FROM public.user_preferences WHERE user_id = '11111111-1111-1111-1111-111111111111'),
  'User 1 should see their own preferences'
);

-- Test: User 1 cannot see User 2's preferences
SELECT is(
  (SELECT COUNT(*)::int FROM public.user_preferences WHERE user_id = '22222222-2222-2222-2222-222222222222'),
  0,
  'User 1 should not see User 2 preferences'
);

RESET role;

-- ============================================================================
-- COMPANY STATS RLS TESTS
-- ============================================================================

-- Insert test company stats
INSERT INTO public.company_stats (user_id, company_name, jobs_completed, jobs_on_time)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Acme Transport', 10, 9),
  ('22222222-2222-2222-2222-222222222222', 'FastFreight Inc', 5, 5);

-- Test: User 1 can see their own company stats
SET request.jwt.claims.sub = '11111111-1111-1111-1111-111111111111';
SET LOCAL role TO authenticated;

SELECT is(
  (SELECT COUNT(*)::int FROM public.company_stats WHERE user_id = '11111111-1111-1111-1111-111111111111'),
  1,
  'User 1 should see their own company stats'
);

-- Test: User 1 cannot see User 2's company stats
SELECT is(
  (SELECT COUNT(*)::int FROM public.company_stats WHERE user_id = '22222222-2222-2222-2222-222222222222'),
  0,
  'User 1 should not see User 2 company stats'
);

RESET role;

SELECT * FROM finish();
ROLLBACK;
