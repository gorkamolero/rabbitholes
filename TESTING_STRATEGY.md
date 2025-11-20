# RabbitHoles Testing Strategy

## Executive Summary

This document outlines a comprehensive testing strategy for the RabbitHoles knowledge exploration application. The strategy covers **78 total tests** across unit, integration, and end-to-end testing layers.

**Current Status:** ⚠️ No tests implemented
**Recommended Coverage Target:** 80% for critical paths, 60% overall

---

## 1. Testing Philosophy

### Testing Pyramid
```
           /\
          /  \     E2E Tests (12 tests)
         /    \    - User journeys
        /------\   - Critical flows
       /        \
      /  INTEG  \  Integration Tests (21 tests)
     /    TESTS  \ - API + Frontend
    /      (21)   \- Service integration
   /--------------\
  /                \
 /   UNIT TESTS    \ Unit Tests (45 tests)
/       (45)        \- Components, utils
--------------------
```

### Test Types & Distribution

| Test Type | Count | Coverage Target | Execution Time |
|-----------|-------|----------------|----------------|
| **Unit Tests** | 45 | 70-80% | < 5 seconds |
| **Integration Tests** | 21 | 60-70% | < 30 seconds |
| **E2E Tests** | 12 | Critical paths only | < 2 minutes |
| **Total** | **78** | **65-75% overall** | **< 3 minutes** |

---

## 2. Unit Tests (45 tests)

### 2.1 Component Tests (25 tests)

#### **SearchView Component** (8 tests) - `app/components/__tests__/SearchView.test.tsx`
- ✓ Renders initial landing page with oracle decks
- ✓ Displays three oracle decks (Thoth, Anubis, Isis) with questions
- ✓ Handles search input and submission
- ✓ Creates initial node with search results
- ✓ Handles node click to expand follow-up questions
- ✓ Maintains conversation history across searches
- ✓ Cancels ongoing requests when new search initiated
- ✓ Displays error messages when API fails

**Priority:** 🔴 Critical
**Complexity:** High
**Dependencies:** React Flow, API service (mocked)

---

#### **RabbitFlow Component** (5 tests) - `app/components/__tests__/RabbitFlow.test.tsx`
- ✓ Renders React Flow canvas with nodes and edges
- ✓ Applies Dagre layout algorithm correctly
- ✓ Updates layout when nodes change
- ✓ Handles node click events and triggers callback
- ✓ Displays minimap and controls

**Priority:** 🔴 Critical
**Complexity:** Medium
**Dependencies:** React Flow library

---

#### **MainNode Component** (5 tests) - `app/components/nodes/__tests__/MainNode.test.tsx`
- ✓ Renders markdown content correctly
- ✓ Displays image carousel when images provided
- ✓ Shows source links with favicons
- ✓ Displays loading spinner during data fetch
- ✓ Handles missing/broken images gracefully

**Priority:** 🟡 High
**Complexity:** Medium
**Dependencies:** React Markdown, BounceCards

---

#### **BounceCards Component** (4 tests) - `app/components/ui/__tests__/bounce-cards.test.tsx`
- ✓ Renders image carousel with all images
- ✓ Opens modal on image click
- ✓ Closes modal when backdrop clicked
- ✓ Handles image loading errors

**Priority:** 🟢 Medium
**Complexity:** Low
**Dependencies:** GSAP (mocked)

---

#### **Modal Component** (3 tests) - `app/components/ui/__tests__/Modal.test.tsx`
- ✓ Renders children when open
- ✓ Does not render when closed
- ✓ Calls onClose when backdrop clicked

**Priority:** 🟢 Low
**Complexity:** Low
**Dependencies:** None

---

### 2.2 Service Tests (12 tests)

#### **OpenAI Service** (7 tests) - `app/services/__tests__/openaiService.test.ts`
- ✓ Initializes with correct API key and base URL
- ✓ Creates chat completion with Gemini model
- ✓ Handles API authentication errors
- ✓ Handles network timeouts
- ✓ Handles rate limiting (429 errors)
- ✓ Formats messages correctly for API
- ✓ Throws error when API key missing

**Priority:** 🔴 Critical
**Complexity:** Medium
**Dependencies:** OpenAI SDK (mocked)

