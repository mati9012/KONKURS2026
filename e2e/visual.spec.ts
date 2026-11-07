import { expect, test } from '@playwright/test'

const SCENE_SETTLE_MS = 8_000

test('zrzut sceny wyspy do porównania z konceptem', async ({ page }, testInfo) => {
  test.setTimeout(90_000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/')
  await expect(page.locator('main canvas')).toBeVisible({ timeout: 30_000 })
  await page.waitForTimeout(SCENE_SETTLE_MS)

  await page.screenshot({ path: testInfo.outputPath(`island-${testInfo.project.name}.png`) })
  expect(errors).toEqual([])
})
