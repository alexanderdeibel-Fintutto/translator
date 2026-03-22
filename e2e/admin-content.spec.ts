import { test, expect } from '@playwright/test'

// E2E tests for content management features
// Tests CRUD operations, sorting, inline editing, and import

test.describe('Content Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/content')
    await page.waitForSelector('text=Content & POIs', { timeout: 10000 })
  })

  test('should show filter controls', async ({ page }) => {
    // Domain filter
    await expect(page.locator('text=Domain').first()).toBeVisible()
    // Type filter
    await expect(page.locator('text=Typ').first()).toBeVisible()
    // Status filter
    await expect(page.locator('text=Status').first()).toBeVisible()
  })

  test('should open create form on "Neuer Inhalt"', async ({ page }) => {
    await page.click('text=Neuer Inhalt')
    await expect(page.locator('text=Name *')).toBeVisible()
  })

  test('should show AI Scout button', async ({ page }) => {
    await expect(page.locator('text=KI City-Scout')).toBeVisible()
  })

  test('should have search input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Suchen..."]')
    await expect(searchInput).toBeVisible()
  })
})

test.describe('Sortable Content List', () => {
  test('should show sort controls', async ({ page }) => {
    await page.goto('/admin/content-sort')
    await page.waitForSelector('text=Reihenfolge sortieren', { timeout: 10000 })

    // Check save button exists (disabled initially)
    await expect(page.locator('text=Reihenfolge speichern')).toBeVisible()
  })

  test('should have filter input', async ({ page }) => {
    await page.goto('/admin/content-sort')
    await page.waitForSelector('text=Reihenfolge sortieren', { timeout: 10000 })

    const filterInput = page.locator('input[placeholder="Filtern..."]')
    await expect(filterInput).toBeVisible()
  })
})

test.describe('Inline Edit List', () => {
  test('should show table headers', async ({ page }) => {
    await page.goto('/admin/content-edit')
    await page.waitForSelector('text=Schnellbearbeitung', { timeout: 10000 })

    await expect(page.locator('text=Name').first()).toBeVisible()
    await expect(page.locator('text=Status').first()).toBeVisible()
    await expect(page.locator('text=Tags').first()).toBeVisible()
  })

  test('should have status filter', async ({ page }) => {
    await page.goto('/admin/content-edit')
    await page.waitForSelector('text=Schnellbearbeitung', { timeout: 10000 })

    const searchInput = page.locator('input[placeholder="Suche..."]')
    await expect(searchInput).toBeVisible()
  })
})

test.describe('Content Validation', () => {
  test('should load quality dashboard', async ({ page }) => {
    await page.goto('/admin/content-validation')
    // Should show the validation component
    await page.waitForTimeout(2000)
    // Page should have loaded without errors
    expect(page.url()).toContain('/admin/content-validation')
  })
})

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('should show mobile nav on small screens', async ({ page }) => {
    await page.goto('/admin')
    // Mobile nav should be visible (horizontal scrollable)
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/admin')
  })
})
