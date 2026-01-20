import { z } from "zod";

export const jobCompleteSchema = z.object({
  // Auth
  user_id: z.string().uuid().optional(),
  api_key: z.string().regex(/^rm_[a-f0-9]{64}$/).optional(),

  // Job reference
  job_id: z.string().uuid(),

  // Completion data from SDK
  cargo_damage: z.number().min(0).max(1),
  delivered_late: z.boolean(),

  // Performance metrics (calculated from telemetry)
  fuel_consumed: z.number().min(0).optional(),
  damage_taken: z.number().min(0).max(1).optional(),
  avg_speed: z.number().min(0).max(150).optional(),
  avg_rpm: z.number().int().min(0).max(3000).optional(),
}).refine((data) => data.user_id || data.api_key, {
  message: "Either user_id or api_key must be provided",
});

export type JobCompleteInput = z.infer<typeof jobCompleteSchema>;
