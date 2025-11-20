import '@testing-library/jest-dom/vitest'
import { beforeAll, afterEach, afterAll } from 'vitest'

// Set up environment variables for tests
process.env.GOOGLE_AI_API_KEY = 'test-google-ai-key'
process.env.TAVILY_API_KEY = 'test-tavily-key'
process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-posthog-key'
process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://test.posthog.com'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Mock PostHog
vi.mock('posthog-js/react', () => ({
  PostHogProvider: ({ children }: { children: React.ReactNode }) => children,
  usePostHog: () => ({
    capture: vi.fn(),
    identify: vi.fn(),
  }),
}))

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
})
