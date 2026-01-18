// Estimated fuel price per gallon (update monthly)
export const ESTIMATED_FUEL_PRICE_PER_GALLON = 4.05;

// Estimated repair cost formula (linear scaling)
// Average repair cost: $10,000 for 100% damage
export const MAX_REPAIR_COST = 10000;

export interface Job {
  income: number;
  distance: number;
  fuel_consumed?: number | null;
  damage_taken?: number | null;
  delivered_late?: boolean;
}

export interface UserAverage {
  avgMPG: number;
  avgDamage: number;
  avgSpeed: number;
}

/**
 * Calculate fuel cost based on consumption
 */
export function calculateFuelCost(fuelConsumed: number): number {
  return fuelConsumed * ESTIMATED_FUEL_PRICE_PER_GALLON;
}

/**
 * Calculate damage cost based on damage percentage
 * Uses linear scaling: 100% damage = $10,000 repair
 */
export function calculateDamageCost(damagePercent: number): number {
  return (damagePercent / 100) * MAX_REPAIR_COST;
}

/**
 * Calculate net profit for a job
 */
export function calculateJobProfit(job: Job): number {
  const fuelCost = job.fuel_consumed ? calculateFuelCost(job.fuel_consumed) : 0;
  const damageCost = job.damage_taken ? calculateDamageCost(job.damage_taken) : 0;
  const profit = job.income - fuelCost - damageCost;
  return profit;
}

/**
 * Calculate profit per mile
 */
export function calculateProfitPerMile(profit: number, distance: number): number {
  if (distance === 0) return 0;
  return profit / distance;
}

/**
 * Calculate total operating expenses for a job
 */
export function calculateTotalExpenses(job: Job): {
  fuelCost: number;
  damageCost: number;
  total: number;
} {
  const fuelCost = job.fuel_consumed ? calculateFuelCost(job.fuel_consumed) : 0;
  const damageCost = job.damage_taken ? calculateDamageCost(job.damage_taken) : 0;

  return {
    fuelCost,
    damageCost,
    total: fuelCost + damageCost,
  };
}

/**
 * Calculate profit margin as percentage
 */
export function calculateProfitMargin(profit: number, revenue: number): number {
  if (revenue === 0) return 0;
  return (profit / revenue) * 100;
}
