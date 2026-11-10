import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const MEMORY = [
  ['charter', 1417],
  ['palace-plan', 1779],
  ['shako', 1809],
  ['helmet', 1939],
  ['letter', 1941],
  ['wreath', 1969],
] as const

async function skipConversation(page: Page, text: string) {
  const narrator = page.getByRole('dialog', { name: 'Szaro mówi' })
  await expect(narrator.getByText(text)).toBeAttached({ timeout: 30_000 })
  await narrator.getByRole('button', { name: 'Pomiń' }).click()
}

async function placeCard(page: Page, card: string, target: string) {
  await page.locator(`[data-card="${card}"]`).dispatchEvent('click')
  await page.locator(`[data-target="${target}"]`).dispatchEvent('click')
}

async function fillPortico(page: Page, kind: string) {
  for (let slot = 0; slot < 4; slot++) {
    const card = page.locator(`[data-card^="${kind}-"]`).first()
    const id = await card.getAttribute('data-card')
    await placeCard(page, id ?? '', `slot-${slot}`)
  }
}

async function rideLeg(page: Page) {
  const result = await page.evaluate(async () => {
    const deadline = Date.now() + 60_000
    while (Date.now() < deadline) {
      const ride = document.querySelector<HTMLElement>('[data-ride]')
      if (!ride || document.querySelector('[role="dialog"]')) return 'done'
      const gap = Number(ride.dataset.nextGap)
      if (gap > 60 && gap < 150 && ride.dataset.airborne === 'false') {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
      }
      await new Promise((resolve) => setTimeout(resolve, 16))
    }
    return 'timeout'
  })
  expect(result).toBe('done')
}

test(
  'Kock: pałac, konny meldunek i izba pamięci dają pieczęć',
  { tag: '@scene' },
  async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Emulacja telefonu renderuje WebGL programowo, ekran ładowania nie zdąży się otworzyć',
    )
    test.setTimeout(300_000)
    await page.addInitScript(() => {
      const settings = { quality: 'low', musicVolume: 0.6, sfxVolume: 0 }
      const stamps = { zamosc: { earnedAt: '2026-11-09T10:00:00.000Z' } }
      const state = { stamps, settings, introSeen: true }
      localStorage.setItem('czarcia-lapa-paszport', JSON.stringify({ state, version: 1 }))
    })

    await page.goto('/')
    await expect(page.getByRole('status', { name: 'Ładowanie gry' })).toBeHidden({
      timeout: 90_000,
    })
    await page.getByRole('button', { name: 'Kock', exact: true }).dispatchEvent('click')
    await skipConversation(page, 'Witajcie w Kocku')
    await skipConversation(page, 'Powyrywałem kolumny')

    const palace = page.getByRole('region', { name: 'Pałac księżnej' })
    await placeCard(page, 'corinthian-4', 'slot-0')
    await expect(palace.getByText('baranich rogów')).toBeVisible()
    await fillPortico(page, 'ionic')
    await page.screenshot({ path: testInfo.outputPath('kock-palace.png') })
    await skipConversation(page, 'Portyk gotowy')
    await fillPortico(page, 'tuscan')
    await skipConversation(page, 'Skąd wy to wszystko wiecie')
    await palace.getByRole('button', { name: 'Kwadrat' }).click()
    await expect(palace.getByText('na kopycie')).toBeVisible()
    await palace.getByRole('button', { name: 'Podkowa' }).click()
    await skipConversation(page, 'planie podkowy')

    await skipConversation(page, 'rozrzucę kłody')
    await rideLeg(page)
    await page.screenshot({ path: testInfo.outputPath('kock-ride.png') })
    await skipConversation(page, 'Pierwszy odcinek')
    await rideLeg(page)
    await skipConversation(page, 'koń skacze jak zając')
    await rideLeg(page)
    await skipConversation(page, 'Meldunek dowieziony')

    await skipConversation(page, 'izby pamięci')
    const memory = page.getByRole('region', { name: 'Izba pamięci' })
    await placeCard(page, 'shako', 'year-1417')
    await expect(memory.getByText('To nie ten rok')).toBeVisible()
    for (const [card, year] of MEMORY.slice(0, 3)) await placeCard(page, card, `year-${year}`)
    await skipConversation(page, 'Pierwsza gablota')
    for (const [card, year] of MEMORY.slice(3)) await placeCard(page, card, `year-${year}`)
    await page.screenshot({ path: testInfo.outputPath('kock-memory.png') })
    await skipConversation(page, 'ostatnią bitwą kampanii')

    await expect(page.getByRole('img', { name: 'Pieczęć: Kock' })).toBeVisible({ timeout: 30_000 })
    await skipConversation(page, 'Pałac ma swoje kolumny')
    const passport = page.getByRole('dialog', { name: 'Paszport Lubelski' })
    await expect(passport.getByText('Zebrane pieczęcie: 2 / 11')).toBeVisible()
  },
)
