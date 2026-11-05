import type { IslandModel } from '@/lib/island/island-model'
import { createRandom } from '@/lib/island/noise'
import type { Vec2 } from '@/lib/island/polygon'

export type CliffChunk = {
  variant: number
  point: Vec2
  outward: Vec2
  rotation: number
  widthJitter: number
  depthJitter: number
}

function outwardNormal(model: IslandModel, point: Vec2, direction: Vec2): Vec2 {
  const normal: Vec2 = [direction[1], -direction[0]]
  const probe: Vec2 = [point[0] + normal[0] * 0.05, point[1] + normal[1] * 0.05]
  return model.isInside(probe) ? [-normal[0], -normal[1]] : normal
}

export function layoutCliffChunks(model: IslandModel, spacing: number, variants: number) {
  const random = createRandom(1918)
  const exits = riverExitChunks(model).map((fall) => fall.point)
  const ring = model.boundary
  const chunks: CliffChunk[] = []
  let carried = 0
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]
    const b = ring[(i + 1) % ring.length]
    const length = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (length === 0) continue
    const direction: Vec2 = [(b[0] - a[0]) / length, (b[1] - a[1]) / length]
    let offset = spacing - carried
    while (offset <= length) {
      const point: Vec2 = [a[0] + direction[0] * offset, a[1] + direction[1] * offset]
      const nearExit = exits.some(
        (exit) => Math.hypot(exit[0] - point[0], exit[1] - point[1]) < spacing,
      )
      if (!nearExit) {
        chunks.push({
          variant: Math.floor(random() * variants),
          point,
          outward: outwardNormal(model, point, direction),
          rotation: random() * Math.PI * 2,
          widthJitter: 0.85 + random() * 0.35,
          depthJitter: 0.8 + random() * 0.5,
        })
      }
      offset += spacing
    }
    carried = length - (offset - spacing)
  }
  return chunks
}

export function riverExitChunks(model: IslandModel) {
  return model.rivers.flatMap((river) =>
    [river.exit, river.source].flatMap((fall) => (fall ? [fall] : [])),
  )
}
