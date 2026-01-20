import { describe, test, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest } from 'next/server'

// Mock Supabase service client
vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn()
}))

describe('POST /api/jobs/start', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('creates new job with valid data and user_id', async () => {
    // Arrange: Mock successful job creation
    const mockJob = {
      id: 'test-job-123',
      user_id: 'test-user-456',
      source_city: 'Los Angeles',
      destination_city: 'San Francisco',
      cargo_type: 'Electronics',
      income: 5000,
      distance: 400,
      started_at: expect.any(String)
    }

    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockJob, error: null })
        })
      })
    })

    vi.mocked(createServiceClient).mockReturnValue({ from: mockFrom } as any)

    const request = new NextRequest('http://localhost/api/jobs/start', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'test-user-456',
        source_city: 'Los Angeles',
        destination_city: 'San Francisco',
        cargo_type: 'Electronics',
        income: 5000,
        distance: 400
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.job_id).toBe('test-job-123')
    expect(data.job.source_city).toBe('Los Angeles')
    expect(mockFrom).toHaveBeenCalledWith('jobs')
  })

  test('returns 400 when missing user_id or api_key', async () => {
    // Arrange: Request without authentication
    const request = new NextRequest('http://localhost/api/jobs/start', {
      method: 'POST',
      body: JSON.stringify({
        source_city: 'Los Angeles',
        destination_city: 'San Francisco',
        cargo_type: 'Electronics',
        income: 5000,
        distance: 400
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data.error).toBe('user_id or api_key is required')
  })

  test('returns 400 when missing required job fields', async () => {
    // Arrange: Request missing required fields
    const request = new NextRequest('http://localhost/api/jobs/start', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'test-user-456',
        source_city: 'Los Angeles'
        // Missing destination_city, cargo_type, income, distance
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required job fields')
  })

  test('looks up user_id from api_key when provided', async () => {
    // Arrange: Mock API key lookup and job creation
    const mockJob = {
      id: 'test-job-789',
      user_id: 'looked-up-user-id',
      source_city: 'Seattle',
      destination_city: 'Portland',
      cargo_type: 'Lumber',
      income: 3000,
      distance: 200
    }

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
        // Second call: jobs insert
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockJob, error: null })
          })
        })
      })

    vi.mocked(createServiceClient).mockReturnValue({ from: mockFrom } as any)

    const request = new NextRequest('http://localhost/api/jobs/start', {
      method: 'POST',
      body: JSON.stringify({
        api_key: 'test-api-key-123',
        source_city: 'Seattle',
        destination_city: 'Portland',
        cargo_type: 'Lumber',
        income: 3000,
        distance: 200
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

    const request = new NextRequest('http://localhost/api/jobs/start', {
      method: 'POST',
      body: JSON.stringify({
        api_key: 'invalid-api-key',
        source_city: 'Seattle',
        destination_city: 'Portland',
        cargo_type: 'Lumber',
        income: 3000,
        distance: 200
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
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      })
    })

    vi.mocked(createServiceClient).mockReturnValue({ from: mockFrom } as any)

    const request = new NextRequest('http://localhost/api/jobs/start', {
      method: 'POST',
      body: JSON.stringify({
        user_id: 'test-user-456',
        source_city: 'Los Angeles',
        destination_city: 'San Francisco',
        cargo_type: 'Electronics',
        income: 5000,
        distance: 400
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create job')
  })
})
