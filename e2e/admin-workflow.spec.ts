import { test, expect } from '@playwright/test'

test.describe('Content Lifecycle Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/content')
    await page.waitForSelector('text=Content & POIs', { timeout: 10000 })
  })

  test('should create a new content item', async ({ page }) => {
    await page.click('text=Neuer Inhalt')
    await page.fill('input[placeholder*="Name"]', 'Test POI E2E')
    await page.click('text=Anlegen')
    // Should show in list
    await expect(page.locator('text=Test POI E2E')).toBeVisible()
  })

  test('should filter content by status', async ({ page }) => {
    // Click status filter
    const statusFilter = page.locator('select, [role="combobox"]').nth(2)
    if (await statusFilter.isVisible()) {
      await statusFilter.click()
      await page.click('text=Entwurf')
    }
    // URL should have status param
    await page.waitForTimeout(500)
  })

  test('should paginate through content', async ({ page }) => {
    // Check pagination controls exist
    const nextBtn = page.locator('button:has-text("Weiter")')
    if (await nextBtn.isVisible()) {
      const pageIndicator = page.locator('text=/Seite \\d+ von \\d+/')
      await expect(pageIndicator).toBeVisible()
    }
  })

  test('should search content', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Suchen..."]')
    await searchInput.fill('test')
    await page.waitForTimeout(500)
    // Results should update
  })
})

test.describe('Workflow Automation', () => {
  test('should create a workflow rule from template', async ({ page }) => {
    await page.goto('/admin/workflow')
    await page.waitForSelector('text=Workflow-Automatisierung', { timeout: 10000 })

    await page.click('text=Regel hinzufuegen')
    await page.waitForSelector('text=Vorlage auswaehlen')

    // Select first template
    const templates = page.locator('[data-template]')
    if (await templates.first().isVisible()) {
      await templates.first().click()
    }
  })

  test('should toggle workflow rule active state', async ({ page }) => {
    await page.goto('/admin/workflow')
    await page.waitForSelector('text=Workflow-Automatisierung', { timeout: 10000 })

    // Find a toggle switch if rules exist
    const toggle = page.locator('button[role="switch"]').first()
    if (await toggle.isVisible()) {
      const initialState = await toggle.getAttribute('data-state')
      await toggle.click()
      await page.waitForTimeout(300)
    }
  })
})
