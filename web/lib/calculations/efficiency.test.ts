import { describe, test, expect } from 'vitest'
import {
  calculateMPG,
  calculateFuelRange,
  calculateFuelEfficiencyPercentage,
  calculateEstimatedFuelCost,
  calculateAverageSpeed,
  calculateTimeEfficiency
} from './efficiency'

describe('calculateMPG', () => {
  test('calculates MPG for normal trip', () => {
    // Arrange: 400 miles / 50 gallons
    const distance = 400
    const fuelConsumed = 50

    // Act
    const result = calculateMPG(distance, fuelConsumed)

    // Assert: 8 MPG
    expect(result).toBeCloseTo(8, 2)
  })

  test('returns zero for zero fuel consumed', () => {
    // Arrange: Avoid division by zero
    const distance = 400
    const fuelConsumed = 0

    // Act
    const result = calculateMPG(distance, fuelConsumed)

    // Assert: Should return 0, not Infinity
    expect(result).toBe(0)
  })

  test('calculates high efficiency MPG', () => {
    // Arrange: 500 miles / 25 gallons
    const distance = 500
    const fuelConsumed = 25

    // Act
    const result = calculateMPG(distance, fuelConsumed)

    // Assert: 20 MPG
    expect(result).toBeCloseTo(20, 2)
  })

  test('calculates MPG for short trip', () => {
    // Arrange: 50 miles / 10 gallons
    const distance = 50
    const fuelConsumed = 10

    // Act
    const result = calculateMPG(distance, fuelConsumed)

    // Assert: 5 MPG
    expect(result).toBeCloseTo(5, 2)
  })
})

describe('calculateFuelRange', () => {
  test('calculates fuel range for normal scenario', () => {
    // Arrange: 60 gallons * 4.75 MPG
    const fuelCurrent = 60
    const avgMPG = 4.75

    // Act
    const result = calculateFuelRange(fuelCurrent, avgMPG)

    // Assert: 285 miles
    expect(result).toBeCloseTo(285, 2)
  })

  test('returns zero for zero fuel', () => {
    // Arrange: No fuel remaining
    const fuelCurrent = 0
    const avgMPG = 8

    // Act
    const result = calculateFuelRange(fuelCurrent, avgMPG)

    // Assert: 0 miles range
    expect(result).toBe(0)
  })

  test('returns zero for zero MPG', () => {
    // Arrange: Zero MPG (shouldn't happen, but test edge case)
    const fuelCurrent = 50
    const avgMPG = 0

    // Act
    const result = calculateFuelRange(fuelCurrent, avgMPG)

    // Assert: 0 miles range
    expect(result).toBe(0)
  })

  test('calculates range for high efficiency', () => {
    // Arrange: 100 gallons * 10 MPG
    const fuelCurrent = 100
    const avgMPG = 10

    // Act
    const result = calculateFuelRange(fuelCurrent, avgMPG)

    // Assert: 1000 miles
    expect(result).toBeCloseTo(1000, 2)
  })
})

describe('calculateFuelEfficiencyPercentage', () => {
  test('calculates positive percentage for better than average', () => {
    // Arrange: Current 10 MPG, average 8 MPG
    const currentMPG = 10
    const avgMPG = 8

    // Act
    const result = calculateFuelEfficiencyPercentage(currentMPG, avgMPG)

    // Assert: +25% better than average
    expect(result).toBeCloseTo(25, 2)
  })

  test('calculates negative percentage for worse than average', () => {
    // Arrange: Current 6 MPG, average 8 MPG
    const currentMPG = 6
    const avgMPG = 8

    // Act
    const result = calculateFuelEfficiencyPercentage(currentMPG, avgMPG)

    // Assert: -25% worse than average
    expect(result).toBeCloseTo(-25, 2)
  })

  test('returns zero for zero average MPG', () => {
    // Arrange: Avoid division by zero
    const currentMPG = 8
    const avgMPG = 0

    // Act
    const result = calculateFuelEfficiencyPercentage(currentMPG, avgMPG)

    // Assert: Should return 0
    expect(result).toBe(0)
  })

  test('returns zero when current equals average', () => {
    // Arrange: Current equals average
    const currentMPG = 8
    const avgMPG = 8

    // Act
    const result = calculateFuelEfficiencyPercentage(currentMPG, avgMPG)

    // Assert: 0% difference
    expect(result).toBeCloseTo(0, 2)
  })
})

