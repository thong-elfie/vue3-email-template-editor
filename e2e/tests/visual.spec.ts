import { test, expect } from '@playwright/test'

// A.3 — Visual regression on composite blocks.
// Loads a rich starter template (which is built from composite blocks) and
// snapshots the rendered canvas. Run with `--update-snapshots` to (re)generate
// baselines after intentional visual changes.
test('composite blocks render consistently', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('iframe[title="Email Preview"]')).toBeVisible()

  await page.getByTestId('load-template').click()

  // Pin to the desktop width so the screenshot is deterministic.
  await page.locator('button[title="Desktop"]').click()

  const canvas = page.locator('.ebb-canvas__iframe-wrapper')
  await expect(canvas).toBeVisible()

  // Give MJML compile + iframe render time to settle.
  await page.waitForTimeout(1000)

  await expect(canvas).toHaveScreenshot('composite-blocks.png', {
    maxDiffPixelRatio: 0.02,
  })
})
