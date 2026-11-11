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

const HILL = [
  {
    fact: 'Wysoką Górką',
    pages: ['grod', 'cerkiew', 'miasto'],
  },
  {
    fact: 'otwarto dla turystów',
    pages: ['bazylika', 'dzwonnica', 'papiez'],
  },
] as const

const ARMS = [
  {
    fact: 'trzy dęby',
    parts: [
      ['field-green', 'slot-field'],
      ['oaks', 'slot-trees'],
    ],
  },
  {
    fact: 'kroczy w prawo',
    parts: [
      ['bear-white', 'slot-bear'],
      ['crown', 'slot-crown'],
    ],
  },
] as const

const TUNNEL = [
  { fact: 'około 9 stopni', items: ['pick', 'chalk', 'barrow'] },
  { fact: 'wodociągów', items: ['ladder', 'chest', 'barrel'] },
  { fact: 'Bieluch przegonił diabła', items: ['prop', 'paw', 'treasure'] },
] as const

async function skipConversation(page: Page, text: string) {
  const narrator = page.getByRole('dialog', { name: 'Szaro mówi' })
  await expect(narrator.getByText(text)).toBeAttached({ timeout: 60_000 })
  await narrator.getByRole('button', { name: 'Pomiń' }).click()
}

async function placeCard(page: Page, card: string, target: string) {
  await page.locator(`[data-card="${card}"]`).dispatchEvent('click')
  await page.locator(`[data-target="${target}"]`).dispatchEvent('click')
}

async function collectItem(page: Page, item: string) {
  const tunnel = page.locator('[data-tunnel]')
  const target = page.locator(`[data-item="${item}"]`)
  await expect(async () => {
    if ((await tunnel.getAttribute('data-dark')) === 'true') {
      await page.getByRole('button', { name: 'Poświata Bielucha' }).click()
    }
    await expect(tunnel).toHaveAttribute('data-dark', 'false')
    await target.click()
    await expect(target).toHaveCount(0, { timeout: 1000 })
  }).toPass({ timeout: 30_000 })
}

test(
  'Chełm: wzgórze, herb i podziemia kredowe dają pieczęć',
  { tag: '@scene' },
  async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Emulacja telefonu renderuje WebGL programowo, ekran ładowania nie zdąży się otworzyć',
    )
    test.setTimeout(300_000)
    await page.addInitScript((places) => {
      const settings = { quality: 'low', musicVolume: 0.6, sfxVolume: 0 }
      const earnedAt = '2026-11-09T10:00:00.000Z'
      const stamps = Object.fromEntries(places.map((place) => [place, { earnedAt }]))
      const state = { stamps, settings, introSeen: true }
      localStorage.setItem('czarcia-lapa-paszport', JSON.stringify({ state, version: 1 }))
    }, OTHER_PLACES)

    await page.goto('/')
    await expect(page.getByRole('status', { name: 'Ładowanie gry' })).toBeHidden({
      timeout: 90_000,
    })
    await page.getByRole('button', { name: 'Chełm', exact: true }).dispatchEvent('click')
    await skipConversation(page, 'Witajcie w Chełmie')
    await skipConversation(page, 'rozrzuciłem kartki kroniki')

    const hill = page.getByRole('region', { name: 'Góra Chełmska' })
    for (const [round, plan] of HILL.entries()) {
      for (const [index, pageId] of plan.pages.entries()) {
        if (round === 0 && index === 0) {
          await page.locator('[data-page="miasto"]').click()
          await expect(hill.getByText('Diabelski wiatr')).toBeVisible()
        }
        if (round === 1 && index === 1) {
          await page.waitForTimeout(1200)
          await page.screenshot({ path: testInfo.outputPath('chelm-hill.png') })
        }
        await page.locator(`[data-page="${pageId}"]`).click()
        await expect(hill.getByText(`Kartki: ${index + 1} / 3`)).toBeVisible()
      }
      await skipConversation(page, plan.fact)
    }

    await skipConversation(page, 'Rozbiłem herb Chełma')
    const arms = page.getByRole('region', { name: 'Herb Chełma' })
    for (const [round, plan] of ARMS.entries()) {
      if (round === 0) {
        await placeCard(page, 'field-red', 'slot-field')
        await expect(arms.getByText('diabelska podróbka')).toBeVisible()
      }
      for (const [index, [part, target]] of plan.parts.entries()) {
        if (round === 1 && index === 1) {
          await page.waitForTimeout(800)
          await page.screenshot({ path: testInfo.outputPath('chelm-arms.png') })
        }
        await placeCard(page, part, target)
      }
      await skipConversation(page, plan.fact)
    }

    await skipConversation(page, 'ciemno jak w piekle')
    const tunnel = page.getByRole('region', { name: 'Podziemia kredowe' })
    for (const [round, plan] of TUNNEL.entries()) {
      for (const [index, item] of plan.items.entries()) {
        if (round === 0 && index === 0) {
          await expect(page.locator('[data-tunnel]')).toHaveAttribute('data-dark', 'true', {
            timeout: 15_000,
          })
          await page.getByRole('button', { name: 'Poświata Bielucha' }).click()
          await expect(tunnel.getByText('Bieluch znów zapalił')).toBeVisible()
        }
        if (round === 0 && index === 1) {
          await page.mouse.move(640, 420)
          await page.waitForTimeout(600)
          await page.screenshot({ path: testInfo.outputPath('chelm-tunnel.png') })
        }
        await collectItem(page, item)
        await expect(tunnel.getByText(`Znalezione: ${index + 1} / 3`)).toBeVisible()
      }
      await skipConversation(page, plan.fact)
    }

    await expect(page.getByRole('img', { name: 'Pieczęć: Chełm' })).toBeVisible({
      timeout: 30_000,
    })
    await skipConversation(page, 'Chełm znów śpi spokojnie')
    const passport = page.getByRole('dialog', { name: 'Paszport Lubelski' })
    await expect(passport.getByText('Zebrane pieczęcie: 10 / 11')).toBeVisible()
  },
)