describe('calculateEstimatedFuelCost', () => {
  test('calculates estimated cost for remaining distance', () => {
    // Arrange: 200 miles, 8 MPG, $4.05/gallon
    const remainingDistance = 200
    const avgMPG = 8
    const pricePerGallon = 4.05

    // Act
    const result = calculateEstimatedFuelCost(remainingDistance, avgMPG, pricePerGallon)

    // Assert: 200/8 = 25 gallons * $4.05 = $101.25
    expect(result).toBeCloseTo(101.25, 2)
  })

  test('returns zero for zero MPG', () => {
    // Arrange: Avoid division by zero
    const remainingDistance = 200
    const avgMPG = 0
    const pricePerGallon = 4.05

    // Act
    const result = calculateEstimatedFuelCost(remainingDistance, avgMPG, pricePerGallon)

    // Assert: Should return 0
    expect(result).toBe(0)
  })

  test('returns zero for zero distance', () => {
    // Arrange: No remaining distance
    const remainingDistance = 0
    const avgMPG = 8
    const pricePerGallon = 4.05

    // Act
    const result = calculateEstimatedFuelCost(remainingDistance, avgMPG, pricePerGallon)

    // Assert: $0 cost
    expect(result).toBe(0)
  })

  test('calculates cost for long distance', () => {
    // Arrange: 1000 miles, 5 MPG, $3.50/gallon
    const remainingDistance = 1000
    const avgMPG = 5
    const pricePerGallon = 3.50

    // Act
    const result = calculateEstimatedFuelCost(remainingDistance, avgMPG, pricePerGallon)

    // Assert: 1000/5 = 200 gallons * $3.50 = $700
    expect(result).toBeCloseTo(700, 2)
  })
})

describe('calculateAverageSpeed', () => {
  test('calculates average speed for normal trip', () => {
    // Arrange: 400 miles / 8 hours
    const distance = 400
    const timeInHours = 8

    // Act
    const result = calculateAverageSpeed(distance, timeInHours)

    // Assert: 50 mph
    expect(result).toBeCloseTo(50, 2)
  })

  test('returns zero for zero time', () => {
    // Arrange: Avoid division by zero
    const distance = 400
    const timeInHours = 0

    // Act
    const result = calculateAverageSpeed(distance, timeInHours)

    // Assert: Should return 0, not Infinity
    expect(result).toBe(0)
  })

  test('calculates speed for short trip', () => {
    // Arrange: 50 miles / 1 hour
    const distance = 50
    const timeInHours = 1

    // Act
    const result = calculateAverageSpeed(distance, timeInHours)

    // Assert: 50 mph
    expect(result).toBeCloseTo(50, 2)
  })

  test('calculates speed with decimal hours', () => {
    // Arrange: 100 miles / 1.5 hours
    const distance = 100
    const timeInHours = 1.5

    // Act
    const result = calculateAverageSpeed(distance, timeInHours)

    // Assert: 66.67 mph
    expect(result).toBeCloseTo(66.67, 2)
  })
})

describe('calculateTimeEfficiency', () => {
  test('calculates efficiency for faster than estimated', () => {
    // Arrange: 7 hours actual / 8 hours estimated
    const actualTimeHours = 7
    const estimatedTimeHours = 8

    // Act
    const result = calculateTimeEfficiency(actualTimeHours, estimatedTimeHours)

    // Assert: 114.29% efficiency (finished early)
    expect(result).toBeCloseTo(114.29, 2)
  })

  test('calculates efficiency for slower than estimated', () => {
    // Arrange: 9 hours actual / 8 hours estimated
    const actualTimeHours = 9
    const estimatedTimeHours = 8

    // Act
    const result = calculateTimeEfficiency(actualTimeHours, estimatedTimeHours)

    // Assert: 88.89% efficiency (took longer)
    expect(result).toBeCloseTo(88.89, 2)
  })

  test('returns 100% for zero estimated time', () => {
    // Arrange: Avoid division by zero
    const actualTimeHours = 5
    const estimatedTimeHours = 0

    // Act
    const result = calculateTimeEfficiency(actualTimeHours, estimatedTimeHours)

    // Assert: Should return 100%
    expect(result).toBe(100)
  })

  test('returns 100% when actual equals estimated', () => {
    // Arrange: Actual equals estimated
    const actualTimeHours = 8
    const estimatedTimeHours = 8

    // Act
    const result = calculateTimeEfficiency(actualTimeHours, estimatedTimeHours)

    // Assert: 100% efficiency (on time)
    expect(result).toBeCloseTo(100, 2)
  })
})
