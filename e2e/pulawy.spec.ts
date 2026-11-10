import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const RIDDLES = [
  ['świątyni Westy', 'sybilla', 'pierwsze w Polsce muzeum'],
  ['spiczastymi oknami', 'gothic', 'To Dom Gotycki'],
  ['oranżerią', 'greek', 'To Domek Grecki'],
  ['Łuku Tytusa', 'roman-gate', 'To Brama Rzymska'],
  ['zadartym dachem', 'chinese', 'To Altana Chińska'],
  ['dla córki księżnej', 'marynka', 'To Pałac Marynki'],
] as const

const SALON = [
  {
    intro: 'Oto pierwsi goście',
    fact: 'Okres świetności',
    guests: [
      ['norblin', 'painter'],
      ['kniaznin', 'writer'],
      ['aigner', 'architect'],
    ],
  },
  {
    intro: 'Kolejni goście',
    fact: 'Malwinę',
    guests: [
      ['vogel', 'painter'],
      ['niemcewicz', 'writer'],
      ['hempel', 'architect'],
      ['lessel', 'musician'],
    ],
  },
  {
    intro: 'I ostatni goście',
    fact: 'natchnęła Woronicza',
    guests: [
      ['wojniakowski', 'painter'],
      ['woronicz', 'writer'],
      ['richter', 'painter'],
    ],
  },
] as const

const LAB_FACTS = ['Wyrosło!', 'Instytut powstał w 1950', 'Pszczoły zbierają nektar'] as const

async function skipConversation(page: Page, text: string) {
  const narrator = page.getByRole('dialog', { name: 'Szaro mówi' })
  await expect(narrator.getByText(text)).toBeAttached({ timeout: 60_000 })
  await narrator.getByRole('button', { name: 'Pomiń' }).click()
}

async function placeCard(page: Page, card: string, target: string) {
  await page.locator(`[data-card="${card}"]`).dispatchEvent('click')
  await page.locator(`[data-target="${target}"]`).dispatchEvent('click')
}

async function tendField(page: Page, fact: string, shot?: string) {
  const narrator = page.getByRole('dialog', { name: 'Szaro mówi' })
  let pending = shot
  for (let attempt = 0; attempt < 600; attempt++) {
    if (await narrator.getByText(fact).count()) break
    if (pending && (await page.locator('[data-plot][data-need="bees"]').count())) {
      await page.screenshot({ path: pending })
      pending = undefined
    }
    for (const plot of await page.locator('[data-plot]').all()) {
      const need = await plot.getAttribute('data-need')
      if (!need) continue
      await page.locator(`[data-tool="${need}"]`).click()
      await plot.dispatchEvent('click')
    }
    await page.waitForTimeout(150)
  }
  await skipConversation(page, fact)
}

test(
  'Puławy: park, salon Polskich Aten i poletko doświadczalne dają pieczęć',
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
    await page.getByRole('button', { name: 'Puławy', exact: true }).dispatchEvent('click')
    await skipConversation(page, 'Witajcie w Puławach')
    await skipConversation(page, 'Pochowam je po całym parku')

    const park = page.getByRole('region', { name: 'Park romantyczny' })
    for (let round = 0; round < RIDDLES.length; round++) {
      await expect(park.getByText(`Skarby: ${round} / ${RIDDLES.length}`)).toBeVisible()
      const text = await park.innerText()
      const match = RIDDLES.find(([words]) => text.includes(words))
      if (!match) throw new Error(`Nieznana zagadka: ${text}`)
      if (round === 0) {
        const wrong = RIDDLES.find(([, building]) => building !== match[1])?.[1] ?? 'sybilla'
        await page.locator(`[data-building="${wrong}"]`).dispatchEvent('click')
        await expect(park.getByText('To nie ta budowla')).toBeVisible()
      }
      if (round === 1) {
        await page.waitForTimeout(800)
        await page.screenshot({ path: testInfo.outputPath('pulawy-park.png') })
      }
      await page.locator(`[data-building="${match[1]}"]`).dispatchEvent('click')
      await skipConversation(page, match[2])
    }

    await skipConversation(page, 'Tylmana z Gameren')
    const salon = page.getByRole('region', { name: 'Salon Polskich Aten' })
    for (const [round, plan] of SALON.entries()) {
      await skipConversation(page, plan.intro)
      await expect(salon.getByText(`Goście: 0 / ${plan.guests.length}`)).toBeVisible()
      if (round === 0) {
        await placeCard(page, 'norblin', 'station-musician')
        await expect(salon.getByText('Nie tutaj!')).toBeVisible()
      }
      for (const [index, [guest, station]] of plan.guests.entries()) {
        if (round === 1 && index === 2) {
          await page.waitForTimeout(800)
          await page.screenshot({ path: testInfo.outputPath('pulawy-salon.png') })
        }
        await placeCard(page, guest, `station-${station}`)
      }
      await skipConversation(page, plan.fact)
    }

    await skipConversation(page, 'popsuję doświadczenia')
    const lab = page.getByRole('region', { name: 'Poletko doświadczalne' })
    await expect(lab.getByText('Dojrzałe: 0 / 3')).toBeVisible()
    await page.waitForSelector(
      '[data-plot][data-need="water"], [data-plot][data-need="fertilizer"]',
      {
        timeout: 20_000,
      },
    )
    const plot = page.locator('[data-plot]:not([data-need=""])').first()
    await plot.dispatchEvent('click')
    await expect(lab.getByText('Najpierw wybierzcie narzędzie')).toBeVisible()
    for (const [round, fact] of LAB_FACTS.entries()) {
      await tendField(page, fact, round === 2 ? testInfo.outputPath('pulawy-lab.png') : undefined)
    }

    await expect(page.getByRole('img', { name: 'Pieczęć: Puławy' })).toBeVisible({
      timeout: 30_000,
    })
    await skipConversation(page, 'Diabeł znowu przegrał')
    const passport = page.getByRole('dialog', { name: 'Paszport Lubelski' })
    await expect(passport.getByText('Zebrane pieczęcie: 2 / 11')).toBeVisible()
  },
)
