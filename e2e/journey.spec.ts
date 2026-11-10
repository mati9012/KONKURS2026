import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const OTHER_PLACES = [
  'zamosc',
  'kazimierz-dolny',
  'pulawy',
  'wlodawa',
  'poleski-park-narodowy',
  'roztocze',
  'zwierzyniec',
  'bilgoraj',
  'kock',
] as const

async function openMapWith(page: Page, places: readonly string[]) {
  await page.addInitScript((stamped) => {
    const settings = { quality: 'low', musicVolume: 0, sfxVolume: 0 }
    const earnedAt = '2026-11-10T10:00:00.000Z'
    const stamps = Object.fromEntries(stamped.map((place) => [place, { earnedAt }]))
    const state = { stamps, settings, introSeen: true }
    localStorage.setItem('czarcia-lapa-paszport', JSON.stringify({ state, version: 1 }))
  }, places)
  await page.goto('/')
  await expect(page.getByRole('status', { name: 'Ładowanie gry' })).toBeHidden({
    timeout: 90_000,
  })
}

test.describe('Chełm i Lublin', { tag: '@scene' }, () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Emulacja telefonu renderuje WebGL programowo, ekran ładowania nie zdąży się otworzyć',
    )
  })

  test('zostają zablokowane, dopóki brakuje choć jednej z 9 pieczęci', async ({ page }) => {
    await openMapWith(page, OTHER_PLACES.slice(0, 8))
    await expect(page.getByRole('button', { name: 'Chełm, zablokowane' })).toBeAttached()
    await expect(page.getByRole('button', { name: 'Lublin, zablokowane' })).toBeAttached()
  })

  test('otwierają się po 9 pieczęciach z pozostałych miejsc', async ({ page }) => {
    await openMapWith(page, OTHER_PLACES)
    await expect(page.getByRole('button', { name: 'Chełm', exact: true })).toBeAttached()
    await expect(page.getByRole('button', { name: 'Lublin', exact: true })).toBeAttached()
  })
})
