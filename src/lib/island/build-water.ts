import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Vector3 } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { WATER_OFFSET } from '@/lib/island/island-model'
import type { IslandModel, River } from '@/lib/island/island-model'
import { hash2 } from '@/lib/island/noise'

const SHORE_MARGIN = 0.14

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
  samples.forEach((point, index) => {
    if (index < protectedFrom) keepOnIsland(model, point)
  })
  const positions: number[] = []
  const indices: number[] = []
  const tangent = new Vector3()

  samples.forEach((point, index) => {
    const previous = samples[Math.max(0, index - 1)]
    const next = samples[Math.min(samples.length - 1, index + 1)]
    tangent.subVectors(next, previous).setY(0).normalize()
    const half = river.width * 0.5 * (0.85 + hash2(index, river.width * 100) * 0.3)
    const sideX = -tangent.z * half
    const sideZ = tangent.x * half
    const isExit = river.exit && index === samples.length - 1
    const y = isExit ? point.y : Math.min(point.y, model.heightAt(point.x, point.z) + WATER_OFFSET)
    positions.push(point.x + sideX, y, point.z + sideZ, point.x - sideX, y, point.z - sideZ)
    if (index < samples.length - 1) {
      const base = index * 2
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2)
    }
  })

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function buildLakeDisc(model: IslandModel, center: [number, number], radius: number) {
  const segments = 14
  const y = model.heightAt(center[0], center[1]) + WATER_OFFSET * 0.6
  const positions = [center[0], y, center[1]]
  const indices: number[] = []
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const r = radius * (0.85 + hash2(center[0] * 10 + i, center[1]) * 0.3)
    positions.push(center[0] + Math.cos(angle) * r, y, center[1] + Math.sin(angle) * r)
    indices.push(0, 1 + ((i + 1) % segments), 1 + i)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

export function buildWaterGeometry(model: IslandModel) {
  const parts = [
    ...model.rivers.map((river) => buildRiverRibbon(model, river)),
    ...model.lakes.map((lake) => buildLakeDisc(model, lake.center, lake.radius)),
  ]
  return mergeGeometries(parts)
}
