import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const ANSWERS: Record<string, string> = {
  wolf: 'Wilk',
  deer: 'Jeleń',
  boar: 'Dzik',
  beaver: 'Bóbr',
  owl: 'Puszczyk uralski',
}

const TREE_FACTS: Record<string, string> = {
  beech: 'To buk',
  fir: 'Jodła!',
  sycamore: 'Jawor!',
  yew: 'Cis!',
  spruce: 'Świerk!',
}

async function skipConversation(page: Page, text: string) {
  const narrator = page.getByRole('dialog', { name: 'Szaro mówi' })
  await expect(narrator.getByText(text)).toBeAttached({ timeout: 30_000 })
  await narrator.getByRole('button', { name: 'Pomiń' }).click()
}

async function digPiece(page: Page) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const piece = page.locator('[data-find="piece"]').first()
    if (await piece.count()) {
      await piece.dispatchEvent('click')
      return
    }
    const mound = page.locator('[data-mound]').first()
    for (let stroke = 0; stroke < 3; stroke++) await mound.dispatchEvent('click')
  }
  throw new Error('Nie znaleziono kawałka pnia')
}

test(
  'Roztocze: kamienny pień, nocne tropy i Bukowa Góra dają pieczęć',
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
    await page.getByRole('button', { name: 'Roztocze', exact: true }).dispatchEvent('click')
    await skipConversation(page, 'Witajcie na Roztoczu')
    await skipConversation(page, 'Czartowym Polu')

    const stones = page.getByRole('region', { name: 'Kamienny Las' })
    await expect(stones.getByText('Pień: 0 / 4')).toBeVisible()
    const coalMound = page.locator('[data-mound="0"]')
    for (let stroke = 0; stroke < 3; stroke++) await coalMound.dispatchEvent('click')
    await page.locator('[data-find="coal"]').first().dispatchEvent('click')
    await expect(stones.getByText('czarci węgiel')).toBeVisible()

    await digPiece(page)
    await skipConversation(page, 'Siedliskach')
    await digPiece(page)
    await page.screenshot({ path: testInfo.outputPath('roztocze-stones.png') })
    await skipConversation(page, 'cyprysy')
    await digPiece(page)
    await skipConversation(page, 'Pomieszam wam')
    await digPiece(page)
    await skipConversation(page, 'Jan Długosz')

    await skipConversation(page, 'Zadepczę wszystkie tropy')
    const forest = page.getByRole('region', { name: 'Nocny las' })
    await page.locator('[data-sign="devil"]').first().dispatchEvent('click')
    await expect(forest.getByText('moje kopyta')).toBeVisible()
    await page.locator('[data-sign="wolf"]').dispatchEvent('click')
    await forest.getByRole('button', { name: 'Dzik', exact: true }).click()
    await expect(forest.getByText('nie pasuje')).toBeVisible()
    await forest.getByRole('button', { name: 'Wilk', exact: true }).click()
    await skipConversation(page, 'sznurowanie')
    for (const animal of ['deer', 'boar', 'beaver', 'owl']) {
      await page.locator(`[data-sign="${animal}"]`).dispatchEvent('click')
      await forest.getByRole('button', { name: ANSWERS[animal], exact: true }).click()
      if (animal === 'beaver')
        await page.screenshot({ path: testInfo.outputPath('roztocze-night.png') })
      await skipConversation(page, ANSWERS[animal])
    }

    await skipConversation(page, 'Już świta')
    const hill = page.getByRole('region', { name: 'Bukowa Góra' })
    await page.locator('[data-tree="spruce"]').dispatchEvent('click')
    await expect(hill.getByText('gładką, szarą korą')).toBeVisible()
    for (const tree of Object.keys(TREE_FACTS)) {
      await page.locator(`[data-tree="${tree}"]`).dispatchEvent('click')
      if (tree === 'yew') await page.screenshot({ path: testInfo.outputPath('roztocze-dawn.png') })
      await skipConversation(page, TREE_FACTS[tree])
    }

    await expect(page.getByRole('img', { name: 'Pieczęć: Roztocze' })).toBeVisible({
      timeout: 30_000,
    })
    await skipConversation(page, 'Wschód słońca nad Bukową Górą')
    const passport = page.getByRole('dialog', { name: 'Paszport Lubelski' })
    await expect(passport.getByText('Zebrane pieczęcie: 2 / 11')).toBeVisible()
  },
)
