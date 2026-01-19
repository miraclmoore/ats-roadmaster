# Apply Dashboard Enhancements Migration

This migration adds new telemetry fields for the enhanced dashboard UI.

## Option 1: Using Supabase CLI (Recommended)

```bash
# Navigate to project root
cd e:\dev\ats-roadmaster

# Apply the migration
supabase db push
```

## Option 2: Manual SQL in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `migrations/002_dashboard_enhancements.sql`
4. Click **Run**

## New Fields Added

The following fields have been added to the `telemetry` table:

### Cruise Control & Navigation
- `cruise_control_speed` - Current cruise control speed (mph)
- `cruise_control_enabled` - Whether cruise control is active
- `navigation_distance` - Distance to destination (meters)
- `navigation_time` - Time to destination (minutes)
- `speed_limit` - Current road speed limit (mph)

### Brake & Assist Systems
- `parking_brake` - Parking brake engaged
- `motor_brake` - Motor/engine brake active
- `retarder_level` - Retarder level (0-5)
- `air_pressure` - Air brake pressure (PSI)
- `brake_temperature` - Brake temperature (°C)

## Verification

After applying the migration, verify the changes:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'telemetry' 
ORDER BY ordinal_position;
```

You should see the 10 new columns listed.
