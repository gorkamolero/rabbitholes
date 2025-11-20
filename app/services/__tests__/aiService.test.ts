import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AIService, getAIService } from '../aiService'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('AIService', () => {
  beforeEach(() => {
    // Clear singleton instance before each test
    ;(AIService as any).instance = null
    vi.clearAllMocks()

    // Set up environment variable
    process.env.OPENROUTER_API_KEY = 'test-openrouter-key'
  })

  afterEach(() => {
    // Clean up singleton
    ;(AIService as any).instance = null
  })

  it('creates a singleton instance', () => {
    const instance1 = getAIService()
    const instance2 = getAIService()

    expect(instance1).toBe(instance2)
  })

  it('throws error when OPENROUTER_API_KEY is missing', () => {
    const originalKey = process.env.OPENROUTER_API_KEY
    delete process.env.OPENROUTER_API_KEY

    expect(() => {
      ;(AIService as any).instance = null
      getAIService()
    }).toThrow('OPENROUTER_API_KEY is not set in environment variables')

    // Restore the key
    process.env.OPENROUTER_API_KEY = originalKey
  })

  it('creates chat completion with correct parameters', async () => {
    const mockResponse = {
      id: 'test-id',
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Test response',
          },
          finish_reason: 'stop',
        },
      ],
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const service = getAIService()
    const messages = [
      { role: 'system' as const, content: 'You are a helpful assistant' },
      { role: 'user' as const, content: 'Hello!' },
    ]

    const response = await service.createChatCompletion(messages)

    expect(response).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-openrouter-key',
          'Content-Type': 'application/json',
        }),
        body: expect.stringContaining('google/gemini-2.0-flash-001'),
      })
    )
  })

  it('supports custom model parameter', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'test', choices: [] }),
    })

    const service = getAIService()
    const messages = [{ role: 'user' as const, content: 'Test' }]

    await service.createChatCompletion(messages, 'custom-model')

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(callBody.model).toBe('custom-model')
  })

  it('handles API errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    })

    const service = getAIService()
    const messages = [{ role: 'user' as const, content: 'Test' }]

    await expect(service.createChatCompletion(messages)).rejects.toThrow(
      'OpenRouter API error: 401 - Unauthorized'
    )
  })

  it('creates stream completion with abort signal', async () => {
    const mockStream = new ReadableStream()
    mockFetch.mockResolvedValue({
      ok: true,
      body: mockStream,
    })

    const service = getAIService()
    const messages = [{ role: 'user' as const, content: 'Test' }]
    const controller = new AbortController()

    const stream = await service.createStreamCompletion(
      messages,
      undefined,
      controller.signal
    )

    expect(stream).toBe(mockStream)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        signal: controller.signal,
      })
    )
  })

  it('throws error when stream response body is null', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      body: null,
    })

    const service = getAIService()
    const messages = [{ role: 'user' as const, content: 'Test' }]

    await expect(service.createStreamCompletion(messages)).rejects.toThrow(
      'Response body is null'
    )
  })
})
