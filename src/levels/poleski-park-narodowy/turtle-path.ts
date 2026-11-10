import type { SceneLayout, Spot } from '@/levels/poleski-park-narodowy/scene-layout'

export type TurtlePath = {
  nest: Spot
  pond: Spot & { rx: number; ry: number }
  bushes: Spot[]
  at: (progress: number) => Spot
}

function bezier(a: number, b: number, c: number, d: number, t: number) {
  const u = 1 - t
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
}

export function turtlePath({ world, unit, horizon, portrait }: SceneLayout): TurtlePath {
  const { width, height } = world
  const nest = portrait
    ? { x: width * 0.2, y: height * 0.84 }
    : { x: width * 0.12, y: height * 0.8 }
  const pond = portrait
    ? { x: width * 0.72, y: height * 0.55, rx: width * 0.3, ry: 70 * unit }
    : { x: width * 0.84, y: height * 0.66, rx: width * 0.16, ry: 90 * unit }
  const end = { x: pond.x - pond.rx * 0.55, y: pond.y + pond.ry * 0.35 }
  const c1 = portrait ? { x: width * 0.9, y: height * 0.86 } : { x: width * 0.38, y: height * 0.96 }
  const c2 = portrait ? { x: width * 0.05, y: height * 0.66 } : { x: width * 0.5, y: height * 0.58 }
  const at = (progress: number) => {
    const t = Math.min(1, Math.max(0, progress))
    return {
      x: bezier(nest.x, c1.x, c2.x, end.x, t),
      y: bezier(nest.y, c1.y, c2.y, end.y, t),
    }
  }
  const bushes = [0.28, 0.46, 0.62, 0.76].map((share, index) => {
    const point = at(share)
    const ahead = at(share + 0.02)
    const length = Math.hypot(ahead.x - point.x, ahead.y - point.y) || 1
    const side = index % 2 === 0 ? -1 : 1
    const reach = 200 * unit * side
    return {
      x: Math.min(
        width - 60 * unit,
        Math.max(60 * unit, point.x - ((ahead.y - point.y) / length) * reach),
      ),
      y: Math.min(
        height - 40 * unit,
        Math.max(horizon + 80 * unit, point.y + ((ahead.x - point.x) / length) * reach),
      ),
    }
  })
  return { nest, pond, bushes, at }
}
