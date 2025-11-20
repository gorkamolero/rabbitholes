import { test, expect } from '@playwright/test'

test.describe('Search Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('user lands on home page and sees oracle decks', async ({ page }) => {
    // Check for oracle deck headings
    await expect(page.getByText(/thoth/i)).toBeVisible()
    await expect(page.getByText(/anubis/i)).toBeVisible()
    await expect(page.getByText(/isis/i)).toBeVisible()

    // Check for search input
    const searchInput = page.getByPlaceholder(/enter your query/i)
    await expect(searchInput).toBeVisible()
  })

  test('user types query and submits search', async ({ page }) => {
    // Type in search query
    const searchInput = page.getByPlaceholder(/enter your query/i)
    await searchInput.fill('artificial intelligence')

    // Submit search (look for search button or press Enter)
    await searchInput.press('Enter')

    // Wait for loading state
    await expect(page.getByText(/seeking wisdom/i)).toBeVisible()

    // Wait for results (with extended timeout for API call)
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 15000 })
  })

  test('graph displays with central node containing response', async ({ page }) => {
    // Perform search
    const searchInput = page.getByPlaceholder(/enter your query/i)
    await searchInput.fill('quantum computing')
    await searchInput.press('Enter')

    // Wait for React Flow canvas to appear
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 15000 })

    // Check for nodes in the graph
    const nodes = page.locator('[data-id]')
    await expect(nodes.first()).toBeVisible()
  })
})
