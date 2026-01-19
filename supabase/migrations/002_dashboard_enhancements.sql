-- Add new telemetry columns for dashboard enhancements
ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS cruise_control_speed DOUBLE PRECISION;
ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS cruise_control_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS parking_brake BOOLEAN DEFAULT FALSE;
ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS motor_brake BOOLEAN DEFAULT FALSE;
ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS retarder_level INTEGER DEFAULT 0;
ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS air_pressure DOUBLE PRECISION;
ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS brake_temperature DOUBLE PRECISION;
ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS navigation_distance DOUBLE PRECISION;
ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS navigation_time DOUBLE PRECISION;
ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS speed_limit DOUBLE PRECISION;

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_telemetry_cruise_control ON telemetry(cruise_control_enabled);
CREATE INDEX IF NOT EXISTS idx_telemetry_navigation ON telemetry(navigation_distance, navigation_time);
