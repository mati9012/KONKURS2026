import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const BUILD = [
  ['Pałac Zamoyskich', 'zachodni kraniec miasta'],
  ['Ulica Grodzka', 'oś od pałacu na wschód'],
  ['Rynek Wielki', 'wielki plac na wschodzie'],
  ['Ratusz', 'północny brzeg placu'],
  ['Kamienice z podcieniami', 'pierzeje wokół placu'],
  ['Kolegiata', 'na południe od osi'],
  ['Akademia Zamojska', 'na północ od osi'],
  ['Mury i 7 bastionów', 'skraj miasta'],
] as const

const BEATS = [0, 1, 2, 3, 4.5, 5, 6, 7]
const RING_PLACES = ['pierzeje wokół placu', 'skraj miasta']

async function dragCard(page: Page, card: string, place: string) {
  const build = page.getByRole('region', { name: 'Budowa miasta' })
  const from = await build.getByRole('button', { name: card, exact: true }).boundingBox()
  const socket = page.getByRole('button', { name: `Miejsce na planie: ${place}` })
  const target = await socket
    .locator('path')
    .first()
    .evaluate((path, ring) => {
      const shape = path as SVGPathElement
      const box = shape.getBBox()
      const local = ring
        ? shape.getPointAtLength(shape.getTotalLength() * 0.1)
        : new DOMPoint(box.x + box.width / 2, box.y + box.height / 2)
      const matrix = shape.getScreenCTM()
      if (!matrix) return null
      const point = new DOMPoint(local.x, local.y).matrixTransform(matrix)
      return { x: point.x, y: point.y }
    }, RING_PLACES.includes(place))
  if (!from || !target) throw new Error(`Brak karty ${card} albo miejsca ${place}`)
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(target.x, target.y, { steps: 12 })
  await page.mouse.up()
}

async function playRound(page: Page, direction: string, played: number) {
  const panel = page.getByRole('region', { name: 'Hejnał z wieży ratusza' })
  for (let attempt = 0; attempt < 4; attempt++) {
    await panel.getByRole('button', { name: direction, exact: true }).evaluate((button, beats) => {
      ;(button as HTMLButtonElement).click()
      for (const beat of beats) {
        setTimeout(
          () => window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' })),
          (2 + beat * 0.5) * 1000,
        )
      }
    }, BEATS)
    const passed = panel
      .getByText(`Zagrane strony: ${played + 1} / 3`)
      .or(page.getByRole('img', { name: 'Pieczęć: Zamość' }))
    await expect(passed.or(panel.getByText('zafałszował'))).toBeVisible({ timeout: 20_000 })
    if (await passed.isVisible()) return
  }
  throw new Error(`Hejnał na ${direction} się nie udał`)
}

test(
  'Zamość: budowa miasta i hejnał dają pieczęć w paszporcie',
  { tag: '@scene' },
  async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Emulacja telefonu renderuje WebGL programowo, ekran ładowania nie zdąży się otworzyć',
    )
    test.setTimeout(300_000)
    await page.addInitScript(() => {
      const settings = { quality: 'low', musicVolume: 0.6, sfxVolume: 0 }
      const state = { stamps: {}, settings, introSeen: true }
      localStorage.setItem('czarcia-lapa-paszport', JSON.stringify({ state, version: 1 }))
    })

    await page.goto('/')
    await expect(page.getByRole('status', { name: 'Ładowanie gry' })).toBeHidden({
      timeout: 90_000,
    })
    await expect(page.getByRole('button', { name: 'Chełm, zablokowane' })).toBeAttached()

    await page.getByRole('button', { name: 'Zamość', exact: true }).dispatchEvent('click')
    const narrator = page.getByRole('dialog', { name: 'Szaro mówi' })
    await expect(narrator.getByText('renesansowe miasto idealne')).toBeAttached()
    await narrator.getByRole('button', { name: 'Pomiń' }).click()

    await expect(narrator.getByText('Rozrzuciłem plany')).toBeAttached({ timeout: 60_000 })
    await narrator.getByRole('button', { name: 'Pomiń' }).click()

    const build = page.getByRole('region', { name: 'Budowa miasta' })
    await build.getByRole('button', { name: 'Ratusz' }).click()
    await page
      .getByRole('button', { name: 'Miejsce na planie: zachodni kraniec miasta' })
      .dispatchEvent('click')
    await expect(build.getByText('To nie ta budowla')).toBeVisible()

    for (const [index, [card, place]] of BUILD.entries()) {
      await dragCard(page, card, place)
      await expect(narrator).toBeVisible({ timeout: 15_000 })
      if (index === 3) await page.screenshot({ path: testInfo.outputPath('zamosc-build.png') })
      await narrator.getByRole('button', { name: 'Pomiń' }).click()
    }

    await expect(narrator.getByText('Miasto idealne stoi')).toBeAttached({ timeout: 15_000 })
    await narrator.getByRole('button', { name: 'Pomiń' }).click()

    const hejnal = page.getByRole('region', { name: 'Hejnał z wieży ratusza' })
    await hejnal.getByRole('button', { name: 'Zachód' }).click()
    await expect(hejnal.getByText('Nie na zachód!')).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('zamosc-hejnal.png') })

    await playRound(page, 'Północ', 0)
    await playRound(page, 'Wschód', 1)
    await playRound(page, 'Południe', 2)

    await expect(page.getByRole('img', { name: 'Pieczęć: Zamość' })).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByText('Pieczęcie: 1/11')).toBeVisible()
    await narrator.getByRole('button', { name: 'Pomiń' }).click()
    const passport = page.getByRole('dialog', { name: 'Paszport Lubelski' })
    await expect(passport.getByText('Zebrane pieczęcie: 1 / 11')).toBeVisible()
    await passport.getByRole('button', { name: 'Zamknij' }).click()
    await expect(page.getByRole('button', { name: 'Zamość, pieczęć zdobyta' })).toBeAttached()
    await expect(page.getByRole('button', { name: 'Kock', exact: true })).toBeAttached()
  },
)
