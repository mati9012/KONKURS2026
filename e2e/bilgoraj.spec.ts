import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function skipConversation(page: Page, text: string) {
  const narrator = page.getByRole('dialog', { name: 'Szaro mówi' })
  await expect(narrator.getByText(text)).toBeAttached({ timeout: 30_000 })
  await narrator.getByRole('button', { name: 'Pomiń' }).click()
}

async function pressOnBeat(page: Page, side: 'L' | 'R') {
  await page.evaluate(async () => {
    const loom = document.querySelector<HTMLElement>('[data-loom]')
    if (!loom) return
    const start = Number(loom.dataset.beatStart)
    const ms = Number(loom.dataset.beatMs)
    const next = Math.ceil((Date.now() - start) / ms) * ms + start
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, next - Date.now() + 15)))
  })
  await page
    .getByRole('button', { name: side === 'L' ? 'Lewy podnóżek' : 'Prawy podnóżek' })
    .dispatchEvent('click')
}

async function weaveRound(page: Page) {
  const pattern = await page
    .getByRole('list', { name: 'Wzór' })
    .getByRole('listitem')
    .allTextContents()
  for (const arrow of pattern) await pressOnBeat(page, arrow.trim() === '◀' ? 'L' : 'R')
}

async function sift(page: Page, sieve: string) {
  await page.locator(`[data-sieve="${sieve}"]`).dispatchEvent('click')
  const panel = page.getByRole('region', { name: 'Przesiewanie' })
  const shakeButton = panel.getByRole('button', { name: 'Potrząśnij', exact: true })
  await expect(shakeButton).toBeVisible()
  for (let attempt = 0; attempt < 8 && (await shakeButton.count()); attempt++) {
    await page.locator('[data-shake]').last().dispatchEvent('click')
  }
}

async function addIngredient(page: Page, id: string) {
  await page.locator(`[data-ingredient="${id}"]`).dispatchEvent('click')
  await page.locator('[data-drop]').dispatchEvent('click')
}

test(
  'Biłgoraj: sita, przesiewanie i pieróg dają pieczęć',
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
    await page.getByRole('button', { name: 'Biłgoraj', exact: true }).dispatchEvent('click')
    await skipConversation(page, 'Witajcie w Biłgoraju')
    await skipConversation(page, 'Poplątałem całe końskie włosie')

    const loom = page.getByRole('region', { name: 'Krojs sitarski' })
    await expect(loom.getByText('Siatki: 0 / 3')).toBeVisible()
    await pressOnBeat(page, 'R')
    await expect(loom.getByText('Spójrzcie na kartę')).toBeVisible()
    await weaveRound(page)
    await skipConversation(page, 'końskiego włosia')
    await weaveRound(page)
    await page.screenshot({ path: testInfo.outputPath('bilgoraj-loom.png') })
    await skipConversation(page, 'plecie się')
    await weaveRound(page)
    await skipConversation(page, 'nosiłkach')

    await skipConversation(page, 'nasypałem piasku')
    const sifting = page.getByRole('region', { name: 'Przesiewanie' })
    await page.locator('[data-sieve="fine"]').dispatchEvent('click')
    await page.locator('[data-shake]').last().dispatchEvent('click')
    await expect(sifting.getByText('oczka są za małe')).toBeVisible()
    await expect(page.locator('[data-sieve="fine"]')).toBeAttached()
    await sift(page, 'przetak')
    await skipConversation(page, 'przetaki')
    await sift(page, 'medium')
    await page.screenshot({ path: testInfo.outputPath('bilgoraj-sift.png') })
    await skipConversation(page, 'Kasza czysta')
    await sift(page, 'fine')
    await skipConversation(page, 'Puszysta mąka')

    await skipConversation(page, 'swoje słodkości')
    const pierog = page.getByRole('region', { name: 'Pieróg biłgorajski' })
    await addIngredient(page, 'jam')
    await expect(pierog.getByText('diabelska słodkość')).toBeVisible()
    for (const id of ['potatoes', 'quark', 'kasza', 'eggs', 'cream', 'mint']) {
      await addIngredient(page, id)
    }
    await skipConversation(page, 'Farsz gotowy')
    await pierog.getByRole('button', { name: 'Bez skórki' }).click()
    await skipConversation(page, '„łysy”')
    await pierog.getByRole('button', { name: 'Do pieca!' }).click()
    await expect(pierog.getByText('Za zimno')).toBeVisible()
    for (let step = 0; step < 3; step++)
      await pierog.getByRole('button', { name: 'Cieplej' }).click()
    await pierog.getByRole('button', { name: 'Do pieca!' }).click()
    await skipConversation(page, 'półtorej godziny')

    await expect(page.getByRole('img', { name: 'Pieczęć: Biłgoraj' })).toBeVisible({
      timeout: 30_000,
    })
    await skipConversation(page, 'Sita uplecione')
    const passport = page.getByRole('dialog', { name: 'Paszport Lubelski' })
    await expect(passport.getByText('Zebrane pieczęcie: 2 / 11')).toBeVisible()
  },
)