---

#### **API Service** (5 tests) - `app/services/__tests__/api.test.ts`
- ✓ Sends POST request to /api/rabbitholes/search with correct payload
- ✓ Handles successful search response
- ✓ Handles API error responses (4xx, 5xx)
- ✓ Supports request cancellation via AbortSignal
- ✓ Includes conversation history in follow-up searches

**Priority:** 🔴 Critical
**Complexity:** Low
**Dependencies:** Axios (mocked)

---

### 2.3 API Route Tests (8 tests)

#### **Health Endpoint** (2 tests) - `app/api/health/__tests__/route.test.ts`
- ✓ Returns 200 status with { status: 'ok' }
- ✓ Handles GET requests only

**Priority:** 🟢 Low
**Complexity:** Very Low
**Dependencies:** None

---

#### **Search Endpoint** (6 tests) - `app/api/rabbitholes/search/__tests__/route.test.ts`
- ✓ Returns search results with response and follow-up questions
- ✓ Validates required fields (query)
- ✓ Returns 400 for missing query parameter
- ✓ Handles Tavily API failures gracefully
- ✓ Handles Gemini API failures gracefully
- ✓ Includes conversation history in Gemini prompt

**Priority:** 🔴 Critical
**Complexity:** High
**Dependencies:** Tavily SDK, OpenAI Service (mocked)

---

---

## 3. Integration Tests (21 tests)

### 3.1 API + Service Integration (12 tests)

#### **Search Flow Integration** (8 tests) - `__tests__/integration/search-flow.test.ts`
- ✓ Complete search with Tavily + Gemini integration
- ✓ Returns valid markdown response
- ✓ Extracts 3 follow-up questions
- ✓ Includes images from Tavily
- ✓ Includes source citations
- ✓ Handles conversation context in follow-ups
- ✓ Handles expansive vs focused mode
- ✓ Handles API timeout scenarios

**Priority:** 🔴 Critical
**Complexity:** High
**Test Environment:** Integration (mocked external APIs)

---

#### **Error Recovery** (4 tests) - `__tests__/integration/error-recovery.test.ts`
- ✓ Recovers from Tavily timeout (retries)
- ✓ Recovers from Gemini rate limit (backs off)
- ✓ Returns partial results when images fail
- ✓ Logs errors without crashing

**Priority:** 🟡 High
**Complexity:** Medium
**Test Environment:** Integration (simulated failures)

---

### 3.2 Frontend + API Integration (9 tests)

#### **User Interaction Flow** (6 tests) - `__tests__/integration/user-flow.test.tsx`
- ✓ User enters query → API called → Results displayed
- ✓ User clicks oracle deck → API called with preset question
- ✓ User clicks follow-up node → Expands with new questions
- ✓ Conversation history preserved across interactions
- ✓ Loading states displayed during API calls
- ✓ Error messages shown on API failure

**Priority:** 🔴 Critical
**Complexity:** High
**Test Environment:** React Testing Library + MSW (Mock Service Worker)

---

#### **Graph Layout** (3 tests) - `__tests__/integration/graph-layout.test.tsx`
- ✓ Initial search creates root node
- ✓ Clicking node adds child nodes with edges
- ✓ Dagre layout positions nodes correctly (left-to-right)

**Priority:** 🟡 High
**Complexity:** Medium
**Test Environment:** React Testing Library + React Flow utils

---

---

## 4. End-to-End Tests (12 tests)

### 4.1 Critical User Journeys (12 tests)

#### **Test File:** `e2e/user-journeys.spec.ts` (Playwright)

#### **Journey 1: Initial Search** (3 tests)
- ✓ User lands on home page and sees oracle decks
- ✓ User types query "artificial intelligence" and submits
- ✓ Graph displays with central node containing response

**Priority:** 🔴 Critical
**Complexity:** Medium
**Execution Time:** ~15 seconds

---

#### **Journey 2: Oracle Deck Interaction** (3 tests)
- ✓ User hovers over Thoth deck and sees animation
- ✓ User clicks Thoth deck card
- ✓ Search executes with deck's preset question

