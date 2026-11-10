import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const CRANE_FACTS = ['Pierwsze statki płyną', 'komięgami', 'UNESCO'] as const

const FACADES = [
  {
    fact: 'patronów właścicieli',
    pieces: [
      ['bishop', 'slot-mikolaj-relief'],
      ['giant', 'slot-krzysztof-relief'],
      ['pensive', 'slot-krzysztof-pensive'],
    ],
  },
  {
    fact: 'wysokie attyki',
    pieces: [
      ['attic-1', 'slot-mikolaj-attic'],
      ['attic-2', 'slot-krzysztof-attic'],
      ['arcade-1', 'slot-mikolaj-arcade'],
      ['arcade-2', 'slot-krzysztof-arcade'],
    ],
  },
] as const

const GORGE_FACTS = ['Pierwszy odcinek', 'głęboka, sucha dolina', 'Suchy less pęka'] as const

async function skipConversation(page: Page, text: string) {
  const narrator = page.getByRole('dialog', { name: 'Szaro mówi' })
  await expect(narrator.getByText(text)).toBeAttached({ timeout: 60_000 })
  await narrator.getByRole('button', { name: 'Pomiń' }).click()
}

async function placeCard(page: Page, card: string, target: string) {
  await page.locator(`[data-card="${card}"]`).dispatchEvent('click')
  await page.locator(`[data-target="${target}"]`).dispatchEvent('click')
}

async function loadBoats(page: Page) {
  await expect(page.getByRole('dialog', { name: 'Szaro mówi' })).toHaveCount(0)
  const result = await page.evaluate(async () => {
    const deadline = Date.now() + 90_000
    while (Date.now() < deadline) {
      const crane = document.querySelector<HTMLElement>('[data-crane]')
      if (!crane || document.querySelector('[role="dialog"]')) return 'done'
      if (crane.dataset.aligned === 'true') {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
      }
      await new Promise((resolve) => setTimeout(resolve, 16))
    }
    return 'timeout'
  })
  expect(result).toBe('done')
}

async function runGorge(page: Page) {
  await expect(page.getByRole('dialog', { name: 'Szaro mówi' })).toHaveCount(0)
  const result = await page.evaluate(async () => {
    const deadline = Date.now() + 60_000
    while (Date.now() < deadline) {
      const gorge = document.querySelector<HTMLElement>('[data-gorge]')
      if (!gorge || document.querySelector('[role="dialog"]')) return 'done'
      const gap = Number(gorge.dataset.nextGap)
      const kind = gorge.dataset.nextKind
      if (kind === 'root' && gap > 50 && gap < 140 && gorge.dataset.airborne === 'false') {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      }
      if (kind === 'branch' && gap > 20 && gap < 160 && gorge.dataset.ducking === 'false') {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
      }
      await new Promise((resolve) => setTimeout(resolve, 16))
    }
    return 'timeout'
  })
  expect(result).toBe('done')
}

test(
  'Kazimierz Dolny: spichlerze, kamienice Przybyłów i wąwóz lessowy dają pieczęć',
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
    await page.getByRole('button', { name: 'Kazimierz Dolny', exact: true }).dispatchEvent('click')
    await skipConversation(page, 'Witajcie w Kazimierzu Dolnym')
    await skipConversation(page, 'zatrzymam statki')

    const crane = page.getByRole('region', { name: 'Spichlerze nad Wisłą' })
    await expect(crane.getByText('Worki: 0 / 4')).toBeVisible()
    for (const [round, fact] of CRANE_FACTS.entries()) {
      if (round === 1) {
        await page.waitForTimeout(1500)
        await page.screenshot({ path: testInfo.outputPath('kazimierz-crane.png') })
      }
      await loadBoats(page)
      await skipConversation(page, fact)
    }

    await skipConversation(page, 'braci Mikołaja i Krzysztofa')
    const facade = page.getByRole('region', { name: 'Kamienice Przybyłów' })
    await placeCard(page, 'bishop', 'slot-krzysztof-relief')
    await expect(facade.getByText('To nie to miejsce')).toBeVisible()
    for (const [round, plan] of FACADES.entries()) {
      for (const [index, [piece, target]] of plan.pieces.entries()) {
        if (round === 1 && index === 2) {
          await page.waitForTimeout(800)
          await page.screenshot({ path: testInfo.outputPath('kazimierz-facade.png') })
        }
        await placeCard(page, piece, target)
      }
      await skipConversation(page, plan.fact)
    }

    await skipConversation(page, 'schowam się w wąwozie')
    for (const [leg, fact] of GORGE_FACTS.entries()) {
      if (leg === 1) {
        await page.waitForSelector('[data-gorge]', { state: 'attached', timeout: 20_000 })
        await page.waitForTimeout(2500)
        await page.screenshot({ path: testInfo.outputPath('kazimierz-gorge.png') })
      }
      await runGorge(page)
      await skipConversation(page, fact)
    }

    await expect(page.getByRole('img', { name: 'Pieczęć: Kazimierz Dolny' })).toBeVisible({
      timeout: 30_000,
    })
    await skipConversation(page, 'Kogucik pieje z radości')
    const passport = page.getByRole('dialog', { name: 'Paszport Lubelski' })
    await expect(passport.getByText('Zebrane pieczęcie: 2 / 11')).toBeVisible()
  },
)
