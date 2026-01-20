import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client from environment variables
// Reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
const redis = Redis.fromEnv();

/**
 * Rate limiter for telemetry endpoints
 *
 * SDK sends telemetry at 1Hz (3600 samples/hour)
 * We allow 7200/hour (2x buffer) to handle:
 * - Network retries
 * - Clock drift between game and server
 * - Multiple samples during state changes
 *
 * Uses sliding window algorithm to prevent boundary exploitation
 * (e.g., 3600 requests at 00:59, another 3600 at 01:00)
 */
export const telemetryLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(7200, "1 h"),
  analytics: true,
  prefix: "ratelimit:telemetry",
});

/**
 * Rate limiter for mutation endpoints
 *
 * Covers job start, job complete, job cancel operations
 * Typical 8-hour session: ~20 jobs (2.5 jobs/hour)
 * We allow 100/hour (40x buffer) for:
 * - Rapid job cycling (short hauls)
 * - Multiple quick pickups during testing
 * - Generous headroom for legitimate gameplay
 */
export const mutationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 h"),
  analytics: true,
  prefix: "ratelimit:mutation",
});

/**
 * Rate limiter for authenticated operations
 *
 * Covers settings changes, API key regeneration, profile updates
 * These are rare operations (typically changed once per month)
 * We allow 20/15min to:
 * - Prevent brute force API key regeneration
 * - Allow legitimate configuration experimentation
 * - Block automated abuse attempts
 */
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "15 m"),
  analytics: true,
  prefix: "ratelimit:auth",
});
