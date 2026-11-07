import mapData from '@/content/geo/lubelskie.json'
import { PLACES } from '@/content/places'
import type { Place } from '@/content/places'
import { createSceneProjection, toClockwiseRegion } from './projection'
import { fbm, gaussian, smoothstep, valueNoise } from '@/lib/noise'
import {
  closestPointOnPath,
  distanceToPath,
  isInsidePolygon,
  polygonBounds,
  polygonCentroid,
  SegmentIndex,
} from './polygon'
import type { ClosestPoint, Vec2 } from './polygon'

export const ISLAND_SIZE = 22
export const RIM_HEIGHT = 0.05
export const WATER_OFFSET = 0.045

const EDGE_REACH = 2
const RIVER_REACH = 1.3
const ROAD_REACH = 0.6
const SOURCE_FALL_REACH = 0.8

type GeoPoint = [longitude: number, latitude: number]

type RiverStyle = {
  width: number
  depth: number
  exitsIsland: boolean
}

const RIVER_STYLES: Record<string, RiverStyle> = {
  wisla: { width: 0.5, depth: 0.16, exitsIsland: true },
  bug: { width: 0.4, depth: 0.15, exitsIsland: true },
  wieprz: { width: 0.26, depth: 0.12, exitsIsland: false },
  tanew: { width: 0.18, depth: 0.1, exitsIsland: true },
  bystrzyca: { width: 0.15, depth: 0.09, exitsIsland: false },
  krzna: { width: 0.15, depth: 0.09, exitsIsland: false },
  huczwa: { width: 0.13, depth: 0.08, exitsIsland: false },
  tysmienica: { width: 0.13, depth: 0.08, exitsIsland: false },
  por: { width: 0.12, depth: 0.08, exitsIsland: false },
}

const UPLANDS = [
  { at: [22.5, 50.95] as GeoPoint, radius: 2.6, height: 0.5 },
  { at: [23.1, 50.9] as GeoPoint, radius: 1.8, height: 0.3 },
  { at: [23.47, 51.14] as GeoPoint, radius: 0.45, height: 0.35 },
  { at: [22.02, 51.28] as GeoPoint, radius: 0.8, height: 0.25 },
]

const LOWLANDS = [
  { at: [23.2, 51.45] as GeoPoint, radius: 2.2, depth: 0.22 },
  { at: [22.9, 51.85] as GeoPoint, radius: 2, depth: 0.12 },
]

const ROZTOCZE_RIDGE: GeoPoint[] = [
  [22.15, 50.97],
  [22.55, 50.78],
  [22.95, 50.62],
  [23.3, 50.47],
  [23.65, 50.3],
]

const FORESTS = [
  { at: [22.95, 50.45] as GeoPoint, radius: 1.6, density: 0.95 },
  { at: [22.35, 50.62] as GeoPoint, radius: 1.2, density: 0.9 },
  { at: [23.0, 50.6] as GeoPoint, radius: 0.8, density: 0.95 },
  { at: [22.95, 51.6] as GeoPoint, radius: 1, density: 0.75 },
  { at: [23.25, 51.45] as GeoPoint, radius: 1.1, density: 0.7 },
  { at: [22.6, 51.42] as GeoPoint, radius: 0.7, density: 0.6 },
  { at: [23.5, 50.4] as GeoPoint, radius: 0.8, density: 0.8 },
  { at: [23.55, 51.85] as GeoPoint, radius: 1, density: 0.55 },
]

const LAKES = [
  { at: [23.03, 51.4] as GeoPoint, radius: 0.42 },
  { at: [23.17, 51.37] as GeoPoint, radius: 0.32 },
  { at: [23.38, 51.55] as GeoPoint, radius: 0.36 },
  { at: [23.28, 51.47] as GeoPoint, radius: 0.26 },
  { at: [22.53, 51.18] as GeoPoint, radius: 0.3 },
]

export type River = {
  id: string
  name: string
  width: number
  depth: number
  path: Vec2[]
  exit?: RiverFall
  source?: RiverFall
}

export type RiverFall = {
  point: Vec2
  outward: Vec2
}

