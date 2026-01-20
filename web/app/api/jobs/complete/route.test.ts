import { describe, test, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest } from 'next/server'

// Mock Supabase service client
vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn()
}))

describe('POST /api/jobs/complete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('completes job with telemetry metrics', async () => {
    // Arrange: Mock telemetry data and job completion
    const mockTelemetry = [
      {
        fuel_current: 100,
        speed: 55,
        rpm: 1200,
        engine_damage: 0.01,
        transmission_damage: 0.02,
        chassis_damage: 0.01,
        wheels_damage: 0.01,
        cabin_damage: 0.005,
        cargo_damage: 0.005
      },
      {
        fuel_current: 60,
        speed: 60,
        rpm: 1300,
        engine_damage: 0.02,
        transmission_damage: 0.03,
        chassis_damage: 0.02,
        wheels_damage: 0.02,
        cabin_damage: 0.01,
        cargo_damage: 0.01
      }
    ]

    const mockCompletedJob = {
      id: 'test-job-123',
      user_id: 'test-user-456',
      completed_at: expect.any(String),
      fuel_consumed: 40,
      damage_taken: 10,
      profit: 4000,
      fuel_economy: 8
    }

    const mockFrom = vi.fn()
      .mockReturnValueOnce({
        // First call: telemetry select
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockTelemetry, error: null })
          })
        })
      })
      .mockReturnValueOnce({
        // Second call: jobs update
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockCompletedJob, error: null })
              })
            })
          })
        })
      })

    vi.mocked(createServiceClient).mockReturnValue({ from: mockFrom } as any)

    const request = new NextRequest('http://localhost/api/jobs/complete', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'test-user-456',
        job_id: 'test-job-123',
        delivered_late: false
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.job.id).toBe('test-job-123')
    expect(data.metrics.fuel_consumed).toBe(40)
    expect(mockFrom).toHaveBeenCalledWith('telemetry')
    expect(mockFrom).toHaveBeenCalledWith('jobs')
  })

  test('returns 400 when missing user_id or api_key', async () => {
    // Arrange: Request without authentication
    const request = new NextRequest('http://localhost/api/jobs/complete', {
      method: 'POST',
      body: JSON.stringify({
        job_id: 'test-job-123'
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data.error).toBe('user_id or api_key is required')
  })

  test('returns 400 when missing job_id', async () => {
    // Arrange: Request without job_id
    const request = new NextRequest('http://localhost/api/jobs/complete', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'test-user-456'
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data.error).toBe('job_id is required')
  })

  test('handles job with no telemetry data', async () => {
    // Arrange: Mock no telemetry data
    const mockCompletedJob = {
      id: 'test-job-123',
      user_id: 'test-user-456',
      completed_at: expect.any(String),
      fuel_consumed: null,
      damage_taken: null
    }

    const mockFrom = vi.fn()
      .mockReturnValueOnce({
        // First call: telemetry select (empty)
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        // Second call: jobs update
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockCompletedJob, error: null })
              })
            })
          })
        })
      })

    vi.mocked(createServiceClient).mockReturnValue({ from: mockFrom } as any)

    const request = new NextRequest('http://localhost/api/jobs/complete', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'test-user-456',
        job_id: 'test-job-123'
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.metrics.fuel_consumed).toBe(null)
    expect(data.metrics.damage_taken).toBe(null)
  })

  test('returns 404 when job not found', async () => {
    // Arrange: Mock job not found
    const mockFrom = vi.fn()
      .mockReturnValueOnce({
        // First call: telemetry select
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        // Second call: jobs update returns null
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null })
              })
            })
          })
        })
      })

    vi.mocked(createServiceClient).mockReturnValue({ from: mockFrom } as any)

    const request = new NextRequest('http://localhost/api/jobs/complete', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'test-user-456',
        job_id: 'nonexistent-job'
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.error).toBe('Job not found')
  })

  test('returns 500 when database error occurs', async () => {
    // Arrange: Mock database error
    const mockFrom = vi.fn()
      .mockReturnValueOnce({
        // First call: telemetry select
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        // Second call: jobs update with error
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database error' }
                })
              })
            })
          })
        })
      })

    vi.mocked(createServiceClient).mockReturnValue({ from: mockFrom } as any)

    const request = new NextRequest('http://localhost/api/jobs/complete', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'test-user-456',
        job_id: 'test-job-123'
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to complete job')
  })
})
