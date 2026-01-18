-- RoadMaster Pro - Clear Test Data
-- Run this in Supabase SQL Editor to remove sample data
--
-- IMPORTANT: This script removes ALL data except your user account and API key.
-- Your preferences and authentication will be preserved.

-- Replace with your user_id if different
DO $$
DECLARE
  target_user_id UUID := 'dae46ee9-69ba-4489-8d46-5bf50a1a994f';
BEGIN
  -- Delete telemetry data
  DELETE FROM telemetry WHERE user_id = target_user_id;
  RAISE NOTICE 'Deleted telemetry records';

  -- Delete jobs
  DELETE FROM jobs WHERE user_id = target_user_id;
  RAISE NOTICE 'Deleted jobs records';

  -- Delete user achievements (if any)
  DELETE FROM user_achievements WHERE user_id = target_user_id;
  RAISE NOTICE 'Deleted user achievements';

  -- Delete company stats (if any)
  DELETE FROM company_stats WHERE user_id = target_user_id;
  RAISE NOTICE 'Deleted company stats';

  -- Keep user_preferences (API key, settings)
  -- Keep auth.users record

  RAISE NOTICE 'Test data cleared successfully!';
END $$;

-- Verify deletion
SELECT
  (SELECT COUNT(*) FROM jobs WHERE user_id = 'dae46ee9-69ba-4489-8d46-5bf50a1a994f') as jobs_count,
  (SELECT COUNT(*) FROM telemetry WHERE user_id = 'dae46ee9-69ba-4489-8d46-5bf50a1a994f') as telemetry_count,
  (SELECT COUNT(*) FROM user_achievements WHERE user_id = 'dae46ee9-69ba-4489-8d46-5bf50a1a994f') as achievements_count,
  (SELECT COUNT(*) FROM company_stats WHERE user_id = 'dae46ee9-69ba-4489-8d46-5bf50a1a994f') as company_stats_count;
