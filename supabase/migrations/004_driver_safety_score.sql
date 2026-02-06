-- Migration: Add Driver Safety Score System
-- Description: Adds safety scoring to jobs (0-100 scale) with automatic calculation on completion
-- Phase: 3 - Design System & Core Fixes
-- Date: 2026-02-05

-- Add safety_score column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS safety_score DECIMAL DEFAULT NULL;

-- Create index for safety score queries
CREATE INDEX IF NOT EXISTS idx_jobs_safety_score ON jobs(safety_score DESC);

-- Safety Score Calculation Function
-- Scoring breakdown:
--   Safety (40 points max penalty): Speeding (-20), Damage (-20)
--   Compliance (30 points max penalty): Late delivery (-30)
--   Efficiency (30 points max penalty): Poor fuel economy (-30)
CREATE OR REPLACE FUNCTION calculate_safety_score(p_job_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
  v_safety_score DECIMAL;
  v_speeding_penalty DECIMAL DEFAULT 0;
  v_damage_penalty DECIMAL DEFAULT 0;
  v_late_penalty DECIMAL DEFAULT 0;
  v_fuel_efficiency_penalty DECIMAL DEFAULT 0;
  v_avg_speed DECIMAL;
  v_damage_taken DECIMAL;
  v_delivered_late BOOLEAN;
  v_fuel_economy DECIMAL;
BEGIN
  -- Start at perfect score
  v_safety_score := 100;

  -- Fetch job metrics
  SELECT
    avg_speed,
    damage_taken,
    delivered_late,
    fuel_economy
  INTO
    v_avg_speed,
    v_damage_taken,
    v_delivered_late,
    v_fuel_economy
  FROM jobs
  WHERE id = p_job_id;

  -- Safety Component (40 points max penalty)

  -- Speeding: -20 points if avg speed > 65 mph (assuming 60mph speed limit)
  IF v_avg_speed > 65 THEN
    v_speeding_penalty := 20;
  END IF;

  -- Damage: -20 points scaled by damage percentage
  -- Example: 50% damage = -10 points, 100% damage = -20 points
  v_damage_penalty := LEAST(20, (v_damage_taken * 0.2));

  -- Compliance Component (30 points max penalty)

  -- Late delivery: -30 points (full penalty)
  IF v_delivered_late THEN
    v_late_penalty := 30;
  END IF;

  -- Efficiency Component (30 points max penalty)

  -- Fuel economy: Perfect at 6+ MPG, full penalty at 4 MPG or less
  -- Linear scaling between 4-6 MPG
  IF v_fuel_economy >= 6 THEN
    v_fuel_efficiency_penalty := 0;  -- Perfect efficiency
  ELSIF v_fuel_economy <= 4 THEN
    v_fuel_efficiency_penalty := 30; -- Very poor efficiency
  ELSE
    -- Linear interpolation: (6 - mpg) * 15
    v_fuel_efficiency_penalty := (6 - v_fuel_economy) * 15;
  END IF;

  -- Calculate final score (constrain to 0-100 range)
  v_safety_score := GREATEST(0, LEAST(100,
    v_safety_score
    - v_speeding_penalty
    - v_damage_penalty
    - v_late_penalty
    - v_fuel_efficiency_penalty
  ));

  RETURN ROUND(v_safety_score, 1);
END;
$$;

-- Trigger function to automatically calculate safety score on job completion
CREATE OR REPLACE FUNCTION trigger_calculate_safety_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only calculate if job is being completed (not already completed)
  IF NEW.completed_at IS NOT NULL AND (OLD.completed_at IS NULL OR OLD.completed_at != NEW.completed_at) THEN
    -- Calculate and set safety score
    NEW.safety_score := calculate_safety_score(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS calculate_safety_score_on_complete ON jobs;

-- Create trigger to run before job update
CREATE TRIGGER calculate_safety_score_on_complete
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_safety_score();

-- Add helpful comment
COMMENT ON COLUMN jobs.safety_score IS 'Driver safety score (0-100): Safety (40pts), Compliance (30pts), Efficiency (30pts)';
COMMENT ON FUNCTION calculate_safety_score IS 'Calculates driver safety score based on speeding, damage, late delivery, and fuel economy';
COMMENT ON FUNCTION trigger_calculate_safety_score IS 'Trigger function that automatically calculates safety score when job is completed';
