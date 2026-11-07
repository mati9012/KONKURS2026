import { expect, test } from '@playwright/test'

const SCENE_SETTLE_MS = 3_000

test('ekran ładowania pokazuje pergamin z tytułem', async ({ page }, testInfo) => {
  await page.route('**/models/island*.glb', () => new Promise(() => {}))
  await page.goto('/')
  const loading = page.getByRole('status', { name: 'Ładowanie gry' })
  await expect(loading).toBeVisible()
  await expect(loading.getByText('Czarcia Łapa')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath(`loading-${testInfo.project.name}.png`) })
})

test('zrzut sceny wyspy do porównania z konceptem', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile',
    'Emulacja telefonu renderuje WebGL programowo, klatka trwa kilka sekund',
  )
  test.setTimeout(90_000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/')
  await expect(page.locator('main canvas')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByRole('status', { name: 'Ładowanie gry' })).toBeHidden({ timeout: 60_000 })
  await page.waitForTimeout(SCENE_SETTLE_MS)

  await page.screenshot({ path: testInfo.outputPath(`island-${testInfo.project.name}.png`) })
  expect(errors).toEqual([])
})
