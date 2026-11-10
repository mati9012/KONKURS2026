import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const MARKET = [
  { orders: 2, fact: 'miasto handlu i przejazdu' },
  { orders: 3, fact: 'Ormianie, Czesi i Żydzi' },
  { orders: 3, fact: 'ponad 60% mieszkańców' },
] as const

const TEMPLES = [
  {
    fact: 'najlepiej zachowanych w Polsce',
    relics: [
      ['aron', 'synagogue'],
      ['iconostasis', 'cerkiew'],
      ['organ', 'church'],
    ],
  },
  {
    fact: 'odtworzono ją ze starych fotografii',
    relics: [
      ['bima', 'synagogue'],
      ['onion-dome', 'cerkiew'],
      ['twin-towers', 'church'],
    ],
  },
  {
    fact: 'zwoje Tory, chanukije i szofary',
    relics: [
      ['shofar', 'synagogue'],
      ['icon', 'cerkiew'],
      ['font', 'church'],
    ],
  },
] as const

const RIVER_FACTS = ['Pierwszy odcinek za nami', 'granicą Polski z Ukrainą', 'Meta!'] as const

async function skipConversation(page: Page, text: string) {
  const narrator = page.getByRole('dialog', { name: 'Szaro mówi' })
  await expect(narrator.getByText(text)).toBeAttached({ timeout: 60_000 })
  await narrator.getByRole('button', { name: 'Pomiń' }).click()
}

async function placeCard(page: Page, card: string, target: string) {
  await page.locator(`[data-card="${card}"]`).dispatchEvent('click')
  await page.locator(`[data-target="${target}"]`).dispatchEvent('click')
}

async function paddleLeg(page: Page) {
  const result = await page.evaluate(async () => {
    const deadline = Date.now() + 60_000
    while (Date.now() < deadline) {
      const river = document.querySelector<HTMLElement>('[data-river]')
      if (!river || document.querySelector('[role="dialog"]')) return 'done'
      const lane = Number(river.dataset.lane)
      const blocked = (river.dataset.blocked ?? '').split(' ').filter(Boolean).map(Number)
      if (blocked.includes(lane)) {
        const free = [0, 1, 2]
          .filter((option) => !blocked.includes(option))
          .sort((a, b) => Math.abs(a - lane) - Math.abs(b - lane))[0]
        const key = free < lane ? 'ArrowLeft' : 'ArrowRight'
        window.dispatchEvent(new KeyboardEvent('keydown', { key }))
      }
      await new Promise((resolve) => setTimeout(resolve, 40))
    }
    return 'timeout'
  })
  expect(result).toBe('done')
}

test(
  'Włodawa: Czworobok, trzy świątynie i spływ Bugiem dają pieczęć',
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
    await page.getByRole('button', { name: 'Włodawa', exact: true }).dispatchEvent('click')
    await skipConversation(page, 'Witajcie we Włodawie')
    await skipConversation(page, 'Pomieszałem wszystkie towary')

    const market = page.getByRole('region', { name: 'Czworobok na rynku' })
    const customer = page.locator('[data-target="customer"]')
    for (const [round, plan] of MARKET.entries()) {
      await expect(market.getByText(`Klienci: 0 / ${plan.orders}`)).toBeVisible()
      if (round === 0) {
        const wants = await customer.getAttribute('data-wants')
        const wrong = wants === 'pot' ? 'candles' : 'pot'
        await placeCard(page, wrong, 'customer')
        await expect(market.getByText('Klient kręci głową')).toBeVisible()
      }
      for (let served = 0; served < plan.orders; served++) {
        await expect(market.getByText(`Klienci: ${served} / ${plan.orders}`)).toBeVisible()
        await expect(customer).toHaveCount(1)
        const wants = await customer.getAttribute('data-wants')
        if (round === 1 && served === 1)
          await page.screenshot({ path: testInfo.outputPath('wlodawa-market.png') })
        await placeCard(page, wants ?? '', 'customer')
        if (served + 1 < plan.orders)
          await expect(market.getByText(`Klienci: ${served + 1} / ${plan.orders}`)).toBeVisible()
      }
      await skipConversation(page, plan.fact)
    }

    await skipConversation(page, 'świątyń trzech religii')
    const temples = page.getByRole('region', { name: 'Trzy świątynie' })
    await placeCard(page, 'aron', 'temple-church')
    await expect(temples.getByText('To nie ta świątynia')).toBeVisible()
    for (const [round, plan] of TEMPLES.entries()) {
      for (const [index, [relic, temple]] of plan.relics.entries()) {
        if (round === 1 && index === 2) {
          await page.waitForTimeout(1200)
          await page.screenshot({ path: testInfo.outputPath('wlodawa-temples.png') })
        }
        await placeCard(page, relic, `temple-${temple}`)
      }
      await skipConversation(page, plan.fact)
    }

    await skipConversation(page, 'spływ kajakiem')
    for (const [leg, fact] of RIVER_FACTS.entries()) {
      if (leg === 1) {
        await page.waitForSelector('[data-obstacle]', { state: 'attached', timeout: 20_000 })
        await page.screenshot({ path: testInfo.outputPath('wlodawa-river.png') })
      }
      await paddleLeg(page)
      await skipConversation(page, fact)
    }

    await expect(page.getByRole('img', { name: 'Pieczęć: Włodawa' })).toBeVisible({
      timeout: 30_000,
    })
    await skipConversation(page, 'Miastem Trzech Kultur')
    const passport = page.getByRole('dialog', { name: 'Paszport Lubelski' })
    await expect(passport.getByText('Zebrane pieczęcie: 2 / 11')).toBeVisible()
  },
)
