import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Vector3 } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { WATER_OFFSET } from '@/lib/island/island-model'
import type { IslandModel, River } from '@/lib/island/island-model'
import { hash2 } from '@/lib/island/noise'

const SHORE_MARGIN = 0.32

function keepOnIsland(model: IslandModel, point: Vector3) {
  const inside = model.isInside([point.x, point.z])
  const closest = model.closestEdge([point.x, point.z], inside ? SHORE_MARGIN : 4)
  if (!closest) return
  const [qx, qz] = closest.point
  const direction = inside ? 1 : -1
  const length = closest.distance || 1
  point.x = qx + ((point.x - qx) / length) * direction * SHORE_MARGIN
  point.z = qz + ((point.z - qz) / length) * direction * SHORE_MARGIN
}

function buildRiverRibbon(model: IslandModel, river: River) {
  const points = river.path.map(([x, z]) => new Vector3(x, model.heightAt(x, z) + WATER_OFFSET, z))
  const curve = new CatmullRomCurve3(points, false, 'centripetal')
  const steps = Math.max(8, points.length * 4)
  const samples = curve.getSpacedPoints(steps)
  const protectedFrom = river.exit ? samples.length - 4 : samples.length
  const protectedTo = river.source ? 4 : 0
  samples.forEach((point, index) => {
    if (index >= protectedTo && index < protectedFrom) keepOnIsland(model, point)
  })
  const positions: number[] = []
  const edges: number[] = []
  const flows: number[] = []
  const indices: number[] = []
  const tangent = new Vector3()
  let flow = 0

  samples.forEach((point, index) => {
    if (index > 0) flow += point.distanceTo(samples[index - 1])
    const previous = samples[Math.max(0, index - 1)]
    const next = samples[Math.min(samples.length - 1, index + 1)]
    tangent.subVectors(next, previous).setY(0).normalize()
    const half = river.width * 0.5 * (0.85 + hash2(index, river.width * 100) * 0.3)
    const sideX = -tangent.z * half
    const sideZ = tangent.x * half
    const isExit = (river.exit && index === samples.length - 1) || (river.source && index === 0)
    const y = isExit ? point.y : Math.min(point.y, model.heightAt(point.x, point.z) + WATER_OFFSET)
    positions.push(
      point.x + sideX,
      y,
      point.z + sideZ,
      point.x,
      y,
      point.z,
      point.x - sideX,
      y,
      point.z - sideZ,
    )
    edges.push(1, 0, 1)
    flows.push(flow, flow, flow)
    if (index < samples.length - 1) {
      const base = index * 3
      for (let lane = 0; lane < 2; lane++) {
        const a = base + lane
        indices.push(a, a + 1, a + 3, a + 1, a + 4, a + 3)
      }
    }
  })

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('edge', new BufferAttribute(new Float32Array(edges), 1))
  geometry.setAttribute('flow', new BufferAttribute(new Float32Array(flows), 1))
  geometry.setIndex(indices)
  return geometry
}

function buildLakeDisc(model: IslandModel, center: [number, number], radius: number) {
  const segments = 14
  const y = model.heightAt(center[0], center[1]) + WATER_OFFSET * 0.6
  const positions = [center[0], y, center[1]]
  const edges = [0]
  const indices: number[] = []
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const r = radius * (0.85 + hash2(center[0] * 10 + i, center[1]) * 0.3)
    positions.push(center[0] + Math.cos(angle) * r, y, center[1] + Math.sin(angle) * r)
    edges.push(1)
    indices.push(0, 1 + ((i + 1) % segments), 1 + i)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('edge', new BufferAttribute(new Float32Array(edges), 1))
  geometry.setAttribute('flow', new BufferAttribute(new Float32Array(edges.length), 1))
  geometry.setIndex(indices)
  return geometry
}

export function buildWaterGeometry(model: IslandModel) {
  const parts = [
    ...model.rivers.map((river) => buildRiverRibbon(model, river)),
    ...model.lakes.map((lake) => buildLakeDisc(model, lake.center, lake.radius)),
  ]
  return mergeGeometries(parts)
}
