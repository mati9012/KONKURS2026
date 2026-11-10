import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const RIDDLES: [string, string, string][] = [
  ['lepkich kropelek', 'sundew', 'To rosiczka'],
  ['kuliste jagody', 'cranberry', 'Żurawina błotna!'],
  ['Jestem mchem', 'sphagnum', 'Torfowiec zatrzymuje'],
  ['Jestem brzozą', 'birch', 'Brzoza niska to relikt'],
]

const VOICES: [string, string, string][] = [
  ['prumb', 'bittern', 'To bąk'],
  ['rzadki ptak', 'warbler', 'To wodniczka'],
  ['podobny do trąbki', 'crane', 'To żuraw'],
]

async function skipConversation(page: Page, text: string) {
  const narrator = page.getByRole('dialog', { name: 'Szaro mówi' })
  await expect(narrator.getByText(text)).toBeAttached({ timeout: 60_000 })
  await narrator.getByRole('button', { name: 'Pomiń' }).click()
}

async function guardTurtles(page: Page, factText: string) {
  const narrator = page.getByRole('dialog', { name: 'Szaro mówi' })
  for (let attempt = 0; attempt < 400; attempt++) {
    if (await narrator.getByText(factText).count()) break
    const predators = page.locator('[data-predator]:not([data-fleeing])')
    for (const predator of await predators.all()) await predator.dispatchEvent('click')
    await page.waitForTimeout(150)
  }
  await skipConversation(page, factText)
}

test(
  'Poleski Park Narodowy: żółwie, torfowisko i głosy mokradeł dają pieczęć',
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
    await page
      .getByRole('button', { name: 'Poleski Park Narodowy', exact: true })
      .dispatchEvent('click')
    await skipConversation(page, 'Witajcie w Poleskim Parku')
    await skipConversation(page, '1 maja 1990')

    const morning = page.getByRole('region', { name: 'Mglisty poranek' })
    await expect(morning.getByText('Żółwie w wodzie: 0 / 3')).toBeVisible()
    await page.waitForSelector('[data-predator]', { state: 'attached', timeout: 20_000 })
    await page.screenshot({ path: testInfo.outputPath('poleski-turtles.png') })
    await guardTurtles(page, 'Pierwsze maluchy w wodzie')
    await guardTurtles(page, 'od 6 do około 16 jaj')
    await guardTurtles(page, 'od 1935 roku')

    await skipConversation(page, 'wchodzimy na torfowisko')
    const bog = page.getByRole('region', { name: 'Torfowisko w południe' })
    await expect(bog.getByText('Rośliny: 0 / 4')).toBeVisible()
    await page.locator('[data-plant="sedge"]').first().dispatchEvent('click')
    await expect(bog.getByText('To nie ta roślina')).toBeVisible()
    for (let round = 0; round < RIDDLES.length; round++) {
      await expect(bog).toBeVisible()
      const riddle = await bog.innerText()
      const match = RIDDLES.find(([words]) => riddle.includes(words))
      if (!match) throw new Error(`Nieznana zagadka: ${riddle}`)
      await page.locator(`[data-plant="${match[1]}"]`).dispatchEvent('click')
      if (round === 1) await page.screenshot({ path: testInfo.outputPath('poleski-bog.png') })
      await skipConversation(page, match[2])
    }

    await skipConversation(page, 'Zapada wieczór')
    const voices = page.getByRole('region', { name: 'Głosy mokradeł' })
    await expect(voices.getByText('Ptaki: 0 / 3')).toBeVisible()
    await voices.getByRole('button', { name: 'Puchacz' }).click()
    await expect(voices.getByText('To nie ten ptak')).toBeVisible()
    for (const [clue, bird, fact] of VOICES) {
      await expect(voices.getByText(clue)).toBeVisible()
      await page.locator(`[data-choice="${bird}"]`).click()
      if (bird === 'crane')
        await page.screenshot({ path: testInfo.outputPath('poleski-voices.png') })
      await skipConversation(page, fact)
    }

    await expect(page.getByRole('img', { name: 'Pieczęć: Poleski Park Narodowy' })).toBeVisible({
      timeout: 30_000,
    })
    await skipConversation(page, 'Piękny dzień na mokradłach')
    const passport = page.getByRole('dialog', { name: 'Paszport Lubelski' })
    await expect(passport.getByText('Zebrane pieczęcie: 2 / 11')).toBeVisible()
  },
)
