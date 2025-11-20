import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { OpenAIService, getOpenAIService } from '../openaiService'

// Hoist the mock and mock class
const { mockCreate, MockOpenAI } = vi.hoisted(() => {
  const mockCreate = vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: 'Test response',
        },
      },
    ],
  })

  class MockOpenAI {
    chat = {
      completions: {
        create: mockCreate,
      },
    }
  }

  return { mockCreate, MockOpenAI }
})

vi.mock('openai', () => ({
  default: MockOpenAI,
}))

describe('OpenAIService', () => {
  beforeEach(() => {
    // Clear singleton instance before each test
    ;(OpenAIService as any).instance = null
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up singleton
    ;(OpenAIService as any).instance = null
  })

  it('creates a singleton instance', () => {
    const instance1 = getOpenAIService()
    const instance2 = getOpenAIService()

    expect(instance1).toBe(instance2)
  })

  it('throws error when GOOGLE_AI_API_KEY is missing', () => {
    const originalKey = process.env.GOOGLE_AI_API_KEY
    delete process.env.GOOGLE_AI_API_KEY

    expect(() => {
      ;(OpenAIService as any).instance = null
      getOpenAIService()
    }).toThrow('GOOGLE_AI_API_KEY is not set in environment variables')

    // Restore the key
    process.env.GOOGLE_AI_API_KEY = originalKey
  })

  it('initializes with correct Gemini configuration', () => {
    const service = getOpenAIService()
    const config = service.getModelConfig('gemini')

    expect(config).toBeDefined()
    expect(config.baseURL).toBe('https://generativelanguage.googleapis.com/v1beta')
    expect(config.model).toBe('gemini-2.0-flash')
    expect(config.apiKey).toBe(process.env.GOOGLE_AI_API_KEY)
  })

  it('creates chat completion with correct parameters', async () => {
    const service = getOpenAIService()
    const messages = [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Hello!' },
    ]

    const response = await service.createChatCompletion(messages, 'gemini')

    expect(response).toBeDefined()
    expect(response.choices).toBeDefined()
    expect(response.choices[0].message.content).toBe('Test response')
  })

  it('throws error for unconfigured provider', async () => {
    const service = getOpenAIService()
    const messages = [{ role: 'user', content: 'Test' }]

    await expect(
      service.createChatCompletion(messages, 'invalid-provider')
    ).rejects.toThrow('Provider invalid-provider not configured')
  })

  it('supports custom options in chat completion', async () => {
    const service = getOpenAIService()
    const messages = [{ role: 'user', content: 'Test' }]
    const options = {
      temperature: 0.7,
      max_tokens: 100,
    }

    const response = await service.createChatCompletion(messages, 'gemini', options)

    expect(response).toBeDefined()
  })

  it('creates stream completion with abort signal support', async () => {
    const service = getOpenAIService()
    const messages = [{ role: 'user', content: 'Test' }]
    const controller = new AbortController()

    const stream = await service.createStreamCompletion(
      messages,
      'gemini',
      {},
      controller.signal
    )

    expect(stream).toBeDefined()
  })

  it('reuses client instances for same provider', async () => {
    const service = getOpenAIService()
    const messages = [{ role: 'user', content: 'Test' }]

    await service.createChatCompletion(messages, 'gemini')
    await service.createChatCompletion(messages, 'gemini')

    // The mock create should be called twice (once for each call)
    expect(mockCreate).toHaveBeenCalledTimes(2)
  })
})
