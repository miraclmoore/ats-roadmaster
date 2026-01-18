-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Jobs Table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,

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

CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_completed_at ON jobs(completed_at);
CREATE INDEX idx_jobs_route ON jobs(source_city, destination_city);

-- Telemetry Snapshots
CREATE TABLE telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  job_id UUID REFERENCES jobs,

  -- Truck State
  speed DECIMAL,
  rpm INTEGER,
  gear INTEGER,
  fuel_current DECIMAL,
  fuel_capacity DECIMAL,

  -- Damage
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

CREATE INDEX idx_telemetry_user_job ON telemetry(user_id, job_id);
CREATE INDEX idx_telemetry_created_at ON telemetry(created_at);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  icon_url TEXT,
  requirement_value DECIMAL,
  requirement_type TEXT
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  achievement_id UUID REFERENCES achievements NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress DECIMAL DEFAULT 0,

  UNIQUE(user_id, achievement_id)
);

-- Company Stats
CREATE TABLE company_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  company_name TEXT NOT NULL,

  jobs_completed INTEGER DEFAULT 0,
  jobs_on_time INTEGER DEFAULT 0,
  total_damage DECIMAL DEFAULT 0,
  avg_damage DECIMAL DEFAULT 0,
  rating DECIMAL DEFAULT 0,

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, company_name)
);

-- User Preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users,

  fuel_alert_threshold INTEGER DEFAULT 30,
  rest_alert_minutes INTEGER DEFAULT 60,
  maintenance_alert_threshold INTEGER DEFAULT 15,

  units TEXT DEFAULT 'imperial',
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'America/Los_Angeles',

  api_key TEXT UNIQUE,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY jobs_user_policy ON jobs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY telemetry_user_policy ON telemetry
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_achievements_policy ON user_achievements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY company_stats_policy ON company_stats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_preferences_policy ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Allow read access to achievements table for all authenticated users
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY achievements_read_policy ON achievements
  FOR SELECT USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_stats_updated_at BEFORE UPDATE ON company_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
