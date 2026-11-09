import type { World } from '@/components/watercolor/useWorld'

export type SceneLayout = {
  world: World
  unit: number
  horizon: number
  top: number
  portrait: boolean
}

export type Spot = { x: number; y: number }

const PANEL_SPACE = 0.2
const TRAY_SPACE = 0.06

export function sceneLayout(world: World): SceneLayout {
  const portrait = world.width < world.height
  const unit = Math.min(world.width / 1600, world.height / 900) * (portrait ? 1.7 : 1)
  return {
    world,
    unit,
    horizon: world.height * (portrait ? 0.42 : 0.46),
    top: world.height * PANEL_SPACE,
    portrait,
  }
}

export function placeSpots(
  layout: SceneLayout,
  fractions: readonly (readonly [number, number])[],
  fromY = layout.horizon,
): Spot[] {
  const { world } = layout
  const bottom = world.height * (1 - TRAY_SPACE)
  const margin = world.width * 0.08
  return fractions.map(([u, v]) => ({
    x: margin + u * (world.width - margin * 2),
    y: fromY + v * (bottom - fromY),
  }))
}
