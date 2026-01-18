-- RoadMaster Pro - Initial Database Schema
-- This migration creates all tables, RLS policies, and triggers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- JOBS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Job Details (from SDK)
  source_city TEXT NOT NULL,
  source_company TEXT,
  destination_city TEXT NOT NULL,
  destination_company TEXT,
  cargo_type TEXT NOT NULL,
  cargo_weight INTEGER,

  -- Financial (from SDK)
  income INTEGER NOT NULL,
  distance INTEGER NOT NULL,

  -- Timing (from SDK)
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  delivered_late BOOLEAN DEFAULT FALSE,

  -- Performance (calculated from telemetry)
  fuel_consumed DECIMAL,
  damage_taken DECIMAL,
  avg_speed DECIMAL,
  avg_rpm DECIMAL,

  -- Calculated Fields
  fuel_cost DECIMAL,
  damage_cost DECIMAL,
  profit DECIMAL,
  profit_per_mile DECIMAL,
  fuel_economy DECIMAL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for jobs table
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_completed_at ON public.jobs(completed_at);
CREATE INDEX IF NOT EXISTS idx_jobs_route ON public.jobs(source_city, destination_city);

-- RLS for jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY jobs_user_policy ON public.jobs
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- TELEMETRY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,

  -- Truck State
  speed DECIMAL,
  rpm INTEGER,
  gear INTEGER,
  fuel_current DECIMAL,
  fuel_capacity DECIMAL,

  -- Damage (0.0 to 1.0 scale)
  engine_damage DECIMAL,
  transmission_damage DECIMAL,
  chassis_damage DECIMAL,
  wheels_damage DECIMAL,
  cabin_damage DECIMAL,
  cargo_damage DECIMAL,

  -- Position
  position_x DECIMAL,
  position_y DECIMAL,
  position_z DECIMAL,

  -- Time
  game_time TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for telemetry table
CREATE INDEX IF NOT EXISTS idx_telemetry_user_job ON public.telemetry(user_id, job_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON public.telemetry(created_at);
CREATE INDEX IF NOT EXISTS idx_telemetry_user_created ON public.telemetry(user_id, created_at DESC);

-- RLS for telemetry
ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY telemetry_user_policy ON public.telemetry
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- ACHIEVEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  icon_url TEXT,
  requirement_value DECIMAL,
  requirement_type TEXT
);

-- Seed some achievements
INSERT INTO public.achievements (code, name, description, category, requirement_value, requirement_type) VALUES
  ('first_job', 'First Delivery', 'Complete your first job', 'career', 1, 'jobs_completed'),
  ('hundred_jobs', 'Century Driver', 'Complete 100 jobs', 'career', 100, 'jobs_completed'),
  ('thousand_miles', 'Road Warrior', 'Drive 1,000 miles', 'distance', 1000, 'total_distance'),
  ('profitable_hauler', 'Profitable Hauler', 'Earn $10,000 in profit', 'financial', 10000, 'total_profit'),
  ('fuel_efficient', 'Fuel Master', 'Achieve 8 MPG average', 'efficiency', 8, 'avg_fuel_economy'),
  ('perfect_delivery', 'Perfect Record', 'Complete 10 on-time deliveries in a row', 'performance', 10, 'on_time_streak'),
  ('no_damage', 'Careful Driver', 'Complete a job with 0% damage', 'performance', 0, 'damage_taken')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- USER ACHIEVEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress DECIMAL DEFAULT 0,

  UNIQUE(user_id, achievement_id)
);

-- RLS for user achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_achievements_policy ON public.user_achievements
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- COMPANY STATS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.company_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,

  jobs_completed INTEGER DEFAULT 0,
  jobs_on_time INTEGER DEFAULT 0,
  total_damage DECIMAL DEFAULT 0,
  avg_damage DECIMAL DEFAULT 0,
  rating DECIMAL DEFAULT 0,

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, company_name)
);

