export type Vec2 = [x: number, z: number]

export type ClosestPoint = {
  distance: number
  point: Vec2
  segmentIndex: number
}

export function isInsidePolygon([x, z]: Vec2, polygon: Vec2[]) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, zi] = polygon[i]
    const [xj, zj] = polygon[j]
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside
  }
  return inside
}

function closestOnSegment(x: number, z: number, a: Vec2, b: Vec2): [number, number, number] {
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const lengthSquared = dx * dx + dz * dz || 1e-12
  const t = Math.min(1, Math.max(0, ((x - a[0]) * dx + (z - a[1]) * dz) / lengthSquared))
  const px = a[0] + t * dx
  const pz = a[1] + t * dz
  return [px, pz, Math.hypot(x - px, z - pz)]
}

export function closestPointOnPath(point: Vec2, path: Vec2[], closed: boolean): ClosestPoint {
  const [x, z] = point
  const segmentCount = closed ? path.length : path.length - 1
  let best: ClosestPoint = { distance: Infinity, point: path[0], segmentIndex: 0 }
  for (let i = 0; i < segmentCount; i++) {
    const [px, pz, distance] = closestOnSegment(x, z, path[i], path[(i + 1) % path.length])
    if (distance < best.distance) best = { distance, point: [px, pz], segmentIndex: i }
  }
  return best
}

export function distanceToPath(point: Vec2, path: Vec2[], closed: boolean) {
  const [x, z] = point
  const segmentCount = closed ? path.length : path.length - 1
  let best = Infinity
  for (let i = 0; i < segmentCount; i++) {
    const distance = closestOnSegment(x, z, path[i], path[(i + 1) % path.length])[2]
    if (distance < best) best = distance
  }
  return best
}

export function polygonCentroid(polygon: Vec2[]): Vec2 {
  let x = 0
  let z = 0
  for (const point of polygon) {
    x += point[0]
    z += point[1]
  }
  return [x / polygon.length, z / polygon.length]
}

export function polygonBounds(polygon: Vec2[]) {
  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity
  for (const [x, z] of polygon) {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minZ = Math.min(minZ, z)
    maxZ = Math.max(maxZ, z)
  }
  return { minX, maxX, minZ, maxZ }
}

function cellKey(x: number, z: number) {
  return (x + 1024) * 4096 + (z + 1024)
}

type IndexedSegment = {
  a: Vec2
  b: Vec2
  group: number
}

export class SegmentIndex {
  private cells = new Map<number, IndexedSegment[]>()

  constructor(
    private cellSize: number,
    paths: { points: Vec2[]; closed: boolean; group: number }[],
  ) {
    for (const path of paths) {
      const count = path.closed ? path.points.length : path.points.length - 1
      for (let i = 0; i < count; i++) {
        const a = path.points[i]
        const b = path.points[(i + 1) % path.points.length]
        const segment = { a, b, group: path.group }
        const minX = Math.floor(Math.min(a[0], b[0]) / cellSize)
        const maxX = Math.floor(Math.max(a[0], b[0]) / cellSize)
        const minZ = Math.floor(Math.min(a[1], b[1]) / cellSize)
        const maxZ = Math.floor(Math.max(a[1], b[1]) / cellSize)
        for (let cx = minX; cx <= maxX; cx++) {
          for (let cz = minZ; cz <= maxZ; cz++) {
            const key = cellKey(cx, cz)
            const bucket = this.cells.get(key)
            if (bucket) bucket.push(segment)
            else this.cells.set(key, [segment])
          }
        }
      }
    }
  }

  private visit(point: Vec2, maxDistance: number, onSegment: (segment: IndexedSegment) => void) {
    const reach = Math.ceil(maxDistance / this.cellSize)
    const cx = Math.floor(point[0] / this.cellSize)
    const cz = Math.floor(point[1] / this.cellSize)
    for (let x = cx - reach; x <= cx + reach; x++) {
      for (let z = cz - reach; z <= cz + reach; z++) {
        const bucket = this.cells.get(cellKey(x, z))
        if (bucket) bucket.forEach(onSegment)
      }
    }
  }

  closest(point: Vec2, maxDistance: number): ClosestPoint | null {
    let best: ClosestPoint | null = null
    this.visit(point, maxDistance, (segment) => {
      const [px, pz, distance] = closestOnSegment(point[0], point[1], segment.a, segment.b)
      if (distance <= maxDistance && (!best || distance < best.distance)) {
        best = { distance, point: [px, pz], segmentIndex: segment.group }
      }
    })
    return best
  }

  distancesByGroup(point: Vec2, maxDistance: number, groupCount: number) {
    const distances = new Array<number>(groupCount).fill(maxDistance)
    this.visit(point, maxDistance, (segment) => {
      const distance = closestOnSegment(point[0], point[1], segment.a, segment.b)[2]
      if (distance < distances[segment.group]) distances[segment.group] = distance
    })
    return distances
  }
}
