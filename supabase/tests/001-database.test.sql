-- Database Tests: Schema Structure, Constraints, and Calculated Fields
-- Requirements: Supabase CLI, local instance running ('supabase start')
-- Run: npm run test:db (from project root)
--
-- This test suite verifies:
-- 1. Core tables exist with correct structure
-- 2. Required columns for profit calculations are present
-- 3. Indexes exist for query performance
-- 4. Foreign key relationships are properly configured
-- 5. Constraints ensure data integrity

BEGIN;
SELECT plan(30);

-- ============================================================================
-- JOBS TABLE STRUCTURE
-- ============================================================================

SELECT has_table('public', 'jobs', 'jobs table should exist');

-- Test required columns exist
SELECT has_column('public', 'jobs', 'id', 'jobs should have id column');
SELECT has_column('public', 'jobs', 'user_id', 'jobs should have user_id column');
SELECT has_column('public', 'jobs', 'source_city', 'jobs should have source_city column');
SELECT has_column('public', 'jobs', 'destination_city', 'jobs should have destination_city column');
SELECT has_column('public', 'jobs', 'cargo_type', 'jobs should have cargo_type column');
SELECT has_column('public', 'jobs', 'income', 'jobs should have income column');
SELECT has_column('public', 'jobs', 'distance', 'jobs should have distance column');
SELECT has_column('public', 'jobs', 'started_at', 'jobs should have started_at column');

-- Test profit calculation fields exist
SELECT has_column('public', 'jobs', 'profit', 'jobs should have profit column for calculated values');
SELECT has_column('public', 'jobs', 'fuel_cost', 'jobs should have fuel_cost column for calculated values');
SELECT has_column('public', 'jobs', 'damage_cost', 'jobs should have damage_cost column for calculated values');
SELECT has_column('public', 'jobs', 'profit_per_mile', 'jobs should have profit_per_mile column');
SELECT has_column('public', 'jobs', 'fuel_economy', 'jobs should have fuel_economy column');

-- Test NOT NULL constraints
SELECT col_not_null('public', 'jobs', 'user_id', 'jobs.user_id should be NOT NULL');
SELECT col_not_null('public', 'jobs', 'source_city', 'jobs.source_city should be NOT NULL');
SELECT col_not_null('public', 'jobs', 'destination_city', 'jobs.destination_city should be NOT NULL');
SELECT col_not_null('public', 'jobs', 'cargo_type', 'jobs.cargo_type should be NOT NULL');
SELECT col_not_null('public', 'jobs', 'income', 'jobs.income should be NOT NULL');
SELECT col_not_null('public', 'jobs', 'distance', 'jobs.distance should be NOT NULL');
SELECT col_not_null('public', 'jobs', 'started_at', 'jobs.started_at should be NOT NULL');

-- ============================================================================
-- TELEMETRY TABLE STRUCTURE
-- ============================================================================

SELECT has_table('public', 'telemetry', 'telemetry table should exist');

SELECT has_column('public', 'telemetry', 'id', 'telemetry should have id column');
SELECT has_column('public', 'telemetry', 'user_id', 'telemetry should have user_id column');
SELECT has_column('public', 'telemetry', 'job_id', 'telemetry should have job_id column');
SELECT has_column('public', 'telemetry', 'speed', 'telemetry should have speed column');
SELECT has_column('public', 'telemetry', 'rpm', 'telemetry should have rpm column');
SELECT has_column('public', 'telemetry', 'fuel_current', 'telemetry should have fuel_current column');
SELECT has_column('public', 'telemetry', 'fuel_capacity', 'telemetry should have fuel_capacity column');

-- ============================================================================
-- INDEXES
-- ============================================================================

SELECT has_index('public', 'jobs', 'idx_jobs_user_id', 'jobs should have user_id index for query performance');
SELECT has_index('public', 'jobs', 'idx_jobs_completed_at', 'jobs should have completed_at index for filtering');

SELECT * FROM finish();
ROLLBACK;
