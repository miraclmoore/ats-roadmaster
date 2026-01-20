import { z } from "zod";

export const telemetrySchema = z.object({
  // Auth (one required)
  user_id: z.string().uuid().optional(),
  api_key: z.string().regex(/^rm_[a-f0-9]{64}$/).optional(),

  // Truck state - realistic game limits
  speed: z.number().min(0).max(150), // mph, max governed truck speed ~80-90 but allow buffer
  rpm: z.number().int().min(0).max(3000), // typical truck redline ~2000-2500
  gear: z.number().int().min(-6).max(18), // reverse gears + forward gears
  fuel_current: z.number().min(0), // gallons, no upper limit (depends on tank size)
  fuel_capacity: z.number().positive(), // must be > 0

  // Damage (0.0-1.0 range from SDK)
  engine_damage: z.number().min(0).max(1),
  transmission_damage: z.number().min(0).max(1),
  chassis_damage: z.number().min(0).max(1),
  wheels_damage: z.number().min(0).max(1),
  cabin_damage: z.number().min(0).max(1),
  cargo_damage: z.number().min(0).max(1),

  // Position (no constraints - game world is arbitrary coordinates)
  position_x: z.number(),
  position_y: z.number(),
  position_z: z.number(),

  // Time
  game_time: z.string().datetime().optional(), // ISO 8601 format

  // Optional enhanced telemetry
  job_id: z.string().uuid().optional(),
  cruise_control_speed: z.number().min(0).max(150).optional(),
  cruise_control_enabled: z.boolean().optional(),
  parking_brake: z.boolean().optional(),
  motor_brake: z.boolean().optional(),
  retarder_level: z.number().int().min(0).max(5).optional(), // typical 0-5 levels
  air_pressure: z.number().min(0).max(200).optional(), // PSI, typical 90-150
  brake_temperature: z.number().min(0).max(1000).optional(), // degrees, allow headroom
  navigation_distance: z.number().min(0).optional(), // miles
  navigation_time: z.number().min(0).optional(), // minutes
  speed_limit: z.number().min(0).max(150).optional(), // mph
}).refine((data) => data.user_id || data.api_key, {
  message: "Either user_id or api_key must be provided",
});

export type TelemetryInput = z.infer<typeof telemetrySchema>;