-- RLS for company stats
ALTER TABLE public.company_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_stats_policy ON public.company_stats
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- USER PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Alert thresholds
  fuel_alert_threshold INTEGER DEFAULT 30,
  rest_alert_minutes INTEGER DEFAULT 60,
  maintenance_alert_threshold INTEGER DEFAULT 15,

  -- Display preferences
  units TEXT DEFAULT 'imperial',
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'America/Los_Angeles',

  -- API Key for SDK plugin
  api_key TEXT UNIQUE,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for user preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_preferences_policy ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'rm_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to create user preferences on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id, api_key)
  VALUES (NEW.id, generate_api_key());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create preferences for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update job profit calculations
CREATE OR REPLACE FUNCTION calculate_job_profit()
RETURNS TRIGGER AS $$
DECLARE
  fuel_price CONSTANT DECIMAL := 4.05; -- Average diesel price per gallon
  damage_repair_cost CONSTANT DECIMAL := 10000; -- Max repair cost at 100% damage
BEGIN
  -- Only calculate if job is completed
  IF NEW.completed_at IS NOT NULL THEN
    -- Calculate fuel cost
    IF NEW.fuel_consumed IS NOT NULL THEN
      NEW.fuel_cost := NEW.fuel_consumed * fuel_price;
    END IF;

    -- Calculate damage cost (linear scale)
    IF NEW.damage_taken IS NOT NULL THEN
      NEW.damage_cost := (NEW.damage_taken / 100.0) * damage_repair_cost;
    END IF;

    -- Calculate profit
    NEW.profit := NEW.income - COALESCE(NEW.fuel_cost, 0) - COALESCE(NEW.damage_cost, 0);

    -- Calculate profit per mile
    IF NEW.distance > 0 THEN
      NEW.profit_per_mile := NEW.profit / NEW.distance;
    END IF;

    -- Calculate fuel economy
    IF NEW.fuel_consumed IS NOT NULL AND NEW.fuel_consumed > 0 THEN
      NEW.fuel_economy := NEW.distance / NEW.fuel_consumed;
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate job metrics
DROP TRIGGER IF EXISTS trigger_calculate_job_profit ON public.jobs;
CREATE TRIGGER trigger_calculate_job_profit
  BEFORE INSERT OR UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION calculate_job_profit();

-- Function to update company stats when job completes
CREATE OR REPLACE FUNCTION update_company_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update when job is completed
  IF NEW.completed_at IS NOT NULL AND (OLD.completed_at IS NULL OR OLD IS NULL) THEN
    -- Update or insert company stats for destination company
    IF NEW.destination_company IS NOT NULL THEN
      INSERT INTO public.company_stats (
        user_id,
        company_name,
        jobs_completed,
        jobs_on_time,
        total_damage,
        avg_damage
      ) VALUES (
        NEW.user_id,
        NEW.destination_company,
        1,
        CASE WHEN NEW.delivered_late = FALSE THEN 1 ELSE 0 END,
        COALESCE(NEW.damage_taken, 0),
        COALESCE(NEW.damage_taken, 0)
      )
      ON CONFLICT (user_id, company_name) DO UPDATE SET
        jobs_completed = company_stats.jobs_completed + 1,
        jobs_on_time = company_stats.jobs_on_time + CASE WHEN NEW.delivered_late = FALSE THEN 1 ELSE 0 END,
        total_damage = company_stats.total_damage + COALESCE(NEW.damage_taken, 0),
        avg_damage = (company_stats.total_damage + COALESCE(NEW.damage_taken, 0)) / (company_stats.jobs_completed + 1),
        updated_at = NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update company stats
DROP TRIGGER IF EXISTS trigger_update_company_stats ON public.jobs;
CREATE TRIGGER trigger_update_company_stats
  AFTER INSERT OR UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION update_company_stats();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- COMPLETED
-- ============================================================================
-- Migration complete! All tables, indexes, RLS policies, and triggers created.