**Priority:** 🟡 High
**Complexity:** Low
**Execution Time:** ~15 seconds

---

#### **Journey 3: Deep Exploration** (4 tests)
- ✓ User searches "quantum computing"
- ✓ User clicks first follow-up question node
- ✓ New child nodes appear with follow-up questions
- ✓ User clicks second-level question and continues exploration

**Priority:** 🔴 Critical
**Complexity:** High
**Execution Time:** ~30 seconds

---

#### **Journey 4: Error Handling** (2 tests)
- ✓ User searches with invalid API key (simulated)
- ✓ Error message displays without crashing app

**Priority:** 🟡 High
**Complexity:** Medium
**Execution Time:** ~10 seconds

---

---

## 5. Testing Tools & Setup

### 5.1 Recommended Testing Stack

```json
{
  "unit-integration": {
    "framework": "Vitest",
    "reason": "Fast, Vite-native, excellent TypeScript support",
    "alternatives": ["Jest"]
  },
  "component-testing": {
    "framework": "React Testing Library",
    "reason": "User-centric testing, React 19 support"
  },
  "e2e": {
    "framework": "Playwright",
    "reason": "Modern, reliable, multi-browser, great DX",
    "alternatives": ["Cypress"]
  },
  "mocking": {
    "api": "MSW (Mock Service Worker)",
    "reason": "Intercepts network requests, works with any framework"
  },
  "coverage": {
    "tool": "Vitest Coverage (c8/istanbul)",
    "threshold": "65%"
  }
}
```

### 5.2 Package Dependencies

```bash
npm install -D \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @vitest/ui \
  @vitest/coverage-v8 \
  msw \
  @playwright/test \
  happy-dom
```

### 5.3 Configuration Files

#### **vitest.config.ts**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'e2e/',
        '**/*.config.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 65,
        functions: 60,
        branches: 60,
        statements: 65,
      },
    },
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
    },
  },
})
```

#### **playwright.config.ts**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 6. Test Coverage Priorities

### 6.1 Critical Path (Must Have 90%+ Coverage)

1. **Search Flow** - `/api/rabbitholes/search` + `SearchView.tsx`
2. **Node Expansion** - `RabbitFlow.tsx` + `handleNodeClick()`
3. **Error Handling** - All API error states
4. **Conversation History** - Context preservation logic

### 6.2 High Priority (Target 70-80%)

1. **OpenAI Service** - Model interaction logic
2. **API Client** - Request/response handling
3. **MainNode Component** - Content rendering
4. **Layout Algorithm** - Dagre integration

### 6.3 Medium Priority (Target 50-60%)

1. **UI Components** - BounceCards, Modal
2. **GSAP Animations** - Hover effects (visual testing)
3. **PostHog Integration** - Analytics tracking

### 6.4 Low Priority (Optional)

1. **CSS Styling** - Visual regression tests
2. **Accessibility** - ARIA labels, keyboard navigation
3. **Performance** - Lighthouse scores, bundle size

---

## 7. Test Execution Strategy

### 7.1 Local Development

```bash
# Run all unit + integration tests
npm test

# Watch mode during development
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E in UI mode (debugging)
npm run test:e2e:ui
```

### 7.2 CI/CD Pipeline

#### **Recommended GitHub Actions Workflow**

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  pull_request:
  push:
    branches: [main, claude/*]

jobs:
  unit-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
        env:
          GOOGLE_AI_API_KEY: ${{ secrets.GOOGLE_AI_API_KEY }}
          TAVILY_API_KEY: ${{ secrets.TAVILY_API_KEY }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### 7.3 Pre-commit Hooks (Optional)

```bash
# Install husky
npm install -D husky lint-staged

# .husky/pre-commit
npx lint-staged

