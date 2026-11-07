import { expect, test } from '@playwright/test'

test('Szaro wita gracza tylko przy pierwszej wizycie', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile',
    'Emulacja telefonu renderuje WebGL programowo, ekran ładowania nie zdąży się otworzyć',
  )
  test.setTimeout(120_000)
  await page.addInitScript(() => {
    if (localStorage.getItem('czarcia-lapa-paszport')) return
    const settings = { quality: 'low', musicVolume: 0.6, sfxVolume: 0.8 }
    const state = { stamps: {}, settings, introSeen: false }
    localStorage.setItem('czarcia-lapa-paszport', JSON.stringify({ state, version: 1 }))
  })

  await page.goto('/')
  const dialog = page.getByRole('dialog', { name: 'Szaro mówi' })
  await expect(dialog).toBeVisible({ timeout: 90_000 })
  await expect(dialog.getByText('Jestem Szaro')).toBeAttached()

  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  await expect(dialog.getByText('2 / 7')).toBeVisible()

  await dialog.getByRole('button', { name: 'Pomiń' }).click()
  await expect(dialog).toBeHidden()

  await page.reload()
  await expect(page.getByRole('status', { name: 'Ładowanie gry' })).toBeHidden({ timeout: 90_000 })
  await page.waitForTimeout(3_000)
  await expect(dialog).toBeHidden()
})
