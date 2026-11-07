import { mkdirSync, writeFileSync } from 'node:fs'
import type { BufferGeometry } from 'three'
import { buildCliffGeometry } from './island/build-cliffs'
import { buildTerrainGeometry } from './island/build-terrain'
import { buildWaterGeometry } from './island/build-water'
import { layoutCliffChunks, riverExitChunks } from './island/cliff-layout'
import { getIslandModel, RIM_HEIGHT, WATER_OFFSET } from './island/island-model'
import type { IslandModel } from './island/island-model'
import { hash2 } from '@/lib/noise'
import { scatterFarmSpots, scatterTrees } from './island/scatter'

const OUTPUT_DIR = 'assets-src/island'
const TERRAIN_RESOLUTION = 240
const TREE_COUNT = 40000
const TREE_HEIGHT = { pine: 0.5, oak: 0.44, birch: 0.44 }
const CLIFF_VARIANTS = ['cliff-a', 'cliff-b', 'cliff-c']
const CLIFF_WIDTH = 1.25
const CLIFF_DEPTH = 3.6
const CLIFF_INSET = 0.3
const UNDERSIDES: [number, number, number, number][] = [
  [0, 0, 15, 0],
  [-1.5, -4.5, 11, 1.4],
  [1.8, 4.2, 11, 2.6],
]
const FIELD = { angle: 0.45, width: 0.55, depth: 0.34 }
const FIELD_KINDS = ['wheat', 'young', 'lavender']
const HERD_OFFSETS: [number, number, number][] = [
  [0.9, 0.55, 0.4],
  [1.15, 0.75, -0.9],
  [0.75, 0.95, 2.4],
  [1.3, 0.35, 1.2],
]

type Instance = {
  model: string
  position: [number, number, number]
  rotation: number
  scale: [number, number, number]
}

function round(values: ArrayLike<number>) {
  return Array.from(values, (value) => Math.round(value * 10000) / 10000)
}

function serializeGeometry(geometry: BufferGeometry) {
  const attributes = Object.fromEntries(
    Object.entries(geometry.attributes).map(([name, attribute]) => [
      name,
      { itemSize: attribute.itemSize, array: round(attribute.array) },
    ]),
  )
  const index = geometry.getIndex()
  return { attributes, index: index ? Array.from(index.array) : null }
}

function terrainSamples(model: IslandModel, geometry: BufferGeometry) {
  const position = geometry.getAttribute('position')
  const channels = {
    wetness: [] as number[],
    forest: [] as number[],
    lowland: [] as number[],
    edge: [] as number[],
  }
  for (let i = 0; i < position.count; i++) {
    const sample = model.sample(position.getX(i), position.getZ(i))
    channels.wetness.push(sample.wetness)
    channels.forest.push(sample.forest)
    channels.lowland.push(sample.lowland)
    channels.edge.push(Math.min(1, sample.edgeDistance))
  }
  return Object.fromEntries(Object.entries(channels).map(([name, values]) => [name, round(values)]))
}

