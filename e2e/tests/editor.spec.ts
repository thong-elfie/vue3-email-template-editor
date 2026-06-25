import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // Wait for the editor to mount and the canvas iframe to be present.
  await expect(page.locator('iframe[title="Email Preview"]')).toBeVisible()
})

test('add text block -> edit -> export HTML', async ({ page }) => {
  const textCount = page.getByTestId('text-count')
  const before = Number(await textCount.textContent())

  await page.getByTestId('add-text').click()
  await expect(textCount).toHaveText(String(before + 1))

  // Edit the inserted block's color, then verify it lands in the MJML export.
  await page.getByTestId('edit-color').click()
  await expect(page.getByTestId('mjml-output')).toContainText('#ff0000')

  // The compiled HTML export should be a real HTML document.
  await expect(page.getByTestId('html-output')).toContainText('<html')
})

test('load template -> modify -> verify content', async ({ page }) => {
  await page.getByTestId('load-template').click()

  // A real template has multiple sections and text blocks.
  await expect(page.getByTestId('section-count')).not.toHaveText('1')
  const textCount = page.getByTestId('text-count')
  const afterLoad = Number(await textCount.textContent())
  expect(afterLoad).toBeGreaterThan(1)

  // Modify: add a text block, confirm the content grows.
  await page.getByTestId('add-text').click()
  await expect(textCount).toHaveText(String(afterLoad + 1))
})

test('edit -> undo -> verify content reverts', async ({ page }) => {
  const textCount = page.getByTestId('text-count')
  const before = Number(await textCount.textContent())

  // Modify the default document, then undo it.
  await page.getByTestId('add-text').click()
  await expect(textCount).toHaveText(String(before + 1))

  await page.getByTestId('undo').click()
  await expect(textCount).toHaveText(String(before))
})

test('mobile preview -> verify iframe width', async ({ page }) => {
  const wrapper = page.locator('.ebb-canvas__iframe-wrapper')

  // Desktop preset is 600px wide.
  await page.locator('button[title="Desktop"]').click()
  await expect.poll(async () => (await wrapper.boundingBox())?.width).toBe(600)

  // Switch to mobile preset (320px).
  await page.locator('button[title="Mobile"]').click()
  await expect.poll(async () => (await wrapper.boundingBox())?.width).toBe(320)
})
