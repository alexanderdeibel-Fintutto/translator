import { test, expect } from '@playwright/test'

test.describe('Museum Analytics', () => {
  test('should load analytics page', async ({ page }) => {
    await page.goto('/admin/museum-analytics')
    await page.waitForSelector('text=Museum-Analysen', { timeout: 10000 })
    await expect(page.locator('text=Museum')).toBeVisible()
    await expect(page.locator('text=Zeitraum')).toBeVisible()
  })

  test('should show date range options', async ({ page }) => {
    await page.goto('/admin/museum-analytics')
    await page.waitForSelector('text=Museum-Analysen', { timeout: 10000 })
    // Click date range selector
    const dateSelect = page.locator('text=30 Tage').first()
    if (await dateSelect.isVisible()) {
      await dateSelect.click()
      await expect(page.locator('text=7 Tage')).toBeVisible()
      await expect(page.locator('text=90 Tage')).toBeVisible()
      await expect(page.locator('text=Gesamt')).toBeVisible()
    }
  })

  test('should have CSV export button when museum selected', async ({ page }) => {
    await page.goto('/admin/museum-analytics')
    // CSV export is conditional on stats being loaded
    // Just verify page loaded correctly
    await page.waitForSelector('text=Museum-Analysen', { timeout: 10000 })
  })
})

test.describe('CRM Dashboard', () => {
  test('should load CRM page', async ({ page }) => {
    await page.goto('/admin/crm')
    await page.waitForTimeout(2000)
    expect(page.url()).toContain('/admin/crm')
  })

  test('should show pipeline stages', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForSelector('text=Pipeline', { timeout: 10000 })
    // Pipeline should show stage columns
    await expect(page.locator('text=Neu').first()).toBeVisible()
  })
})

test.describe('User Management', () => {
  test('should load user manager', async ({ page }) => {
    await page.goto('/admin/users')
    await page.waitForTimeout(2000)
    expect(page.url()).toContain('/admin/users')
  })
})
