import { z } from "zod";

export const preferencesSchema = z.object({
  fuel_alert_threshold: z.number().int().min(0).max(100).optional(),
  rest_alert_minutes: z.number().int().min(0).max(480).optional(), // max 8 hours
  maintenance_alert_threshold: z.number().int().min(0).max(100).optional(),

  units: z.enum(['imperial', 'metric']).optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).optional(),
  timezone: z.string().max(100).optional(), // IANA timezone identifier
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;
