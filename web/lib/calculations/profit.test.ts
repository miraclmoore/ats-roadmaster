import { describe, test, expect } from 'vitest'
import {
  calculateFuelCost,
  calculateDamageCost,
  calculateJobProfit,
  calculateProfitPerMile,
  calculateTotalExpenses,
  calculateProfitMargin,
  ESTIMATED_FUEL_PRICE_PER_GALLON,
  MAX_REPAIR_COST,
  type Job
} from './profit'

describe('calculateFuelCost', () => {
  test('calculates fuel cost for normal consumption', () => {
    // Arrange: 50 gallons at $4.05/gallon
    const fuelConsumed = 50

    // Act
    const result = calculateFuelCost(fuelConsumed)

    // Assert
    expect(result).toBeCloseTo(202.50, 2)
  })

  test('returns zero for zero fuel consumed', () => {
    expect(calculateFuelCost(0)).toBe(0)
  })

  test('calculates fuel cost for large consumption', () => {
    // Arrange: 500 gallons
    const fuelConsumed = 500

    // Act
    const result = calculateFuelCost(fuelConsumed)

    // Assert
    expect(result).toBeCloseTo(2025.00, 2)
  })
})

describe('calculateDamageCost', () => {
  test('calculates damage cost for 5% damage', () => {
    // Arrange: 5% damage -> 5/100 * 10000 = $500
    const damagePercent = 5

    // Act
    const result = calculateDamageCost(damagePercent)

    // Assert
    expect(result).toBeCloseTo(500, 2)
  })

  test('returns zero for no damage', () => {
    expect(calculateDamageCost(0)).toBe(0)
  })

  test('calculates max damage cost for 100% damage', () => {
    // Arrange: 100% damage = $10,000
    const damagePercent = 100

    // Act
    const result = calculateDamageCost(damagePercent)

    // Assert
    expect(result).toBeCloseTo(MAX_REPAIR_COST, 2)
  })

  test('calculates damage cost for 50% damage', () => {
    // Arrange: 50% damage -> 50/100 * 10000 = $5000
    const damagePercent = 50

    // Act
    const result = calculateDamageCost(damagePercent)

    // Assert
    expect(result).toBeCloseTo(5000, 2)
  })
})

describe('calculateJobProfit', () => {
  test('calculates profit for normal job with fuel and damage', () => {
    // Arrange: Income $5000, fuel 50gal ($202.50), damage 5% ($500)
    const job: Job = {
      income: 5000,
      distance: 400,
      fuel_consumed: 50,
      damage_taken: 5
    }

    // Act
    const result = calculateJobProfit(job)

    // Assert: 5000 - 202.50 - 500 = 4297.50
    expect(result).toBeCloseTo(4297.50, 2)
  })

  test('calculates profit for perfect job with no fuel or damage', () => {
    // Arrange: Income $3000, no fuel, no damage
    const job: Job = {
      income: 3000,
      distance: 200,
      fuel_consumed: 0,
      damage_taken: 0
    }

    // Act
    const result = calculateJobProfit(job)

    // Assert: Profit equals income
    expect(result).toBe(3000)
  })

  test('handles null fuel_consumed and damage_taken as zero', () => {
    // Arrange: Income $4000, null fuel and damage
    const job: Job = {
      income: 4000,
      distance: 300,
      fuel_consumed: null,
      damage_taken: null
    }

    // Act
    const result = calculateJobProfit(job)

    // Assert: Profit equals income (no expenses)
    expect(result).toBe(4000)
  })

  test('calculates negative profit for high damage job', () => {
    // Arrange: Income $3000, fuel 30gal ($121.50), damage 50% ($5000)
    const job: Job = {
      income: 3000,
      distance: 200,
      fuel_consumed: 30,
      damage_taken: 50
    }

    // Act
    const result = calculateJobProfit(job)

    // Assert: 3000 - 121.50 - 5000 = -2121.50 (loss)
    expect(result).toBeCloseTo(-2121.50, 2)
  })

  test('handles zero income edge case', () => {
    // Arrange: Zero income (shouldn't happen in game, but test edge case)
    const job: Job = {
      income: 0,
      distance: 100,
      fuel_consumed: 10,
      damage_taken: 2
    }

    // Act
    const result = calculateJobProfit(job)

    // Assert: Negative profit (fuel + damage costs)
    expect(result).toBeLessThan(0)
  })
})

