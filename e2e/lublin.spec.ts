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

const CHASE = [
  { fact: 'ganki dla trębaczy', stops: ['krakowska', 'trynitarska', 'rynek'] },
  { fact: 'rusko-bizantyjskim', stops: ['trybunal', 'grodzka', 'zamek'] },
] as const

const FRESCO = [
  { fact: 'mistrza Andrzeja', scenes: ['majestat', 'duch', 'aniolowie'] },
  { fact: 'Józef Smoliński', scenes: ['zwiastowanie', 'krol', 'tablica'] },
] as const

const TRIAL = [
  { fact: 'Szczęście początkującego', evidence: ['morando', 'sito', 'kreda'] },
  { fact: 'Diabeł też umie sądzić', evidence: ['sybilla', 'swiatynie', 'zolw'] },
] as const

async function skipConversation(page: Page, text: string) {
  const narrator = page.getByRole('dialog', { name: 'Szaro mówi' })
  await expect(narrator.getByText(text)).toBeAttached({ timeout: 60_000 })
  await narrator.getByRole('button', { name: 'Pomiń' }).click()
}

async function rubSoot(page: Page) {
  const fresco = page.locator('[data-fresco]')
  const box = await page.locator('[data-soot]').boundingBox()
  if (!box) throw new Error('Brak sadzy')
  await expect(async () => {
    for (let y = box.y + box.height * 0.3; y < box.y + box.height * 0.95; y += 26) {
      await page.mouse.move(box.x + box.width * 0.05, y)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width * 0.95, y, { steps: 24 })
      await page.mouse.up()
    }
    await expect(fresco).toHaveAttribute('data-cleaned', 'true', { timeout: 1000 })
  }).toPass({ timeout: 60_000 })
}

async function placeEvidence(page: Page, card: string) {
  await page.locator(`[data-card="${card}"]`).dispatchEvent('click')
  await page.locator('[data-target="table"]').dispatchEvent('click')
}

test(
  'Lublin: pogoń, freski i rozprawa w Trybunale dają ostatnią pieczęć',
  { tag: '@scene' },
  async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Emulacja telefonu renderuje WebGL programowo, ekran ładowania nie zdąży się otworzyć',
    )
    test.setTimeout(300_000)
    await page.addInitScript((places) => {
      const settings = { quality: 'low', musicVolume: 0.6, sfxVolume: 0 }
      const earnedAt = '2026-11-10T10:00:00.000Z'
      const stamps = Object.fromEntries(places.map((place) => [place, { earnedAt }]))
      const state = { stamps, settings, introSeen: true }
      localStorage.setItem('czarcia-lapa-paszport', JSON.stringify({ state, version: 1 }))
    }, OTHER_PLACES)

    await page.goto('/')
    await expect(page.getByRole('status', { name: 'Ładowanie gry' })).toBeHidden({
      timeout: 90_000,
    })
    await page.getByRole('button', { name: 'Lublin', exact: true }).dispatchEvent('click')
    await skipConversation(page, 'w moim domu')
    await skipConversation(page, 'Złapcie mnie')

    const chase = page.getByRole('region', { name: 'Stare Miasto' })
    for (const [round, plan] of CHASE.entries()) {
      for (const [index, stop] of plan.stops.entries()) {
        if (round === 0 && index === 0) {
          await page.locator('[data-way="grodzka"]').click()
          await expect(chase.getByText('Pudło')).toBeVisible()
        }
        if (round === 0 && index === 1) {
          await page.waitForTimeout(1600)
          await page.screenshot({ path: testInfo.outputPath('lublin-chase.png') })
        }
        await page.locator(`[data-way="${stop}"]`).click()
        await expect(chase.getByText(`Skrzyżowania: ${index + 1} / 3`)).toBeVisible()
      }
      await skipConversation(page, plan.fact)
    }

    await skipConversation(page, 'Zamazałem wszystkie freski')
    const chapel = page.getByRole('region', { name: 'Kaplica Trójcy Świętej' })
    for (const [round, plan] of FRESCO.entries()) {
      await rubSoot(page)
      if (round === 0) {
        await page.locator('[data-scene="aniolowie"]').click()
        await expect(chapel.getByText('To nie ta scena')).toBeVisible()
      }
      for (const [index, scene] of plan.scenes.entries()) {
        if (round === 1 && index === 1) {
          await page.waitForTimeout(800)
          await page.screenshot({ path: testInfo.outputPath('lublin-fresco.png') })
        }
        await page.locator(`[data-scene="${scene}"]`).click()
        await expect(chapel.getByText(`Freski: ${index + 1} / 3`)).toBeVisible()
      }
      await skipConversation(page, plan.fact)
    }

    await skipConversation(page, 'diabły wydałyby')
    const trial = page.getByRole('region', { name: 'Trybunał Koronny' })
    for (const [round, plan] of TRIAL.entries()) {
      if (round === 0) {
        await placeEvidence(page, 'sito')
        await expect(trial.getByText('innej sprawy')).toBeVisible()
      }
      for (const [index, card] of plan.evidence.entries()) {
        if (round === 1 && index === 1) {
          await page.waitForTimeout(800)
          await page.screenshot({ path: testInfo.outputPath('lublin-trial.png') })
        }
        await placeEvidence(page, card)
        await expect(trial.getByText(`Obalone kłamstwa: ${index + 1} / 3`)).toBeVisible()
      }
      if (round === 1) {
        await expect(page.locator('[data-paw]')).toBeAttached()
        await page.waitForTimeout(1200)
        await page.screenshot({ path: testInfo.outputPath('lublin-paw.png') })
      }
      await skipConversation(page, plan.fact)
    }

    await expect(page.getByRole('img', { name: 'Pieczęć: Lublin' })).toBeVisible({
      timeout: 30_000,
    })
    await skipConversation(page, 'Stół z wypaloną')
    const passport = page.getByRole('dialog', { name: 'Paszport Lubelski' })
    await expect(passport.getByText('Zebrane pieczęcie: 11 / 11')).toBeVisible()
  },
)