export type Lake = {
  center: Vec2
  radius: number
}

export type PlacedLandmark = Place & {
  position: Vec2
}

export type TerrainSample = {
  height: number
  wetness: number
  forest: number
  lowland: number
  edgeDistance: number
  roadDistance: number
}

export type IslandModel = {
  project: (longitude: number, latitude: number) => Vec2
  boundary: Vec2[]
  centroid: Vec2
  bounds: ReturnType<typeof polygonBounds>
  rivers: River[]
  lakes: Lake[]
  places: PlacedLandmark[]
  roads: Vec2[][]
  isInside: (point: Vec2) => boolean
  edgeDistance: (point: Vec2) => number
  closestEdge: (point: Vec2, maxDistance: number) => ClosestPoint | null
  sample: (x: number, z: number) => TerrainSample
  heightAt: (x: number, z: number) => number
}

function normalize([x, z]: Vec2): Vec2 {
  const length = Math.hypot(x, z) || 1
  return [x / length, z / length]
}

function buildRoadNetwork(stops: Vec2[]): Vec2[][] {
  const connected = [0]
  const roads: Vec2[][] = []
  while (connected.length < stops.length) {
    let best = { from: 0, to: 0, distance: Infinity }
    for (const from of connected) {
      stops.forEach((stop, to) => {
        if (connected.includes(to)) return
        const distance = Math.hypot(stop[0] - stops[from][0], stop[1] - stops[from][1])
        if (distance < best.distance) best = { from, to, distance }
      })
    }
    connected.push(best.to)
    const [ax, az] = stops[best.from]
    const [bx, bz] = stops[best.to]
    const nx = -(bz - az) / best.distance
    const nz = (bx - ax) / best.distance
    const steps = Math.max(8, Math.round(best.distance * 4))
    roads.push(
      Array.from({ length: steps + 1 }, (_, step) => {
        const t = step / steps
        const sway =
          Math.sin(t * Math.PI) * fbm(t * 3 + best.to, best.from, 2) * best.distance * 0.25
        return [ax + (bx - ax) * t + nx * sway, az + (bz - az) * t + nz * sway] as Vec2
      }),
    )
  }
  return roads
}

