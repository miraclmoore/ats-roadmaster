/**
 * Calculate miles per gallon (MPG)
 */
export function calculateMPG(distance: number, fuelConsumed: number): number {
  if (fuelConsumed === 0) return 0;
  return distance / fuelConsumed;
}

/**
 * Calculate fuel range based on current fuel and average MPG
 */
export function calculateFuelRange(fuelCurrent: number, avgMPG: number): number {
  return fuelCurrent * avgMPG;
}

/**
 * Calculate fuel efficiency percentage compared to user average
 */
export function calculateFuelEfficiencyPercentage(
  currentMPG: number,
  avgMPG: number
): number {
  if (avgMPG === 0) return 0;
  return ((currentMPG - avgMPG) / avgMPG) * 100;
}

/**
 * Calculate estimated fuel cost for remaining distance
 */
export function calculateEstimatedFuelCost(
  remainingDistance: number,
  avgMPG: number,
  pricePerGallon: number
): number {
  if (avgMPG === 0) return 0;
  const fuelNeeded = remainingDistance / avgMPG;
  return fuelNeeded * pricePerGallon;
}

/**
 * Calculate average speed for a job
 */
export function calculateAverageSpeed(distance: number, timeInHours: number): number {
  if (timeInHours === 0) return 0;
  return distance / timeInHours;
}

/**
 * Calculate time efficiency (actual time vs estimated time)
 */
export function calculateTimeEfficiency(
  actualTimeHours: number,
  estimatedTimeHours: number
): number {
  if (estimatedTimeHours === 0) return 100;
  return (estimatedTimeHours / actualTimeHours) * 100;
}
