-- RoadMaster Pro - Sample Data for Testing
-- Run this in Supabase SQL Editor to populate your dashboard with test data
-- Replace dae46ee9-69ba-4489-8d46-5bf50a1a994f with your actual user ID from auth.users table

-- First, get your user_id:
-- SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Then replace dae46ee9-69ba-4489-8d46-5bf50a1a994f below and run the whole script

-- Sample Jobs with realistic profit/loss scenarios
INSERT INTO jobs (
  user_id,
  source_city,
  source_company,
  destination_city,
  destination_company,
  cargo_type,
  cargo_weight,
  income,
  distance,
  started_at,
  completed_at,
  delivered_late,
  fuel_consumed,
  damage_taken
) VALUES
  -- Profitable long haul
  ('dae46ee9-69ba-4489-8d46-5bf50a1a994f', 'Los Angeles', 'Port Warehouse', 'Seattle', 'Tech Distribution', 'Electronics', 24000, 18500, 1087, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days 18 hours', false, 155.2, 3.5),

  -- Short profitable run
  ('dae46ee9-69ba-4489-8d46-5bf50a1a994f', 'San Francisco', 'Bay Foods', 'Sacramento', 'Supermart', 'Food Products', 18000, 5200, 87, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days 22 hours', false, 12.8, 0.5),

  -- Medium haul - good profit
  ('dae46ee9-69ba-4489-8d46-5bf50a1a994f', 'Phoenix', 'Desert Mining', 'Albuquerque', 'Construction Co', 'Machinery', 32000, 14200, 456, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days 15 hours', false, 68.5, 2.1),

  -- Late delivery - reduced profit
  ('dae46ee9-69ba-4489-8d46-5bf50a1a994f', 'Las Vegas', 'Casino Supplies', 'Reno', 'Resort District', 'Fragile Goods', 15000, 7800, 445, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 20 hours', true, 64.2, 4.8),

  -- Electronics again - same route as first
  ('dae46ee9-69ba-4489-8d46-5bf50a1a994f', 'Los Angeles', 'Tech Warehouse', 'Seattle', 'Distribution Center', 'Electronics', 22000, 17800, 1087, NOW() - INTERVAL '36 hours', NOW() - INTERVAL '30 hours', false, 152.8, 2.9),

  -- Food products - same route as second
  ('dae46ee9-69ba-4489-8d46-5bf50a1a994f', 'San Francisco', 'Organic Farms', 'Sacramento', 'Food Market', 'Food Products', 16500, 4900, 87, NOW() - INTERVAL '28 hours', NOW() - INTERVAL '26 hours', false, 11.9, 0.3),

  -- High damage job - lower profit
  ('dae46ee9-69ba-4489-8d46-5bf50a1a994f', 'Portland', 'Lumber Mill', 'Eugene', 'Hardware Depot', 'Construction Materials', 28000, 8500, 110, NOW() - INTERVAL '20 hours', NOW() - INTERVAL '18 hours', false, 16.2, 8.5),

  -- Perfect delivery - max profit
  ('dae46ee9-69ba-4489-8d46-5bf50a1a994f', 'Bakersfield', 'Oil Refinery', 'Los Angeles', 'Chemical Plant', 'Chemicals', 30000, 12200, 112, NOW() - INTERVAL '14 hours', NOW() - INTERVAL '12 hours', false, 16.8, 0.2),

  -- Recent job - electronics (most profitable cargo)
  ('dae46ee9-69ba-4489-8d46-5bf50a1a994f', 'San Diego', 'Electronics Hub', 'Phoenix', 'Tech Store', 'Electronics', 20000, 13400, 357, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '6 hours', false, 52.1, 1.8),

  -- Most recent completed job
  ('dae46ee9-69ba-4489-8d46-5bf50a1a994f', 'Tucson', 'Food Processing', 'Phoenix', 'Grocery Chain', 'Food Products', 19000, 6800, 116, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', false, 17.3, 0.9);

-- Note: profit, fuel_cost, damage_cost, profit_per_mile, and fuel_economy
-- will be calculated automatically by database triggers!

-- Verify the data was inserted
SELECT
  source_city || ' → ' || destination_city as route,
  cargo_type,
  income,
  profit,
  fuel_economy,
  delivered_late
FROM jobs
WHERE user_id = 'dae46ee9-69ba-4489-8d46-5bf50a1a994f'
ORDER BY completed_at DESC;

-- Check your new stats
SELECT
  COUNT(*) as total_jobs,
  SUM(income) as total_income,
  SUM(profit) as total_profit,
  ROUND(AVG(profit)) as avg_profit,
  ROUND(AVG(fuel_economy), 1) as avg_mpg
FROM jobs
WHERE user_id = 'dae46ee9-69ba-4489-8d46-5bf50a1a994f'
  AND completed_at IS NOT NULL;
