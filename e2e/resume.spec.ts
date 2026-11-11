import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const OTHER_PLACES = [
  'zamosc',
  'kazimierz-dolny',
  'chelm',
  'pulawy',
  'wlodawa',
  'poleski-park-narodowy',
  'roztocze',
  'zwierzyniec',
  'bilgoraj',
  'kock',
] as const

async function skipConversation(page: Page, text: string) {
  const narrator = page.getByRole('dialog', { name: 'Szaro mówi' })
  await expect(narrator.getByText(text)).toBeAttached({ timeout: 60_000 })
  await narrator.getByRole('button', { name: 'Pomiń' }).click()
}

async function waitForMap(page: Page) {
  await expect(page.getByRole('status', { name: 'Ładowanie gry' })).toBeHidden({
    timeout: 90_000,
  })
}

test(
  'etap miasta zostaje po odświeżeniu strony i po powrocie na mapę',
  { tag: '@scene' },
  async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Emulacja telefonu renderuje WebGL programowo, ekran ładowania nie zdąży się otworzyć',
    )
    test.setTimeout(240_000)
    await page.addInitScript((places) => {
      if (localStorage.getItem('czarcia-lapa-paszport')) return
      const settings = { quality: 'low', musicVolume: 0.6, sfxVolume: 0 }
      const earnedAt = '2026-11-10T10:00:00.000Z'
      const stamps = Object.fromEntries(places.map((place) => [place, { earnedAt }]))
      const state = { stamps, settings, introSeen: true }
      localStorage.setItem('czarcia-lapa-paszport', JSON.stringify({ state, version: 1 }))
    }, OTHER_PLACES)

    await page.goto('/')
    await waitForMap(page)
    await page.getByRole('button', { name: 'Lublin', exact: true }).dispatchEvent('click')
    await skipConversation(page, 'w moim domu')
    await skipConversation(page, 'Złapcie mnie')
    const chase = page.getByRole('region', { name: 'Stare Miasto' })
    for (const [index, stop] of ['krakowska', 'trynitarska', 'rynek'].entries()) {
      await page.locator(`[data-way="${stop}"]`).last().click()
      await expect(chase.getByText(`Skrzyżowania: ${index + 1} / 3`)).toBeVisible()
    }
    await skipConversation(page, 'ganki dla trębaczy')
    await expect(page.locator('[data-chase]')).toHaveAttribute('data-reached', '3')

    await page.reload()
    await waitForMap(page)
    await expect(page.locator('[data-way="trybunal"]')).toBeVisible({ timeout: 30_000 })
    await expect(page.locator('[data-chase]')).toHaveAttribute('data-reached', '3')
    await page.screenshot({ path: testInfo.outputPath('resume-after-reload.png') })

    await page.getByRole('button', { name: 'Wróć na mapę' }).click()
    await page.getByRole('button', { name: 'Lublin', exact: true }).dispatchEvent('click')
    await skipConversation(page, 'w moim domu')
    await expect(page.locator('[data-way="trybunal"]')).toBeVisible({ timeout: 30_000 })
    await expect(page.locator('[data-chase]')).toHaveAttribute('data-reached', '3')
  },
)