# package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "npm run lint",
      "npm run test:related"
    ]
  }
}
```

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Install testing dependencies
- [ ] Configure Vitest and Playwright
- [ ] Set up MSW for API mocking
- [ ] Create test utilities and helpers
- [ ] Write first smoke test

**Estimated Effort:** 8 hours

---

### Phase 2: Critical Path (Week 2-3)
- [ ] API route tests (8 tests)
- [ ] Service tests (12 tests)
- [ ] SearchView component tests (8 tests)
- [ ] Integration: Search flow (8 tests)
- [ ] E2E: Initial search journey (3 tests)

**Estimated Effort:** 24 hours
**Coverage Target:** 50-60%

---

### Phase 3: Full Coverage (Week 4-5)
- [ ] RabbitFlow tests (5 tests)
- [ ] MainNode tests (5 tests)
- [ ] UI component tests (7 tests)
- [ ] Integration: User flow (9 tests)
- [ ] E2E: All journeys (12 tests)

**Estimated Effort:** 20 hours
**Coverage Target:** 70-80%

---

### Phase 4: Polish & CI/CD (Week 6)
- [ ] Set up GitHub Actions workflow
- [ ] Add coverage reporting (Codecov)
- [ ] Configure pre-commit hooks
- [ ] Document test patterns
- [ ] Create testing guidelines for contributors

**Estimated Effort:** 8 hours

---

## 9. Mocking Strategy

### 9.1 External API Mocks

#### **Tavily Search API**
```typescript
// __mocks__/tavily.ts
export const mockTavilyResponse = {
  results: [
    {
      title: "Sample Article",
      url: "https://example.com",
      content: "Sample content...",
      author: "John Doe",
    }
  ],
  images: [
    {
      url: "https://example.com/image.jpg",
      description: "Sample image"
    }
  ]
}
```

#### **Google Gemini API**
```typescript
// __mocks__/openai.ts
export const mockGeminiResponse = {
  choices: [{
    message: {
      content: "## Sample Response\n\nThis is a test response.\n\n**Question:** What is AI?"
    }
  }]
}
```

### 9.2 Component Mocks

#### **React Flow**
```typescript
// __mocks__/reactflow.ts
export const mockReactFlow = {
  useNodesState: vi.fn(() => [[], vi.fn()]),
  useEdgesState: vi.fn(() => [[], vi.fn()]),
}
```

### 9.3 Environment Variables
```typescript
// vitest.setup.ts
process.env.GOOGLE_AI_API_KEY = 'test-key'
process.env.TAVILY_API_KEY = 'test-key'
```

---

## 10. Special Testing Considerations

### 10.1 Testing GSAP Animations
- Mock `gsap.to()` and `gsap.from()`
- Verify animation parameters (duration, ease)
- Use `vi.advanceTimersByTime()` for time-based tests

### 10.2 Testing React Flow
- Use `@reactflow/testing-utils` for node/edge assertions
- Mock `getBBox()` and `getComputedStyle()` for layout tests
- Snapshot test node positions

### 10.3 Testing Markdown Rendering
- Use snapshot testing for HTML output
- Verify code block syntax highlighting
- Test link rendering and sanitization

### 10.4 Testing AbortController
- Verify signal passed to fetch
- Test cancellation behavior
- Verify cleanup on component unmount

---

## 11. Success Metrics

### Key Performance Indicators

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Test Count** | 78 | 0 | ⚠️ Not Started |
| **Code Coverage** | 65-75% | 0% | ⚠️ Not Started |
| **Critical Path Coverage** | 90%+ | 0% | ⚠️ Not Started |
| **Test Execution Time** | < 3 min | N/A | - |
| **CI/CD Integration** | ✓ | ✗ | ⚠️ Not Started |
| **Flaky Test Rate** | < 1% | N/A | - |

### Definition of Done
- ✅ All 78 tests implemented and passing
- ✅ Coverage reports generated and reviewed
- ✅ CI/CD pipeline running tests on all PRs
- ✅ Documentation complete for test patterns
- ✅ Zero flaky tests in main branch

---

## 12. Maintenance & Evolution

### Test Review Process
1. **New Feature:** Requires tests before merge
2. **Bug Fix:** Add regression test for the bug
3. **Refactor:** Ensure existing tests still pass
4. **Quarterly Review:** Remove obsolete tests, update mocks

### When to Update Tests
- ✅ API response format changes
- ✅ Component props change
- ✅ Business logic changes
- ✅ External API updates (Gemini, Tavily)
- ❌ UI styling changes (unless accessibility affected)

---

## Appendix A: Test File Structure

```
rabbitholes/
├── __tests__/
│   ├── integration/
│   │   ├── search-flow.test.ts
│   │   ├── error-recovery.test.ts
│   │   ├── user-flow.test.tsx
│   │   └── graph-layout.test.tsx
│   └── utils/
│       ├── test-helpers.ts
│       ├── mock-data.ts
│       └── msw-handlers.ts
├── e2e/
│   ├── user-journeys.spec.ts
│   └── fixtures/
│       └── mock-responses.json
├── app/
│   ├── api/
│   │   ├── health/
│   │   │   └── __tests__/
│   │   │       └── route.test.ts
│   │   └── rabbitholes/
│   │       └── search/
│   │           └── __tests__/
│   │               └── route.test.ts
│   ├── components/
│   │   ├── __tests__/
│   │   │   ├── SearchView.test.tsx
│   │   │   └── RabbitFlow.test.tsx
│   │   ├── nodes/
│   │   │   └── __tests__/
│   │   │       └── MainNode.test.tsx
│   │   └── ui/
│   │       └── __tests__/
│   │           ├── bounce-cards.test.tsx
│   │           └── Modal.test.tsx
│   └── services/
│       └── __tests__/
│           ├── openaiService.test.ts
│           └── api.test.ts
├── vitest.config.ts
├── vitest.setup.ts
├── playwright.config.ts
└── TESTING_STRATEGY.md (this file)
```

---

## Appendix B: Sample Test Examples

### Unit Test Example
```typescript
// app/components/__tests__/SearchView.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SearchView from '../SearchView'
import * as api from '@/services/api'

