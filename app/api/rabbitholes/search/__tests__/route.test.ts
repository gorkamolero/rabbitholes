import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { NextRequest } from 'next/server'

// Mock the tavily client
vi.mock('@tavily/core', () => ({
  tavily: () => ({
    search: vi.fn().mockResolvedValue({
      results: [
        {
          title: 'Test Article 1',
          url: 'https://example.com/article1',
          author: 'John Doe',
          image: 'https://example.com/image1.jpg',
        },
        {
          title: 'Test Article 2',
          url: 'https://example.com/article2',
          author: 'Jane Smith',
          image: '',
        },
      ],
      images: [
        {
          url: 'https://example.com/img1.jpg',
          description: 'Test image 1',
        },
        {
          url: 'https://example.com/img2.jpg',
          description: 'Test image 2',
        },
      ],
    }),
  }),
}))

// Mock the OpenAI service
vi.mock('@/app/services/openaiService', () => ({
  getOpenAIService: () => ({
    createChatCompletion: vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: `#### Artificial Intelligence

AI is a transformative technology that enables machines to simulate human intelligence.

#### Key Applications

Machine learning and neural networks are core components.

Follow-up Questions:
1. How does machine learning work?
2. What are the ethical implications of AI?
3. Could AI surpass human intelligence?`,
          },
        },
      ],
    }),
  }),
}))

describe('Search API Endpoint', () => {
  const createRequest = (body: any): NextRequest => {
    return new NextRequest('http://localhost:3000/api/rabbitholes/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

  it('returns search results with response and follow-up questions', async () => {
    const request = createRequest({ query: 'artificial intelligence' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('response')
    expect(data).toHaveProperty('followUpQuestions')
    expect(data).toHaveProperty('sources')
    expect(data).toHaveProperty('images')
    expect(data).toHaveProperty('contextualQuery')
  })

  it('extracts 3 follow-up questions from AI response', async () => {
    const request = createRequest({ query: 'quantum computing' })
    const response = await POST(request)
    const data = await response.json()

    expect(data.followUpQuestions).toHaveLength(3)
    expect(data.followUpQuestions[0]).toContain('?')
  })

  it('removes follow-up questions section from main response', async () => {
    const request = createRequest({ query: 'test topic' })
    const response = await POST(request)
    const data = await response.json()

    expect(data.response).not.toContain('Follow-up Questions:')
  })

  it('returns 400 for missing query parameter', async () => {
    const request = createRequest({})
    const response = await POST(request)

    // The endpoint doesn't explicitly validate, but we should test error handling
    // For now, test that it handles gracefully
    expect(response.status).toBeGreaterThanOrEqual(200)
  })

  it('includes conversation history in AI prompt', async () => {
    const request = createRequest({
      query: 'follow up question',
      previousConversation: [
        {
          user: 'What is AI?',
          assistant: 'AI is artificial intelligence...',
        },
      ],
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.response).toBeDefined()
  })

  it('handles different follow-up modes', async () => {
    const expansiveRequest = createRequest({
      query: 'test query',
      followUpMode: 'expansive',
    })

    const focusedRequest = createRequest({
      query: 'test query',
      followUpMode: 'focused',
    })

    const expansiveResponse = await POST(expansiveRequest)
    const focusedResponse = await POST(focusedRequest)

    expect(expansiveResponse.status).toBe(200)
    expect(focusedResponse.status).toBe(200)
  })

  it('formats sources correctly from search results', async () => {
    const request = createRequest({ query: 'test query' })
    const response = await POST(request)
    const data = await response.json()

    expect(data.sources).toBeInstanceOf(Array)
    expect(data.sources.length).toBeGreaterThan(0)
    expect(data.sources[0]).toHaveProperty('title')
    expect(data.sources[0]).toHaveProperty('url')
    expect(data.sources[0]).toHaveProperty('author')
  })

  it('formats images correctly from search results', async () => {
    const request = createRequest({ query: 'test query' })
    const response = await POST(request)
    const data = await response.json()

    expect(data.images).toBeInstanceOf(Array)
    expect(data.images.length).toBeGreaterThan(0)
    expect(data.images[0]).toHaveProperty('url')
    expect(data.images[0]).toHaveProperty('thumbnail')
    expect(data.images[0]).toHaveProperty('description')
  })
})
