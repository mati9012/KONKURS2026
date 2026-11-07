import type { IslandModel } from '@/lib/island/island-model'
import { createRandom } from '@/lib/island/noise'
import type { Vec2 } from '@/lib/island/polygon'

export type TreeKind = 'pine' | 'oak' | 'birch'

export type TreeInstance = {
  kind: TreeKind
  position: [number, number, number]
  scale: number
  rotation: number
}

export type Spot = {
  position: [number, number, number]
  rotation: number
}

function isFreeSpot(model: IslandModel, point: Vec2, clearance: number) {
  return model.places.every((place) => {
    const [px, pz] = place.position
    const radius = place.footprint * place.scale
    if (Math.hypot(point[0] - px, point[1] - pz) <= radius + clearance) return false
    return (place.extras ?? []).every(
      (extra) =>
        Math.hypot(point[0] - px - extra.offset[0], point[1] - pz - extra.offset[1]) >
        extra.size * 0.6 + clearance,
    )
  })
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
    if (sample.edgeDistance < 0.25 || sample.wetness > 0.25) continue
    if (random() > sample.forest * 0.95 + 0.035) continue
    if (!isFreeSpot(model, [x, z], 0.1)) continue
    const conifer = sample.height > 0.7 || random() < 0.35 + sample.forest * 0.3
    trees.push({
      kind: conifer ? 'pine' : random() < 0.25 ? 'birch' : 'oak',
      position: [x, sample.height - 0.01, z],
      scale: 0.8 + random() * 0.5,
      rotation: random() * Math.PI * 2,
    })
  }
  return trees
}

type FarmSpotOptions = {
  count: number
  seed: number
  spacing: number
  clearance: number
}

export function scatterFarmSpots(model: IslandModel, options: FarmSpotOptions): Spot[] {
  const random = createRandom(options.seed)
  const { minX, maxX, minZ, maxZ } = model.bounds
  const spots: Spot[] = []
  let attempts = 0
  while (spots.length < options.count && attempts < options.count * 400) {
    attempts++
    const x = minX + random() * (maxX - minX)
    const z = minZ + random() * (maxZ - minZ)
    if (!model.isInside([x, z])) continue
    const sample = model.sample(x, z)
    if (sample.edgeDistance < 0.6 || sample.wetness > 0.05 || sample.forest > 0.3) continue
    if (!isFreeSpot(model, [x, z], options.clearance)) continue
    if (spots.some(({ position: [sx, , sz] }) => Math.hypot(sx - x, sz - z) < options.spacing)) {
      continue
    }
    spots.push({ position: [x, sample.height - 0.01, z], rotation: random() * Math.PI * 2 })
  }
  return spots
}
