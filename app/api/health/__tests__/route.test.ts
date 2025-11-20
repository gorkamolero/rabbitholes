import { describe, it, expect } from 'vitest'
import { GET } from '../route'

describe('Health API Endpoint', () => {
  it('returns 200 status with { status: "ok" }', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ status: 'ok' })
  })

  it('returns valid JSON response', async () => {
    const response = await GET()
    const contentType = response.headers.get('content-type')

    expect(contentType).toContain('application/json')

    // Should be able to parse as JSON without errors
    const data = await response.json()
    expect(data).toBeDefined()
  })
})
