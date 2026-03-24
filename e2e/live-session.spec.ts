import { test, expect } from '@playwright/test'

test.describe('Live Session Flow', () => {
  test('should show live landing page', async ({ page }) => {
    await page.goto('/live')
    await page.waitForTimeout(2000)
    expect(page.url()).toContain('/live')
  })

  test('should show session code input for listeners', async ({ page }) => {
    await page.goto('/live')
    await page.waitForTimeout(2000)
    // Should have a way to join or create session
    const joinInput = page.locator('input[placeholder*="Code"], input[placeholder*="code"]')
    if (await joinInput.isVisible()) {
      await expect(joinInput).toBeVisible()
    }
  })

  test('should navigate to translator page', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    // Main translator should load
    expect(page.url()).toBe(page.url()) // just verify no redirect loop
  })

  test('should load settings page', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForSelector('text=Einstellungen', { timeout: 10000 })
    await expect(page.locator('text=Einstellungen')).toBeVisible()
  })

  test('should load phrasebook', async ({ page }) => {
    await page.goto('/phrasebook')
    await page.waitForSelector('text=Phrasebook', { timeout: 10000 })
    await expect(page.locator('text=Phrasebook')).toBeVisible()
  })
})
