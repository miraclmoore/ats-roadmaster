-- Debug profit calculations
-- Run this to see what's actually stored vs what should be calculated

SELECT
  source_city || ' → ' || destination_city as route,
  income,
  fuel_consumed,
  fuel_cost,
  damage_taken,
  damage_cost,
  profit,
  -- Manual calculation to compare
  income - COALESCE(fuel_cost, 0) - COALESCE(damage_cost, 0) as calculated_profit
FROM jobs
WHERE user_id = 'dae46ee9-69ba-4489-8d46-5bf50a1a994f'
ORDER BY completed_at DESC
LIMIT 5;