function createModel(): IslandModel {
  const ring = mapData.boundary as GeoPoint[]
  const project = createSceneProjection(toClockwiseRegion(ring), ISLAND_SIZE)
  const toScene = ([longitude, latitude]: GeoPoint) => project(longitude, latitude)
  const boundary = ring.map(toScene)
  const centroid = polygonCentroid(boundary)
  const bounds = polygonBounds(boundary)

  const rivers: River[] = mapData.rivers.map((river) => {
    const style = RIVER_STYLES[river.id]
    const path = (river.points as GeoPoint[]).map(toScene)
    if (!style.exitsIsland) return { ...river, ...style, path }
    const fallAt = (end: Vec2): RiverFall => {
      const closest = closestPointOnPath(end, boundary, true)
      return {
        point: closest.point,
        outward: normalize([closest.point[0] - end[0], closest.point[1] - end[1]]),
      }
    }
    const exit = fallAt(path[path.length - 1])
    const first = path[0]
    const source =
      closestPointOnPath(first, boundary, true).distance < SOURCE_FALL_REACH
        ? fallAt(first)
        : undefined
    return {
      ...river,
      ...style,
      path: [...(source ? [source.point] : []), ...path, exit.point],
      exit,
      source,
    }
  })

  const lakes: Lake[] = LAKES.map((lake) => ({ center: toScene(lake.at), radius: lake.radius }))
  const uplands = UPLANDS.map((upland) => ({ ...upland, center: toScene(upland.at) }))
  const lowlands = LOWLANDS.map((lowland) => ({ ...lowland, center: toScene(lowland.at) }))
  const forests = FORESTS.map((forest) => ({ ...forest, center: toScene(forest.at) }))
  const ridge = ROZTOCZE_RIDGE.map(toScene)

  const boundaryIndex = new SegmentIndex(0.5, [{ points: boundary, closed: true, group: 0 }])
  const riverIndex = new SegmentIndex(
    0.5,
    rivers.map((river, group) => ({ points: river.path, closed: false, group })),
  )
  const isInside = (point: Vec2) => isInsidePolygon(point, boundary)
  const closestEdge = (point: Vec2, maxDistance: number) =>
    boundaryIndex.closest(point, maxDistance)
  const edgeDistance = (point: Vec2) => closestEdge(point, EDGE_REACH)?.distance ?? EDGE_REACH

  const rawSample = (x: number, z: number) => {
    const point: Vec2 = [x, z]
    let height = 0.32 + fbm(x * 0.35, z * 0.35) * 0.12
    for (const upland of uplands) {
      height +=
        upland.height *
        gaussian(Math.hypot(x - upland.center[0], z - upland.center[1]), upland.radius)
    }
    const ridgeDistance = distanceToPath(point, ridge, false)
    height += 0.75 * gaussian(ridgeDistance, 0.7) * (0.75 + 0.5 * valueNoise(x * 0.9, z * 0.9))
    let lowland = 0
    for (const area of lowlands) {
      const weight = gaussian(Math.hypot(x - area.center[0], z - area.center[1]), area.radius)
      height -= area.depth * weight
      lowland = Math.max(lowland, weight)
    }
    let dry = 1
    const riverDistances = riverIndex.distancesByGroup(point, RIVER_REACH, rivers.length)
    for (const [index, river] of rivers.entries()) {
      const inner = river.width * 0.5 + 0.16
      const factor = smoothstep(inner, inner + 0.6, riverDistances[index])
      height -= river.depth * (1 - factor)
      dry = Math.min(dry, factor)
    }
    for (const lake of lakes) {
      const distance = Math.hypot(x - lake.center[0], z - lake.center[1])
      const factor = smoothstep(lake.radius, lake.radius + 0.35, distance)
      height -= 0.12 * (1 - factor)
      dry = Math.min(dry, factor)
    }
    height += fbm(x * 1.6, z * 1.6, 2) * 0.06 * dry
    let forest = 0
    for (const area of forests) {
      const weight = gaussian(Math.hypot(x - area.center[0], z - area.center[1]), area.radius)
      forest = Math.max(forest, area.density * weight)
    }
    forest *= 0.7 + 0.6 * valueNoise(x * 1.3 + 7, z * 1.3 + 3)
    return { height, wetness: 1 - dry, forest: Math.min(1, forest), lowland }
  }

  const places: PlacedLandmark[] = PLACES.map((place) => ({
    ...place,
    position: toScene([place.longitude, place.latitude]),
  }))
  const plateaus = places.map((place) => rawSample(place.position[0], place.position[1]).height)
  const roads = buildRoadNetwork(places.map((place) => place.position))
  const roadIndex = new SegmentIndex(
    0.5,
    roads.map((points, group) => ({ points, closed: false, group })),
  )

  const sample = (x: number, z: number): TerrainSample => {
    const raw = rawSample(x, z)
    let height = raw.height
    places.forEach((place, index) => {
      const distance = Math.hypot(x - place.position[0], z - place.position[1])
      const radius = place.footprint * place.scale
      const weight = 1 - smoothstep(radius * 0.75, radius * 1.15, distance)
      height += (plateaus[index] - height) * weight
    })
    const distanceToEdge = edgeDistance([x, z])
    height = RIM_HEIGHT + (height - RIM_HEIGHT) * smoothstep(0, 0.9, distanceToEdge)
    const roadDistance = roadIndex.closest([x, z], ROAD_REACH)?.distance ?? ROAD_REACH
    return { ...raw, height, edgeDistance: distanceToEdge, roadDistance }
  }

  return {
    project: (longitude, latitude) => project(longitude, latitude),
    boundary,
    centroid,
    bounds,
    rivers,
    lakes,
    places,
    roads,
    isInside,
    edgeDistance,
    closestEdge,
    sample,
    heightAt: (x, z) => sample(x, z).height,
  }
}

let cachedModel: IslandModel | undefined

export function getIslandModel() {
  cachedModel ??= createModel()
  return cachedModel
}
