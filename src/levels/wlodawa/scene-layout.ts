import type { World } from '@/components/watercolor/useWorld'

export type SceneLayout = {
  world: World
  unit: number
  ground: number
  portrait: boolean
}

export function sceneLayout(world: World): SceneLayout {
  const portrait = world.width < world.height
  return {
    world,
    unit: Math.min(world.width / 1600, world.height / 900) * (portrait ? 1.6 : 1),
    ground: world.height * (portrait ? 0.74 : 0.72),
    portrait,
  }
}
