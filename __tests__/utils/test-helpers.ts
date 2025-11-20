import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

/**
 * Mock AbortController for testing request cancellation
 */
export function createMockAbortController() {
  const controller = new AbortController()
  const abortSpy = vi.fn()
  controller.abort = abortSpy
  return { controller, abortSpy }
}

/**
 * Wait for a condition to be true with timeout
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now()
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition')
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
}

/**
 * Create a mock Request object for testing API routes
 */
export function createMockRequest(
  method: string,
  body?: any,
  headers?: Record<string, string>
): Request {
  return new Request('http://localhost:3000/api/test', {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * Helper to test async API responses
 */
export async function getResponseData(response: Response) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
