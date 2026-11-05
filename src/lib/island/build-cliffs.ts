import { BufferAttribute, BufferGeometry, Color } from 'three'
import { RIM_HEIGHT } from '@/lib/island/island-model'
import type { IslandModel } from '@/lib/island/island-model'
import { hash2, valueNoise } from '@/lib/island/noise'

const RINGS = [
  { depth: 0, scale: 1 },
  { depth: 0.22, scale: 0.995 },
  { depth: 0.8, scale: 0.955 },
  { depth: 1.7, scale: 0.85 },
  { depth: 2.7, scale: 0.68 },
  { depth: 3.7, scale: 0.47 },
  { depth: 4.6, scale: 0.26 },
]

const BOTTOM_DEPTH = 6.4

const STRATA = ['#6b4526', '#9a6b45', '#b9855a', '#8a5d3f', '#c49a6c', '#7a5238', '#5e4535'].map(
  (hex) => new Color(hex),
)

const GRASS_LIP = new Color('#5f8f2f')

export function buildCliffGeometry(model: IslandModel) {
  const { boundary, centroid } = model
  const rings = RINGS.map((ring, ringIndex) =>
    boundary.map(([x, z], index) => {
      const spike = ringIndex >= 3 ? valueNoise(index * 0.35, ringIndex) * 1.3 : 0
      const jitter = ringIndex === 0 ? 0 : (hash2(index, ringIndex) - 0.5) * 0.25 * ringIndex
      const scale = ring.scale + (ringIndex === 0 ? 0 : (hash2(index * 3, ringIndex) - 0.5) * 0.05)
      return [
        centroid[0] + (x - centroid[0]) * scale + jitter,
        RIM_HEIGHT - ring.depth - spike,
        centroid[1] + (z - centroid[1]) * scale + jitter,
      ] as const
    }),
  )

  const positions: number[] = []
  const colors: number[] = []
  const color = new Color()
  const pushFace = (points: (readonly [number, number, number])[], faceColor: Color) => {
    for (const point of points) {
      positions.push(point[0], point[1], point[2])
      colors.push(faceColor.r, faceColor.g, faceColor.b)
    }
  }

  for (let ringIndex = 0; ringIndex < rings.length - 1; ringIndex++) {
    const upper = rings[ringIndex]
    const lower = rings[ringIndex + 1]
    for (let i = 0; i < upper.length; i++) {
      const next = (i + 1) % upper.length
      const band =
        ringIndex === 0 ? GRASS_LIP : STRATA[(ringIndex + Math.floor(i / 9)) % STRATA.length]
      color.copy(band).multiplyScalar(0.88 + hash2(i, ringIndex * 5) * 0.2)
      pushFace([upper[i], lower[i], upper[next]], color)
      pushFace([upper[next], lower[i], lower[next]], color)
    }
  }

  const tip = [centroid[0] + 0.6, RIM_HEIGHT - BOTTOM_DEPTH, centroid[1] - 0.4] as const
  const last = rings[rings.length - 1]
  for (let i = 0; i < last.length; i++) {
    color.copy(STRATA[STRATA.length - 1]).multiplyScalar(0.85 + hash2(i, 99) * 0.2)
    pushFace([last[i], tip, last[(i + 1) % last.length]], color)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3))
  geometry.computeVertexNormals()
  return geometry
}