function fieldCells(model: IslandModel) {
  const cos = Math.cos(FIELD.angle)
  const sin = Math.sin(FIELD.angle)
  const corners = [
    [model.bounds.minX, model.bounds.minZ],
    [model.bounds.maxX, model.bounds.minZ],
    [model.bounds.minX, model.bounds.maxZ],
    [model.bounds.maxX, model.bounds.maxZ],
  ].map(([x, z]) => [x * cos - z * sin, x * sin + z * cos])
  const us = corners.map(([u]) => u)
  const vs = corners.map(([, v]) => v)
  const cells: [number, number, number][] = []
  for (
    let cu = Math.floor(Math.min(...us) / FIELD.width);
    cu <= Math.max(...us) / FIELD.width;
    cu++
  ) {
    for (
      let cv = Math.floor(Math.min(...vs) / FIELD.depth);
      cv <= Math.max(...vs) / FIELD.depth;
      cv++
    ) {
      const u = (cu + 0.5) * FIELD.width
      const v = (cv + 0.5) * FIELD.depth
      const x = u * cos + v * sin
      const z = -u * sin + v * cos
      if (!model.isInside([x, z])) continue
      const sample = model.sample(x, z)
      const farmland = sample.forest < 0.3 && sample.wetness < 0.15 && sample.edgeDistance > 0.35
      if (!farmland || sample.roadDistance < 0.08 || hash2(cu, cv) > 0.5) continue
      const pick = hash2(cu + 17, cv - 9)
      const kind = pick > 0.86 ? 2 : pick > 0.62 ? 1 : 0
      const clear = model.places.every(
        (place) =>
          Math.hypot(x - place.position[0], z - place.position[1]) >
          place.footprint * place.scale + 0.2,
      )
      if (clear) cells.push([cu, cv, kind])
    }
  }
  return cells
}

function uniform(
  model: string,
  position: [number, number, number],
  rotation: number,
  size: number,
) {
  return { model, position, rotation, scale: [size, size, size] } satisfies Instance
}

function cliffInstances(model: IslandModel): Instance[] {
  const chunks = layoutCliffChunks(model, 0.75, CLIFF_VARIANTS.length).map<Instance>((chunk) => {
    const width = CLIFF_WIDTH * chunk.widthJitter
    const depth = CLIFF_DEPTH * chunk.depthJitter
    return {
      model: CLIFF_VARIANTS[chunk.variant],
      position: [
        chunk.point[0] - chunk.outward[0] * CLIFF_INSET,
        RIM_HEIGHT - 0.07 - depth,
        chunk.point[1] - chunk.outward[1] * CLIFF_INSET,
      ],
      rotation: chunk.rotation,
      scale: [width, depth, width],
    }
  })
  const waterfalls = riverExitChunks(model).map<Instance>((exit) => ({
    model: 'cliff-waterfall',
    position: [
      exit.point[0] - exit.outward[0] * CLIFF_INSET,
      RIM_HEIGHT - 0.07 - CLIFF_DEPTH,
      exit.point[1] - exit.outward[1] * CLIFF_INSET,
    ],
    rotation: Math.atan2(exit.outward[0], exit.outward[1]),
    scale: [CLIFF_WIDTH, CLIFF_DEPTH, CLIFF_WIDTH],
  }))
  const undersides = UNDERSIDES.map<Instance>(([dx, dz, width, rotation]) => ({
    model: 'island-underside',
    position: [model.centroid[0] + dx, RIM_HEIGHT - 1.2 - width * 0.75, model.centroid[1] + dz],
    rotation,
    scale: [width, width * 0.75, width * 1.1],
  }))
  return [...chunks, ...waterfalls, ...undersides]
}

function countrysideInstances(model: IslandModel): Instance[] {
  const houses = scatterFarmSpots(model, { count: 34, seed: 1569, spacing: 0.9, clearance: 0.3 })
  const windmills = scatterFarmSpots(model, { count: 6, seed: 1385, spacing: 3, clearance: 0.6 })
  const roztocze = model.places.find((place) => place.id === 'roztocze')
  const horses = roztocze
    ? HERD_OFFSETS.map(([dx, dz, rotation]) => {
        const x = roztocze.position[0] + dx
        const z = roztocze.position[1] + dz
        return uniform('horse', [x, model.heightAt(x, z), z], rotation, 0.16)
      })
    : []
  const eastmost = model.boundary.reduce((best, point) => (point[0] > best[0] ? point : best))
  const toCenter = Math.atan2(model.centroid[0] - eastmost[0], model.centroid[1] - eastmost[1])
  const deerX = eastmost[0] + Math.sin(toCenter) * 0.45
  const deerZ = eastmost[1] + Math.cos(toCenter) * 0.45
  return [
    ...houses.map((spot) => uniform('village-house', spot.position, spot.rotation, 0.32)),
    ...windmills.map((spot) => uniform('windmill', spot.position, spot.rotation, 0.55)),
    ...horses,
    uniform('deer', [deerX, model.heightAt(deerX, deerZ), deerZ], toCenter + Math.PI / 2, 0.3),
  ]
}

