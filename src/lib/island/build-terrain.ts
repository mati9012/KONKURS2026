import { BufferAttribute, BufferGeometry, Color } from 'three'
import { hash2, smoothstep } from '@/lib/island/noise'
import { RIM_HEIGHT } from '@/lib/island/island-model'
import type { IslandModel, TerrainSample } from '@/lib/island/island-model'

const PALETTE = {
  meadow: new Color('#a6cf4a'),
  meadowDeep: new Color('#86bd3a'),
  upland: new Color('#74a838'),
  forestFloor: new Color('#4f8a2a'),
  marsh: new Color('#7f9f4c'),
  bank: new Color('#a8d86e'),
  rim: new Color('#8fc04d'),
  fields: ['#f2d06b', '#e9b94e', '#cfe274', '#f7df8c', '#b3d464', '#efc35e', '#b98fe0'].map(
    (hex) => new Color(hex),
  ),
}

const scratch = new Color()

const TEXTURE_SCALE = 0.6

type GridVertex = {
  x: number
  y: number
  z: number
  normal: [number, number, number]
  inside: boolean
  kept: boolean
  sample: TerrainSample
}

function fieldColor(x: number, z: number, target: Color) {
  const angle = 0.45
  const u = x * Math.cos(angle) - z * Math.sin(angle)
  const v = x * Math.sin(angle) + z * Math.cos(angle)
  const cellU = Math.floor(u / 0.5)
  const cellV = Math.floor(v / 0.32)
  if (hash2(cellU, cellV) > 0.45) return false
  const pick = hash2(cellU + 17, cellV - 9)
  const palette = PALETTE.fields
  const index =
    pick > 0.985 ? palette.length - 1 : Math.floor((pick / 0.985) * (palette.length - 1))
  target.copy(palette[index])
  return true
}

function faceColor(x: number, z: number, sample: TerrainSample, target: Color) {
  target.copy(PALETTE.meadow).lerp(PALETTE.meadowDeep, hash2(Math.floor(x * 2), Math.floor(z * 2)))
  target.lerp(PALETTE.upland, smoothstep(0.75, 1.15, sample.height))
  target.lerp(PALETTE.marsh, sample.lowland * 0.6)
  const farmland = sample.forest < 0.3 && sample.wetness < 0.15 && sample.edgeDistance > 0.35
  if (farmland && fieldColor(x, z, scratch)) target.lerp(scratch, 0.7)
  target.lerp(PALETTE.forestFloor, smoothstep(0.35, 0.7, sample.forest))
  target.lerp(PALETTE.bank, smoothstep(0.3, 0.8, sample.wetness))
  target.lerp(PALETTE.rim, 1 - smoothstep(0.05, 0.2, sample.edgeDistance))
  target.multiplyScalar(0.94 + hash2(x * 13.1, z * 7.7) * 0.12)
}

export function buildTerrainGeometry(model: IslandModel, resolution: number) {
  const { minX, maxX, minZ, maxZ } = model.bounds
  const cell = Math.max(maxX - minX, maxZ - minZ) / resolution
  const columns = Math.ceil((maxX - minX) / cell) + 3
  const rows = Math.ceil((maxZ - minZ) / cell) + 3
  const originX = minX - cell
  const originZ = minZ - cell
  const grid: GridVertex[] = []

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const x = originX + column * cell
      const z = originZ + row * cell
      const inside = model.isInside([x, z])
      const closest = model.closestEdge([x, z], cell * 1.5)
      const kept = inside || closest !== null
      const snap = closest !== null && (!inside || closest.distance < cell * 0.35)
      const [px, pz] = snap ? closest.point : [x, z]
      const sample = model.sample(px, pz)
      grid.push({
        x: px,
        y: snap ? RIM_HEIGHT : sample.height,
        z: pz,
        normal: [0, 1, 0],
        inside,
        kept,
        sample,
      })
    }
  }

  const heightAtCell = (row: number, column: number, fallback: number) => {
    const vertex = grid[row * columns + column]
    return vertex && row >= 0 && row < rows && column >= 0 && column < columns && vertex.kept
      ? vertex.y
      : fallback
  }
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const vertex = grid[row * columns + column]
      const dx = heightAtCell(row, column + 1, vertex.y) - heightAtCell(row, column - 1, vertex.y)
      const dz = heightAtCell(row + 1, column, vertex.y) - heightAtCell(row - 1, column, vertex.y)
      const length = Math.hypot(dx, 2 * cell, dz)
      vertex.normal = [-dx / length, (2 * cell) / length, -dz / length]
    }
  }

  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const colors: number[] = []
  const color = new Color()
  const pushTriangle = (a: GridVertex, b: GridVertex, c: GridVertex) => {
    if (!a.kept || !b.kept || !c.kept) return
    if (!a.inside && !b.inside && !c.inside) return
    for (const vertex of [a, b, c]) {
      positions.push(vertex.x, vertex.y, vertex.z)
      normals.push(...vertex.normal)
      uvs.push(vertex.x * TEXTURE_SCALE, vertex.z * TEXTURE_SCALE)
    }
    const cx = (a.x + b.x + c.x) / 3
    const cz = (a.z + b.z + c.z) / 3
    const center = model.sample(cx, cz)
    faceColor(cx, cz, center, color)
    for (let i = 0; i < 3; i++) colors.push(color.r, color.g, color.b)
  }

  for (let row = 0; row < rows - 1; row++) {
    for (let column = 0; column < columns - 1; column++) {
      const a = grid[row * columns + column]
      const b = grid[row * columns + column + 1]
      const c = grid[(row + 1) * columns + column]
      const d = grid[(row + 1) * columns + column + 1]
      if ((row + column) % 2 === 0) {
        pushTriangle(a, c, b)
        pushTriangle(b, c, d)
      } else {
        pushTriangle(a, c, d)
        pushTriangle(a, d, b)
      }
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3))
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3))
  return geometry
}
