import type { World } from '@/components/watercolor/useWorld'

export type RoomLayout = {
  world: World
  unit: number
  floor: number
  centerX: number
  portrait: boolean
}

export function roomLayout(world: World): RoomLayout {
  const portrait = world.width < world.height
  const unit = Math.min(world.width / 1600, world.height / 900) * (portrait ? 1.6 : 1)
  return {
    world,
    unit,
    floor: world.height * (portrait ? 0.7 : 0.74),
    centerX: world.width / 2,
    portrait,
  }
}
