import { z } from "zod";

export const jobStartSchema = z.object({
  // Auth
  user_id: z.string().uuid().optional(),
  api_key: z.string().regex(/^rm_[a-f0-9]{64}$/).optional(),

  // Job details from SDK
  source_city: z.string().min(1).max(100),
  source_company: z.string().min(1).max(100).optional(),
  destination_city: z.string().min(1).max(100),
  destination_company: z.string().min(1).max(100).optional(),
  cargo_type: z.string().min(1).max(100),
  cargo_weight: z.number().int().min(0).max(100000).optional(), // lbs, max realistic trailer load

  // Financial
  income: z.number().int().min(0).max(1000000), // $ per job, typical $1k-$10k
  distance: z.number().int().min(1).max(10000), // miles, max cross-map distance

  // Timing
  deadline: z.string().datetime().optional(), // ISO 8601
}).refine((data) => data.user_id || data.api_key, {
  message: "Either user_id or api_key must be provided",
});

export type JobStartInput = z.infer<typeof jobStartSchema>;
