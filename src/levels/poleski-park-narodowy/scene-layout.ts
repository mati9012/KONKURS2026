import type { World } from '@/components/watercolor/useWorld'

export type SceneLayout = {
  world: World
  unit: number
  horizon: number
  portrait: boolean
}

export type Spot = { x: number; y: number }

export function sceneLayout(world: World): SceneLayout {
  const portrait = world.width < world.height
  return {
    world,
    unit: Math.min(world.width / 1600, world.height / 900) * (portrait ? 1.6 : 1),
    horizon: world.height * (portrait ? 0.4 : 0.44),
    portrait,
  }
}
