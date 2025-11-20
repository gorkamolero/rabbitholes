import { http, HttpResponse } from 'msw'
import { mockSearchResult } from './mock-data'

/**
 * MSW handlers for mocking API requests in tests
 */

export const handlers = [
  // Health check endpoint
  http.get('http://localhost:3000/api/health', () => {
    return HttpResponse.json({ status: 'ok' })
  }),

  // Search endpoint - success case
  http.post('http://localhost:3000/api/rabbitholes/search', async ({ request }) => {
    const body = await request.json() as any

    if (!body.query) {
      return HttpResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    return HttpResponse.json(mockSearchResult)
  }),

  // Tavily API mock
  http.post('https://api.tavily.com/search', () => {
    return HttpResponse.json({
      results: [
        {
          title: 'Test Article',
          url: 'https://example.com/test',
          content: 'Test content',
          author: 'Test Author',
        },
      ],
      images: [
        {
          url: 'https://example.com/test.jpg',
          description: 'Test image',
        },
      ],
    })
  }),

  // Google Gemini API mock
  http.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', () => {
    return HttpResponse.json({
      candidates: [
        {
          content: {
            parts: [
              {
                text: '## Test Response\n\nThis is a test response.\n\n**Question:** Test question 1?\n**Question:** Test question 2?\n**Question:** Test question 3?',
              },
            ],
          },
          finishReason: 'STOP',
        },
      ],
    })
  }),
]

/**
 * Error handlers for testing error cases
 */
export const errorHandlers = [
  // Search endpoint - server error
  http.post('http://localhost:3000/api/rabbitholes/search', () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }),

  // Tavily API - timeout
  http.post('https://api.tavily.com/search', async () => {
    await new Promise(resolve => setTimeout(resolve, 10000))
    return HttpResponse.json({ error: 'Timeout' }, { status: 408 })
  }),

  // Gemini API - rate limit
  http.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', () => {
    return HttpResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }),
]
