import { CHASE_STOP_IDS } from '@/content/lublin'
import type { ChaseStopId } from '@/content/lublin'
import type { SceneLayout } from '@/levels/lublin/scene-layout'

export type OldTownGeometry = {
  width: number
  startX: number
  stops: Record<ChaseStopId, number>
  spacing: number
  scale: number
  ground: number
}

export function oldTownGeometry(layout: SceneLayout): OldTownGeometry {
  const { world, unit, portrait } = layout
  const scale = unit * (portrait ? 0.9 : 0.85)
  const spacing = Math.max(world.width * 1.05, 900 * scale)
  const startX = world.width * 0.5
  const stops = Object.fromEntries(
    CHASE_STOP_IDS.map((id, index) => [id, startX + (index + 1) * spacing]),
  ) as Record<ChaseStopId, number>
  return {
    width: startX + (CHASE_STOP_IDS.length + 1) * spacing + world.width * 0.5,
    startX,
    stops,
    spacing,
    scale,
    ground: world.height * (portrait ? 0.76 : 0.8),
  }
}

export function stopX(geometry: OldTownGeometry, index: number) {
  if (index < 0) return geometry.startX
  return geometry.stops[CHASE_STOP_IDS[Math.min(index, CHASE_STOP_IDS.length - 1)]]
}
