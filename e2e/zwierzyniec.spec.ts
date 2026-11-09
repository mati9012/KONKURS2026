import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const PLANK_FOR_GAP: Record<string, string> = {
  wąska: 'Deska krótka',
  średnia: 'Deska średnia',
  szeroka: 'Deska długa',
}

async function skipConversation(page: Page, text: string) {
  const narrator = page.getByRole('dialog', { name: 'Szaro mówi' })
  await expect(narrator.getByText(text)).toBeAttached({ timeout: 30_000 })
  await narrator.getByRole('button', { name: 'Pomiń' }).click()
}

async function herdWave(page: Page, penned: number) {
  const result = await page.evaluate(async (target) => {
    const deadline = Date.now() + 180_000
    while (Date.now() < deadline) {
      const gate = document.querySelector<SVGRectElement>('[data-gate]')
      const svg = gate?.ownerSVGElement
      if (!gate || !svg) return 'no gate'
      if (document.querySelectorAll('[data-konik][data-penned="true"]').length >= target) {
        return 'done'
      }
      const box = gate.getBoundingClientRect()
      const gateX = box.x + box.width / 2
      const gateY = box.y + 40
      const free = [...document.querySelectorAll('[data-konik][data-penned="false"]')]
        .map((node) => {
          const rect = node.getBoundingClientRect()
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height * 0.8 }
        })
        .sort((a, b) => Math.hypot(a.x - gateX, a.y - gateY) - Math.hypot(b.x - gateX, b.y - gateY))
      const horse = free[0]
      const goat = document.querySelector('[data-szaro]')?.getBoundingClientRect()
      if (horse && goat) {
        const goatX = goat.x + goat.width / 2
        const goatY = goat.y + goat.height * 0.8
        const length = Math.hypot(horse.x - gateX, horse.y - gateY) || 1
        const ux = (horse.x - gateX) / length
        const uy = (horse.y - gateY) / length
        const behind = (goatX - horse.x) * ux + (goatY - horse.y) * uy
        const side = (goatX - horse.x) * -uy + (goatY - horse.y) * ux >= 0 ? 1 : -1
        const [aimX, aimY] =
          behind < 30
            ? [horse.x + ux * 110 - uy * side * 110, horse.y + uy * 110 + ux * side * 110]
            : [horse.x + ux * 50, horse.y + uy * 50]
        svg.dispatchEvent(
          new PointerEvent('pointermove', {
            clientX: aimX,
            clientY: aimY,
            pointerType: 'mouse',
            bubbles: true,
          }),
        )
      }
      await new Promise((resolve) => setTimeout(resolve, 80))
    }
    return 'timeout'
  }, penned)
  expect(result).toBe('done')
}

async function buildSection(page: Page) {
  const pond = page.getByRole('region', { name: 'Kładki do kościółka' })
  const gaps = page.getByRole('button', { name: /^Przerwa \d/ })
  const labels = await gaps.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('aria-label') ?? ''),
  )
  for (const label of labels) {
    const width = label.split(': ')[1]
    await pond.getByRole('button', { name: PLANK_FOR_GAP[width], exact: true }).first().click()
    await page.getByRole('button', { name: label, exact: true }).dispatchEvent('click')
  }
}

test(
  'Zwierzyniec: koniki w zagrodzie i kładka do kościółka dają pieczęć',
  { tag: '@scene' },
  async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Emulacja telefonu renderuje WebGL programowo, ekran ładowania nie zdąży się otworzyć',
    )
    test.setTimeout(600_000)
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
    await page.getByRole('button', { name: 'Zwierzyniec', exact: true }).dispatchEvent('click')
    await skipConversation(page, 'w samym sercu Roztocza')
    await skipConversation(page, 'Wyrwałem sztachety')

    const herd = page.getByRole('region', { name: 'Zagroda koników' })
    await expect(herd.getByText('W zagrodzie: 0 / 9')).toBeVisible()
    await herdWave(page, 2)
    await skipConversation(page, 'symbol Roztoczańskiego Parku Narodowego')
    await herdWave(page, 5)
    await page.screenshot({ path: testInfo.outputPath('zwierzyniec-herd.png') })
    await skipConversation(page, 'trzy koniki to nic')
    await herdWave(page, 9)
    await skipConversation(page, 'Tadeusz Vetulani')

    await skipConversation(page, 'Połamałem wszystkie kładki')
    const pond = page.getByRole('region', { name: 'Kładki do kościółka' })
    await pond.getByRole('button', { name: 'Deska krótka', exact: true }).first().click()
    await page.getByRole('button', { name: 'Przerwa 1: średnia' }).dispatchEvent('click')
    await expect(pond.getByText('Za krótka')).toBeVisible()
    await pond.getByRole('button', { name: /^Deska poczerniała/ }).click()
    await page.getByRole('button', { name: 'Przerwa 1: średnia' }).dispatchEvent('click')
    await expect(pond.getByText('spróchniała')).toBeVisible()

    await buildSection(page)
    await skipConversation(page, 'patron mostów')
    await buildSection(page)
    await page.screenshot({ path: testInfo.outputPath('zwierzyniec-bridge.png') })
    await skipConversation(page, 'nepomukami')
    await buildSection(page)
    await skipConversation(page, 'Łukasza Smuglewicza')

    await expect(pond.getByText('Kładki: 8 / 8')).toBeVisible()
    await expect(page.getByRole('img', { name: 'Pieczęć: Zwierzyniec' })).toBeVisible({
      timeout: 30_000,
    })
    await skipConversation(page, 'procesja z lampionami doszła')
    const passport = page.getByRole('dialog', { name: 'Paszport Lubelski' })
    await expect(passport.getByText('Zebrane pieczęcie: 2 / 11')).toBeVisible()
  },
)
