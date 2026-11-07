import type { IslandModel } from '@/lib/island/island-model'
import { createRandom } from '@/lib/island/noise'
import type { Vec2 } from '@/lib/island/polygon'

export type TreeKind = 'conifer' | 'broadleaf'

export type TreeInstance = {
  kind: TreeKind
  position: [number, number, number]
  scale: number
  rotation: number
  shade: number
}

function isFreeSpot(model: IslandModel, point: Vec2, clearance: number) {
  return model.places.every(
    (place) =>
      Math.hypot(point[0] - place.position[0], point[1] - place.position[1]) >
      place.footprint * place.scale + clearance,
  )
}

export function scatterTrees(model: IslandModel, maxCount: number): TreeInstance[] {
  const random = createRandom(1637)
  const { minX, maxX, minZ, maxZ } = model.bounds
  const trees: TreeInstance[] = []
  let attempts = 0
  while (trees.length < maxCount && attempts < maxCount * 12) {
    attempts++
    const x = minX + random() * (maxX - minX)
    const z = minZ + random() * (maxZ - minZ)
    if (!model.isInside([x, z])) continue
    const sample = model.sample(x, z)
    if (sample.edgeDistance < 0.18 || sample.wetness > 0.25) continue
    if (random() > sample.forest * 0.95 + 0.035) continue
    if (!isFreeSpot(model, [x, z], 0.15)) continue
    const conifer = sample.height > 0.7 || random() < 0.35 + sample.forest * 0.3
    trees.push({
      kind: conifer ? 'conifer' : 'broadleaf',
      position: [x, sample.height, z],
      scale: 0.75 + random() * 0.6,
      rotation: random() * Math.PI * 2,
      shade: random(),
    })
  }
  return trees
}

export function scatterWindmills(model: IslandModel, count: number) {
  const random = createRandom(1569)
  const { minX, maxX, minZ, maxZ } = model.bounds
  const spots: [number, number, number][] = []
  let attempts = 0
  while (spots.length < count && attempts < 4000) {
    attempts++
    const x = minX + random() * (maxX - minX)
    const z = minZ + random() * (maxZ - minZ)
    if (!model.isInside([x, z])) continue
    const sample = model.sample(x, z)
    if (sample.edgeDistance < 0.6 || sample.wetness > 0.05 || sample.forest > 0.2) continue
    if (!isFreeSpot(model, [x, z], 0.6)) continue
    if (spots.some(([sx, , sz]) => Math.hypot(sx - x, sz - z) < 3)) continue
    spots.push([x, sample.height, z])
  }
  return spots
}