function fieldCellAt(x: number, z: number) {
  const u = x * Math.cos(FIELD.angle) - z * Math.sin(FIELD.angle)
  const v = x * Math.sin(FIELD.angle) + z * Math.cos(FIELD.angle)
  return `${Math.floor(u / FIELD.width)}:${Math.floor(v / FIELD.depth)}`
}

function treeInstances(model: IslandModel, fields: [number, number, number][]): Instance[] {
  const farmed = new Set(fields.map(([cu, cv]) => `${cu}:${cv}`))
  return scatterTrees(model, TREE_COUNT)
    .filter((tree, index) => {
      const [x, , z] = tree.position
      if (farmed.has(fieldCellAt(x, z))) return false
      const sample = model.sample(x, z)
      if (sample.roadDistance < 0.15) return false
      return sample.forest > 0.3 || hash2(index, 7) < 0.25
    })
    .map((tree) =>
      uniform(tree.kind, tree.position, tree.rotation, TREE_HEIGHT[tree.kind] * tree.scale),
    )
}

function placeAnchors(model: IslandModel) {
  return model.places.flatMap((place) => {
    const [x, z] = place.position
    const anchor = {
      id: place.id,
      model: place.id,
      position: [x, model.heightAt(x, z), z],
      width: place.footprint * place.scale * 2,
      rotation: place.rotation ?? 0,
    }
    const extras = (place.extras ?? []).map((extra) => {
      const ex = x + extra.offset[0]
      const ez = z + extra.offset[1]
      return {
        id: `${place.id}-${extra.model}`,
        model: extra.model,
        position: [ex, model.heightAt(ex, ez), ez],
        width: extra.size,
        rotation: place.rotation ?? 0,
      }
    })
    return [anchor, ...extras]
  })
}

function waterfallAnchors(model: IslandModel) {
  return model.rivers.flatMap((river) =>
    [river.exit, river.source].flatMap((fall, end) => {
      if (!fall) return []
      const [x, z] = fall.point
      const [ox, oz] = fall.outward
      return [
        {
          id: `${river.id}-${end}`,
          position: [x + ox * 0.05, model.heightAt(x, z) + WATER_OFFSET, z + oz * 0.05],
          rotation: Math.atan2(ox, oz),
          width: Math.max(0.7, river.width * 2.4),
        },
      ]
    }),
  )
}

const model = getIslandModel()
const terrain = buildTerrainGeometry(model, TERRAIN_RESOLUTION)
const fields = fieldCells(model)
const base = {
  centroid: model.centroid,
  rimHeight: RIM_HEIGHT,
  boundary: model.boundary,
  terrain: serializeGeometry(terrain),
  terrainSamples: terrainSamples(model, terrain),
  fields: { ...FIELD, kinds: FIELD_KINDS, cells: fields },
  roads: model.roads,
  water: serializeGeometry(buildWaterGeometry(model)),
  cliffCone: serializeGeometry(buildCliffGeometry(model)),
  instances: [
    ...cliffInstances(model),
    ...countrysideInstances(model),
    ...treeInstances(model, fields),
  ],
  baseCuts: { pine: 0.06, oak: 0.06, birch: 0.06, 'village-house': 0.04, windmill: 0.04 },
  places: placeAnchors(model),
  waterfalls: waterfallAnchors(model),
}

mkdirSync(OUTPUT_DIR, { recursive: true })
writeFileSync(`${OUTPUT_DIR}/base.json`, JSON.stringify(base))
console.warn(
  `base.json: ${base.instances.length} instances, ${base.places.length} places, ${base.waterfalls.length} waterfalls`,
)
