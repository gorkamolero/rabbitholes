import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSearchResult } from '../../../__tests__/utils/mock-data'

// Hoist the mock post function
const { mockPost } = vi.hoisted(() => ({
  mockPost: vi.fn(),
}))

// Mock axios before importing the module
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: mockPost,
    })),
  },
}))

// Import after mocking
import { searchRabbitHole } from '../api'

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends POST request to /api/rabbitholes/search with correct payload', async () => {
    mockPost.mockResolvedValue({ data: mockSearchResult })

    const params = {
      query: 'artificial intelligence',
    }

    await searchRabbitHole(params)

    expect(mockPost).toHaveBeenCalledWith(
      '/rabbitholes/search',
      params,
      { signal: undefined }
    )
  })

  it('handles successful search response', async () => {
    mockPost.mockResolvedValue({ data: mockSearchResult })

    const params = { query: 'test query' }
    const result = await searchRabbitHole(params)

    expect(result).toEqual(mockSearchResult)
    expect(result.response).toBeDefined()
    expect(result.followUpQuestions).toBeInstanceOf(Array)
  })

  it('includes conversation history in request', async () => {
    mockPost.mockResolvedValue({ data: mockSearchResult })

    const params = {
      query: 'follow up',
      previousConversation: [
        { user: 'What is AI?', assistant: 'AI is...' },
      ],
    }

    await searchRabbitHole(params)

    expect(mockPost).toHaveBeenCalledWith(
      '/rabbitholes/search',
      params,
      { signal: undefined }
    )
  })

  it('supports request cancellation via AbortSignal', async () => {
    mockPost.mockResolvedValue({ data: mockSearchResult })

    const controller = new AbortController()
    const params = { query: 'test' }

    await searchRabbitHole(params, controller.signal)

    expect(mockPost).toHaveBeenCalledWith(
      '/rabbitholes/search',
      params,
      { signal: controller.signal }
    )
  })

  it('handles API error responses', async () => {
    const mockError = new Error('Network error')
    mockPost.mockRejectedValue(mockError)

    const params = { query: 'test' }

    await expect(searchRabbitHole(params)).rejects.toThrow('Network error')
  })
})
