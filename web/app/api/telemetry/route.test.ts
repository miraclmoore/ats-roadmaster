import { describe, test, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest } from 'next/server'

// Mock Supabase service client
vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn()
}))

describe('POST /api/telemetry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('accepts telemetry data with user_id', async () => {
    // Arrange: Mock successful telemetry insert
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null })
    })

    vi.mocked(createServiceClient).mockReturnValue({ from: mockFrom } as any)

    const request = new NextRequest('http://localhost/api/telemetry', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'test-user-456',
        speed: 55,
        rpm: 1200,
        fuel_current: 80,
        fuel_capacity: 150,
        gear: 8,
        engine_damage: 0.01,
        transmission_damage: 0.02
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('telemetry')
  })

  test('returns 400 when missing user_id or api_key', async () => {
    // Arrange: Request without authentication
    const request = new NextRequest('http://localhost/api/telemetry', {
      method: 'POST',
      body: JSON.stringify({
        speed: 55,
        rpm: 1200
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data.error).toBe('user_id or api_key is required')
  })

  test('associates telemetry with job_id when provided', async () => {
    // Arrange: Mock telemetry insert with job_id
    let insertedData: any

    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockImplementation((data) => {
        insertedData = data
        return Promise.resolve({ error: null })
      })
    })

    vi.mocked(createServiceClient).mockReturnValue({ from: mockFrom } as any)

    const request = new NextRequest('http://localhost/api/telemetry', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'test-user-456',
        job_id: 'test-job-123',
        speed: 65,
        rpm: 1400,
        fuel_current: 70
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(insertedData.job_id).toBe('test-job-123')
    expect(insertedData.user_id).toBe('test-user-456')
  })

  test('looks up user_id from api_key when provided', async () => {
    // Arrange: Mock API key lookup and telemetry insert
    const mockFrom = vi.fn()
      .mockReturnValueOnce({
        // First call: user_preferences lookup
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { user_id: 'looked-up-user-id' },
              error: null
            })
          })
        })
      })
      .mockReturnValueOnce({
        // Second call: telemetry insert
        insert: vi.fn().mockResolvedValue({ error: null })
      })

    vi.mocked(createServiceClient).mockReturnValue({ from: mockFrom } as any)

    const request = new NextRequest('http://localhost/api/telemetry', {
      method: 'POST',
      body: JSON.stringify({
        api_key: 'test-api-key-123',
        speed: 55,
        rpm: 1200
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('user_preferences')
  })

  test('returns 401 when invalid api_key provided', async () => {
    // Arrange: Mock failed API key lookup
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' }
          })
        })
      })
    })

    vi.mocked(createServiceClient).mockReturnValue({ from: mockFrom } as any)

    const request = new NextRequest('http://localhost/api/telemetry', {
      method: 'POST',
      body: JSON.stringify({
        api_key: 'invalid-api-key',
        speed: 55,
        rpm: 1200
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid API key')
  })

  test('returns 500 when database error occurs', async () => {
    // Arrange: Mock database error
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({
        error: { message: 'Database error' }
      })
    })

    vi.mocked(createServiceClient).mockReturnValue({ from: mockFrom } as any)

    const request = new NextRequest('http://localhost/api/telemetry', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'test-user-456',
        speed: 55,
        rpm: 1200
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to insert telemetry')
  })

  test('handles enhanced telemetry fields', async () => {
    // Arrange: Mock telemetry insert with enhanced fields
    let insertedData: any

    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockImplementation((data) => {
        insertedData = data
        return Promise.resolve({ error: null })
      })
    })

    vi.mocked(createServiceClient).mockReturnValue({ from: mockFrom } as any)

    const request = new NextRequest('http://localhost/api/telemetry', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'test-user-456',
        speed: 60,
        rpm: 1300,
        fuel_current: 75,
        cruise_control_enabled: true,
        cruise_control_speed: 65,
        parking_brake: false,
        motor_brake: true,
        retarder_level: 2,
        air_pressure: 125,
        brake_temperature: 80,
        navigation_distance: 150,
        navigation_time: 7200,
        speed_limit: 65
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(insertedData.cruise_control_enabled).toBe(true)
    expect(insertedData.retarder_level).toBe(2)
    expect(insertedData.speed_limit).toBe(65)
  })
})
