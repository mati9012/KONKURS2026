import { BufferAttribute, BufferGeometry, Color } from 'three'
import { RIM_HEIGHT } from '@/lib/island/island-model'
import type { IslandModel } from '@/lib/island/island-model'
import { fbm, hash2 } from '@/lib/island/noise'
import type { Vec2 } from '@/lib/island/polygon'

const SPACING = 0.1
const UV_SCALE = 1.4
const WALL_ROWS = [0, 0.06, 0.3, 0.75, 1.25, 1.8, 2.3, 2.7]
const MOSS = new Color('#6f9a34')
const STONE = new Color('#ffffff')

type RimPoint = {
  point: Vec2
  outward: Vec2
  distance: number
}

function resample(model: IslandModel): RimPoint[] {
  const ring = model.boundary
  const points: Vec2[] = []
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]
    const b = ring[(i + 1) % ring.length]
    const length = Math.hypot(b[0] - a[0], b[1] - a[1])
    const steps = Math.max(1, Math.round(length / SPACING))
    for (let step = 0; step < steps; step++) {
      const t = step / steps
      points.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
    }
  }
  let distance = 0
  return points.map((point, index) => {
    const previous = points[(index - 1 + points.length) % points.length]
    const next = points[(index + 1) % points.length]
    if (index > 0) distance += Math.hypot(point[0] - previous[0], point[1] - previous[1])
    const dx = next[0] - previous[0]
    const dz = next[1] - previous[1]
    const length = Math.hypot(dx, dz) || 1
    let outward: Vec2 = [dz / length, -dx / length]
    if (model.isInside([point[0] + outward[0] * 0.05, point[1] + outward[1] * 0.05])) {
      outward = [-outward[0], -outward[1]]
    }
    return { point, outward, distance }
  })
}

export function buildCliffGeometry(model: IslandModel) {
  const rim = resample(model)
  const [cx, cz] = model.centroid
  const columns = rim.length
  const rows: { x: number; y: number; z: number; v: number; moss: number }[][] = []

  WALL_ROWS.forEach((depth, rowIndex) => {
    rows.push(
      rim.map(({ point, outward, distance }) => {
        const relief = rowIndex === 0 ? 0 : fbm(distance * 1.3, depth * 1.1, 3) * 0.16
        const inset = depth * 0.05
        return {
          x: point[0] + outward[0] * (relief - inset),
          y: RIM_HEIGHT - depth,
          z: point[1] + outward[1] * (relief - inset),
          v: depth / UV_SCALE,
          moss: 1 - Math.min(1, depth / 0.35),
        }
      }),
    )
  })

  const teeth = rim.map(({ distance }, index) => {
    const ridge = Math.max(0, fbm(distance * 0.7, 4.2, 3) + 0.25)
    const spike = hash2(index * 0.37, 9) > 0.86 ? 0.8 + hash2(index, 3) * 1.2 : 0
    return 0.6 + ridge * 2.4 + spike
  })

  const lowerLevels = [
    { extra: 0.5, pull: 0.25 },
    { extra: 1, pull: 0.7 },
  ]
  for (const level of lowerLevels) {
    rows.push(
      rim.map(({ point, outward }, index) => {
        const depth = WALL_ROWS[WALL_ROWS.length - 1] + teeth[index] * level.extra
        return {
          x: point[0] - outward[0] * (level.pull + teeth[index] * 0.12),
          y: RIM_HEIGHT - depth,
          z: point[1] - outward[1] * (level.pull + teeth[index] * 0.12),
          v: depth / UV_SCALE,
          moss: 0,
        }
      }),
    )
  }

  const coreLevels = [
    { scale: 0.82, depth: 4.4 },
    { scale: 0.55, depth: 5.6 },
    { scale: 0.28, depth: 6.6 },
  ]
  for (const level of coreLevels) {
    rows.push(
      rim.map(({ point, distance }, index) => {
        const jag =
          fbm(distance * 0.5, level.depth, 3) * 1.4 + (hash2(index, level.depth) - 0.5) * 0.4
        return {
          x: cx + (point[0] - cx) * level.scale,
          y: RIM_HEIGHT - level.depth - jag,
          z: cz + (point[1] - cz) * level.scale,
          v: (level.depth + jag) / UV_SCALE,
          moss: 0,
        }
      }),
    )
  }

  const positions: number[] = []
  const uvs: number[] = []
  const colors: number[] = []
  const color = new Color()
  for (const row of rows) {
    row.forEach((vertex, index) => {
      positions.push(vertex.x, vertex.y, vertex.z)
      uvs.push(rim[index].distance / UV_SCALE, vertex.v)
      color.copy(STONE).lerp(MOSS, vertex.moss)
      colors.push(color.r, color.g, color.b)
    })
  }
  const tipIndex = positions.length / 3
  positions.push(cx + 0.5, RIM_HEIGHT - 7.8, cz - 0.3)
  uvs.push(0, 7.8 / UV_SCALE)
  colors.push(1, 1, 1)

  const indices: number[] = []
  for (let row = 0; row < rows.length - 1; row++) {
    for (let column = 0; column < columns; column++) {
      const next = (column + 1) % columns
      const a = row * columns + column
      const b = row * columns + next
      const c = (row + 1) * columns + column
      const d = (row + 1) * columns + next
      indices.push(a, c, b, b, c, d)
    }
  }
  const lastRow = (rows.length - 1) * columns
  for (let column = 0; column < columns; column++) {
    indices.push(lastRow + column, tipIndex, lastRow + ((column + 1) % columns))
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}
