import type { SceneLayout } from '@/levels/kock/scene-layout'

export type PalaceLayout = {
  centerX: number
  base: number
  width: number
  height: number
  porticoWidth: number
  columnHeight: number
  slots: readonly number[]
}

export function palaceLayout(layout: SceneLayout): PalaceLayout {
  const { world, unit, ground, portrait } = layout
  const width = Math.min(world.width * (portrait ? 0.96 : 0.78), 1250 * unit)
  const height = width * 0.36
  const porticoWidth = width * (portrait ? 0.42 : 0.34)
  const columnHeight = height * 0.62
  const slots = [0, 1, 2, 3].map(
    (index) => world.width / 2 - porticoWidth / 2 + (porticoWidth * (index + 0.5)) / 4,
  )
  return {
    centerX: world.width / 2,
    base: ground + 20 * unit,
    width,
    height,
    porticoWidth,
    columnHeight,
    slots,
  }
}
