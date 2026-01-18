import type { Job, UserAverage } from './profit';

/**
 * Calculate overall performance score for a job (0-100)
 *
 * Scoring breakdown:
 * - Fuel efficiency: 30 points
 * - Damage avoidance: 30 points
 * - On-time delivery: 20 points
 * - Speed efficiency: 20 points
 */
export function calculatePerformanceScore(
  job: Job & { avg_speed?: number | null; avg_rpm?: number | null },
  userAvg: UserAverage
): number {
  let score = 100;

  // Fuel efficiency (30 points)
  if (job.fuel_consumed && job.distance) {
    const jobMPG = job.distance / job.fuel_consumed;
    const mpgDiff = (jobMPG - userAvg.avgMPG) / userAvg.avgMPG;
    score += mpgDiff * 30;
  }

  // Damage avoidance (30 points)
  if (job.damage_taken !== null && job.damage_taken !== undefined) {
    const damageDiff = (userAvg.avgDamage - job.damage_taken) / userAvg.avgDamage;
    score += damageDiff * 30;
  }

  // On-time delivery (20 points)
  if (job.delivered_late !== undefined) {
    if (!job.delivered_late) {
      score += 20;
    } else {
      score -= 20;
    }
  }

  // Speed efficiency (20 points)
  // Penalize if too slow (>10% below avg) or too fast (>10% above avg)
  if (job.avg_speed && userAvg.avgSpeed) {
    const speedDiff = (job.avg_speed - userAvg.avgSpeed) / userAvg.avgSpeed;
    if (speedDiff < -0.1) {
      // Too slow
      score -= 10;
    } else if (speedDiff > 0.1) {
      // Too fast (wastes fuel, increases damage risk)
      score -= 10;
    }
  }

  // Clamp score between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Get performance rating text based on score
 */
export function getPerformanceRating(score: number): {
  rating: string;
  color: string;
  emoji: string;
} {
  if (score >= 90) {
    return { rating: 'Excellent', color: 'green', emoji: '⭐⭐⭐' };
  } else if (score >= 80) {
    return { rating: 'Great', color: 'blue', emoji: '⭐⭐' };
  } else if (score >= 70) {
    return { rating: 'Good', color: 'teal', emoji: '⭐' };
  } else if (score >= 60) {
    return { rating: 'Fair', color: 'yellow', emoji: '👍' };
  } else {
    return { rating: 'Needs Improvement', color: 'red', emoji: '⚠️' };
  }
}

/**
 * Calculate improvement opportunities based on job performance
 */
export function calculateImprovementOpportunities(
  job: Job & { avg_speed?: number | null; avg_rpm?: number | null },
  userAvg: UserAverage
): {
  category: string;
  currentValue: number;
  optimalValue: number;
  potentialSavings: number;
  tip: string;
}[] {
  const opportunities: {
    category: string;
    currentValue: number;
    optimalValue: number;
    potentialSavings: number;
    tip: string;
  }[] = [];

  // Fuel economy opportunity
  if (job.fuel_consumed && job.distance) {
    const jobMPG = job.distance / job.fuel_consumed;
    if (jobMPG < userAvg.avgMPG) {
      const potentialSavings = (job.fuel_consumed - job.distance / userAvg.avgMPG) * 4.05;
      opportunities.push({
        category: 'Fuel Economy',
        currentValue: jobMPG,
        optimalValue: userAvg.avgMPG,
        potentialSavings,
        tip: 'Improve MPG by maintaining steady speed and shifting at lower RPM',
      });
    }
  }

  // Damage opportunity
  if (job.damage_taken && job.damage_taken > userAvg.avgDamage) {
    const excessDamage = job.damage_taken - userAvg.avgDamage;
    const potentialSavings = (excessDamage / 100) * 10000;
    opportunities.push({
      category: 'Damage Control',
      currentValue: job.damage_taken,
      optimalValue: userAvg.avgDamage,
      potentialSavings,
      tip: 'Reduce speed on rough roads and avoid harsh braking',
    });
  }

  // Speed optimization
  if (job.avg_speed && userAvg.avgSpeed) {
    if (job.avg_speed > userAvg.avgSpeed * 1.1) {
      opportunities.push({
        category: 'Speed Management',
        currentValue: job.avg_speed,
        optimalValue: userAvg.avgSpeed,
        potentialSavings: 50, // Estimated based on fuel waste
        tip: 'Reduce speed to save fuel and reduce damage risk',
      });
    }
  }

  return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
}
