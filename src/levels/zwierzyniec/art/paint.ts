import { createRandom, fbm } from '@/lib/noise'

type Point = readonly [number, number]

function round(value: number) {
  return Math.round(value * 10) / 10
}

function smoothClosedPath(points: readonly Point[]) {
  const count = points.length
  const at = (index: number) => points[(index + count) % count]
  let path = `M${round(at(0)[0])} ${round(at(0)[1])}`
  for (let index = 0; index < count; index++) {
    const [x0, y0] = at(index - 1)
    const [x1, y1] = at(index)
    const [x2, y2] = at(index + 1)
    const [x3, y3] = at(index + 2)
    const c1x = x1 + (x2 - x0) / 6
    const c1y = y1 + (y2 - y0) / 6
    const c2x = x2 - (x3 - x1) / 6
    const c2y = y2 - (y3 - y1) / 6
    path += `C${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(x2)} ${round(y2)}`
  }
  return `${path}Z`
}

export function blobPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  wobble = 0.14,
  points = 12,
) {
  const random = createRandom(seed)
  const shape: Point[] = []
  for (let index = 0; index < points; index++) {
    const angle = (index / points) * Math.PI * 2
    const scale = 1 + (random() * 2 - 1) * wobble
    shape.push([cx + Math.cos(angle) * rx * scale, cy + Math.sin(angle) * ry * scale])
  }
  return smoothClosedPath(shape)
}

export function ridgePath(
  width: number,
  baseY: number,
  amplitude: number,
  seed: number,
  bottom: number,
  frequency = 0.004,
) {
  const step = 28
  let path = `M-60 ${round(bottom)}`
  for (let x = -60; x <= width + 60; x += step) {
    const y = baseY + fbm(x * frequency + seed * 13.1, seed * 7.7, 4) * amplitude
    path += `L${round(x)} ${round(y)}`
  }
  return `${path}L${round(width + 60)} ${round(bottom)}Z`
}

export function scatter(
  seed: number,
  count: number,
  area: { x: number; y: number; width: number; height: number },
) {
  const random = createRandom(seed)
  return Array.from({ length: count }, () => ({
    x: area.x + random() * area.width,
    y: area.y + random() * area.height,
    size: 0.75 + random() * 0.5,
    tone: random(),
  }))
}
