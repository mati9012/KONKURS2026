import type { BirdId } from '@/content/poleski-park-narodowy'
import type { SceneLayout, Spot } from '@/levels/poleski-park-narodowy/scene-layout'

export function lakeLine({ world, horizon, unit }: SceneLayout) {
  return horizon + 70 * unit + (world.height - horizon) * 0.1
}

export function voicePerch(bird: BirdId, layout: SceneLayout): Spot {
  const { world, unit, portrait } = layout
  const shore = lakeLine(layout)
  const bottom = world.height
  if (bird === 'bittern')
    return { x: world.width * (portrait ? 0.22 : 0.16), y: bottom - 40 * unit }
  if (bird === 'warbler')
    return { x: world.width * (portrait ? 0.62 : 0.5), y: (shore + bottom) / 2 + 60 * unit }
  if (bird === 'crane') return { x: world.width * (portrait ? 0.8 : 0.82), y: bottom - 70 * unit }
  return { x: world.width * 0.5, y: shore }
}