vi.mock('@/services/api')

describe('SearchView', () => {
  it('renders oracle decks on initial load', () => {
    render(<SearchView />)
    expect(screen.getByText(/Thoth/i)).toBeInTheDocument()
    expect(screen.getByText(/Anubis/i)).toBeInTheDocument()
    expect(screen.getByText(/Isis/i)).toBeInTheDocument()
  })

  it('handles search submission', async () => {
    const mockSearch = vi.spyOn(api, 'searchRabbitHole')
      .mockResolvedValue({
        response: '## Test Response',
        followUpQuestions: ['Q1?', 'Q2?', 'Q3?'],
        sources: [],
        images: [],
      })

    render(<SearchView />)

    const input = screen.getByPlaceholderText(/Enter your query/i)
    fireEvent.change(input, { target: { value: 'AI' } })

    const submitBtn = screen.getByRole('button', { name: /search/i })
    fireEvent.click(submitBtn)

    expect(mockSearch).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'AI' }),
      expect.any(AbortSignal)
    )
  })
})
```

### Integration Test Example
```typescript
// __tests__/integration/search-flow.test.ts
import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/rabbitholes/search/route'

describe('Search Flow Integration', () => {
  it('completes full search with real service calls', async () => {
    const request = new Request('http://localhost:3000/api/rabbitholes/search', {
      method: 'POST',
      body: JSON.stringify({ query: 'quantum computing' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.response).toBeTruthy()
    expect(data.followUpQuestions).toHaveLength(3)
    expect(data.images).toBeInstanceOf(Array)
  })
})
```

### E2E Test Example
```typescript
// e2e/user-journeys.spec.ts
import { test, expect } from '@playwright/test'

test('user searches and explores follow-up questions', async ({ page }) => {
  await page.goto('/')

  // Initial search
  await page.fill('input[placeholder*="query"]', 'artificial intelligence')
  await page.click('button:has-text("Search")')

  // Wait for results
  await expect(page.locator('.react-flow')).toBeVisible()

  // Click first follow-up question
  const firstQuestion = page.locator('[data-node-type="question"]').first()
  await firstQuestion.click()

  // Verify new nodes appear
  await expect(page.locator('[data-node-type="question"]')).toHaveCount(4)
})
```

---

## Questions & Support

For questions about this testing strategy, contact:
- **GitHub Issues:** [rabbitholes/issues](https://github.com/gorkamolero/rabbitholes/issues)
- **Documentation:** See individual test files for inline examples

---

**Last Updated:** 2025-11-20
**Version:** 1.0
**Status:** 🚧 Not Implemented