describe('calculateProfitPerMile', () => {
  test('calculates profit per mile for positive profit', () => {
    // Arrange: $500 profit over 100 miles
    const profit = 500
    const distance = 100

    // Act
    const result = calculateProfitPerMile(profit, distance)

    // Assert: $5 per mile
    expect(result).toBeCloseTo(5.00, 2)
  })

  test('returns zero for zero distance', () => {
    // Arrange: Avoid division by zero
    const profit = 500
    const distance = 0

    // Act
    const result = calculateProfitPerMile(profit, distance)

    // Assert: Should return 0, not Infinity
    expect(result).toBe(0)
  })

  test('calculates negative profit per mile', () => {
    // Arrange: -$200 profit over 100 miles
    const profit = -200
    const distance = 100

    // Act
    const result = calculateProfitPerMile(profit, distance)

    // Assert: -$2 per mile
    expect(result).toBeCloseTo(-2.00, 2)
  })
})

describe('calculateTotalExpenses', () => {
  test('returns breakdown of expenses', () => {
    // Arrange: Job with fuel and damage
    const job: Job = {
      income: 5000,
      distance: 400,
      fuel_consumed: 50,
      damage_taken: 5
    }

    // Act
    const result = calculateTotalExpenses(job)

    // Assert: Verify structure and values
    expect(result).toHaveProperty('fuelCost')
    expect(result).toHaveProperty('damageCost')
    expect(result).toHaveProperty('total')
    expect(result.fuelCost).toBeCloseTo(202.50, 2)
    expect(result.damageCost).toBeCloseTo(500, 2)
    expect(result.total).toBeCloseTo(702.50, 2)
  })

  test('returns zero expenses for perfect job', () => {
    // Arrange: No fuel or damage
    const job: Job = {
      income: 3000,
      distance: 200,
      fuel_consumed: null,
      damage_taken: null
    }

    // Act
    const result = calculateTotalExpenses(job)

    // Assert
    expect(result.fuelCost).toBe(0)
    expect(result.damageCost).toBe(0)
    expect(result.total).toBe(0)
  })

  test('expense breakdown matches individual calculations', () => {
    // Arrange
    const job: Job = {
      income: 4000,
      distance: 300,
      fuel_consumed: 40,
      damage_taken: 10
    }

    // Act
    const expenses = calculateTotalExpenses(job)
    const expectedFuelCost = calculateFuelCost(40)
    const expectedDamageCost = calculateDamageCost(10)

    // Assert: Breakdown matches individual calculations
    expect(expenses.fuelCost).toBeCloseTo(expectedFuelCost, 2)
    expect(expenses.damageCost).toBeCloseTo(expectedDamageCost, 2)
    expect(expenses.total).toBeCloseTo(expectedFuelCost + expectedDamageCost, 2)
  })
})

describe('calculateProfitMargin', () => {
  test('calculates 20% profit margin', () => {
    // Arrange: $1000 profit on $5000 revenue
    const profit = 1000
    const revenue = 5000

    // Act
    const result = calculateProfitMargin(profit, revenue)

    // Assert: 20% margin
    expect(result).toBeCloseTo(20, 2)
  })

  test('returns zero for zero revenue', () => {
    // Arrange: Avoid division by zero
    const profit = 500
    const revenue = 0

    // Act
    const result = calculateProfitMargin(profit, revenue)

    // Assert: Should return 0, not Infinity
    expect(result).toBe(0)
  })

  test('calculates 100% profit margin with no expenses', () => {
    // Arrange: Revenue equals profit (no expenses)
    const profit = 5000
    const revenue = 5000

    // Act
    const result = calculateProfitMargin(profit, revenue)

    // Assert: 100% margin
    expect(result).toBeCloseTo(100, 2)
  })

  test('calculates negative profit margin for loss', () => {
    // Arrange: -$500 profit on $3000 revenue
    const profit = -500
    const revenue = 3000

    // Act
    const result = calculateProfitMargin(profit, revenue)

    // Assert: Negative margin
    expect(result).toBeCloseTo(-16.67, 2)
  })
})
