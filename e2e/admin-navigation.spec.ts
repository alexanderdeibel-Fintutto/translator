import { test, expect } from '@playwright/test'

// E2E tests for the admin panel navigation and page loading
// These tests verify that all admin routes are reachable and render correctly

test.describe('Admin Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin area
    await page.goto('/admin')
    // Wait for the layout to load
    await page.waitForSelector('text=Fintutto World', { timeout: 10000 })
  })

  test('should show sidebar with all sections', async ({ page }) => {
    // Check section headers
    await expect(page.locator('text=CRM & Vertrieb')).toBeVisible()
    await expect(page.locator('text=Museum & Guide')).toBeVisible()
    await expect(page.locator('text=Translator & System')).toBeVisible()
  })

  test('should show Museum & Guide nav items', async ({ page }) => {
    // Expand Museum section if collapsed
    const museumSection = page.locator('text=Museum & Guide')
    await museumSection.click()

    // Check new Phase 1-3 nav items
    await expect(page.locator('nav >> text=Dashboard')).toBeVisible()
    await expect(page.locator('nav >> text=Sortierung')).toBeVisible()
    await expect(page.locator('nav >> text=Schnellbearbeitung')).toBeVisible()
    await expect(page.locator('nav >> text=Qualitaet')).toBeVisible()
    await expect(page.locator('nav >> text=Vorschau')).toBeVisible()
    await expect(page.locator('nav >> text=Workflow')).toBeVisible()
  })

  test('should navigate to Curator Dashboard', async ({ page }) => {
    await page.click('nav >> text=Dashboard')
    await expect(page).toHaveURL(/\/admin\/dashboard/)
    await expect(page.locator('text=Curator Dashboard')).toBeVisible()
  })

  test('should navigate to Content & POIs', async ({ page }) => {
    await page.click('nav >> text=Content & POIs')
    await expect(page).toHaveURL(/\/admin\/content/)
    await expect(page.locator('text=Content & POIs')).toBeVisible()
  })

  test('should navigate to Sort Order', async ({ page }) => {
    await page.click('nav >> text=Sortierung')
    await expect(page).toHaveURL(/\/admin\/content-sort/)
    await expect(page.locator('text=Reihenfolge sortieren')).toBeVisible()
  })

  test('should navigate to Quick Edit', async ({ page }) => {
    await page.click('nav >> text=Schnellbearbeitung')
    await expect(page).toHaveURL(/\/admin\/content-edit/)
    await expect(page.locator('text=Schnellbearbeitung')).toBeVisible()
  })

  test('should navigate to Quality Dashboard', async ({ page }) => {
    await page.click('nav >> text=Qualitaet')
    await expect(page).toHaveURL(/\/admin\/content-validation/)
  })

  test('should navigate to Preview', async ({ page }) => {
    await page.click('nav >> text=Vorschau')
    await expect(page).toHaveURL(/\/admin\/content-preview/)
    await expect(page.locator('text=Besucher-Vorschau')).toBeVisible()
  })

  test('should navigate to Workflow', async ({ page }) => {
    await page.click('nav >> text=Workflow')
    await expect(page).toHaveURL(/\/admin\/workflow/)
    await expect(page.locator('text=Workflow-Automatisierung')).toBeVisible()
  })
})

test.describe('Admin Dashboard', () => {
  test('should show stat cards', async ({ page }) => {
    await page.goto('/admin/dashboard')

    // Wait for dashboard to load
    await page.waitForSelector('text=Curator Dashboard', { timeout: 10000 })

    // Check stat labels
    await expect(page.locator('text=Gesamt')).toBeVisible()
    await expect(page.locator('text=Schnellzugriff')).toBeVisible()
  })

  test('should show quick action cards', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForSelector('text=Schnellzugriff', { timeout: 10000 })

    await expect(page.locator('text=Neuer Inhalt')).toBeVisible()
    await expect(page.locator('text=Import')).toBeVisible()
    await expect(page.locator('text=KI anreichern')).toBeVisible()
    await expect(page.locator('text=Analysen')).toBeVisible()
  })
})

test.describe('Workflow Manager', () => {
  test('should show template picker on add', async ({ page }) => {
    await page.goto('/admin/workflow')
    await page.waitForSelector('text=Workflow-Automatisierung', { timeout: 10000 })

    // Click add rule
    await page.click('text=Regel hinzufuegen')
    await expect(page.locator('text=Vorlage auswaehlen')).toBeVisible()
  })
})

test.describe('Visitor Preview', () => {
  test('should show device controls', async ({ page }) => {
    await page.goto('/admin/content-preview')
    await page.waitForSelector('text=Besucher-Vorschau', { timeout: 10000 })

    // Check device toggle buttons exist
    const deviceButtons = page.locator('[title="Mobil"], [title="Tablet"], [title="Desktop"]')
    await expect(deviceButtons).toHaveCount(3)
  })

  test('should show language selector', async ({ page }) => {
    await page.goto('/admin/content-preview')
    await page.waitForSelector('text=Besucher-Vorschau', { timeout: 10000 })

    // Check language label exists
    await expect(page.locator('text=Sprache').first()).toBeVisible()
  })
})
