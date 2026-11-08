import { expect, test } from '@playwright/test'

test('strona startowa pokazuje tytuł i licznik pieczęci', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Czarcia Łapa' })).toBeVisible()
  await expect(page.getByText('Pieczęcie: 0/11')).toBeVisible()
  await expect(page.locator('main canvas')).toBeVisible({ timeout: 30_000 })
})
