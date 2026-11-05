import { COLORS } from '@/lib/landmarks/palette'
import { ModelBuilder } from '@/lib/three/model-builder'
import type { Vec3 } from '@/lib/three/model-builder'

function horse(builder: ModelBuilder, at: Vec3, rotationY: number, coat: string) {
  const [x, y, z] = at
  const cos = Math.cos(rotationY)
  const sin = Math.sin(rotationY)
  const local = (dx: number, dy: number, dz: number): Vec3 => [
    x + dx * cos + dz * sin,
    y + dy,
    z - dx * sin + dz * cos,
  ]
  const rotation: Vec3 = [0, rotationY, 0]
  builder.box([0.1, 0.045, 0.04], coat, { at: local(0, 0.07, 0), rotation })
  for (const [dx, dz] of [
    [-0.04, -0.013],
    [-0.04, 0.013],
    [0.04, -0.013],
    [0.04, 0.013],
  ]) {
    builder.box([0.012, 0.05, 0.012], coat, { at: local(dx, 0.025, dz), rotation })
  }
  builder.box([0.025, 0.05, 0.022], coat, {
    at: local(0.055, 0.1, 0),
    rotation: [0, rotationY, -0.5],
  })
  builder.box([0.04, 0.02, 0.02], coat, { at: local(0.075, 0.12, 0), rotation })
  builder.box([0.03, 0.012, 0.008], COLORS.mane, {
    at: local(0.05, 0.125, 0),
    rotation: [0, rotationY, -0.5],
  })
  builder.box([0.01, 0.04, 0.008], COLORS.mane, { at: local(-0.055, 0.06, 0), rotation })
}

export function buildPoleskiPark() {
  const b = new ModelBuilder()
  b.cylinder(0.42, 0.42, 0.012, 14, '#6f9a6a', [0, 0, 0])
  for (let i = 0; i < 5; i++)
    b.cylinder(0.1 + (i % 2) * 0.05, 0.1, 0.014, 9, COLORS.water, [
      -0.25 + i * 0.13,
      0,
      i % 2 ? 0.16 : -0.12,
    ])
  const planks: [number, number, number][] = [
    [-0.36, -0.2, 0.5],
    [-0.12, 0.02, -0.7],
    [0.14, -0.08, 0.6],
    [0.36, 0.08, -0.5],
  ]
  for (const [x, z, angle] of planks) {
    b.box([0.3, 0.015, 0.05], COLORS.wood, { at: [x, 0.04, z], rotation: [0, angle, 0] })
    for (const side of [-1, 1])
      b.box([0.3, 0.025, 0.006], COLORS.darkWood, {
        at: [x, 0.065, z + side * 0.022],
        rotation: [0, angle, 0],
      })
  }
  for (let i = 0; i < 22; i++) {
    const angle = i * 2.4
    const radius = 0.15 + (i % 5) * 0.06
    b.cone(0.012, 0.09 + (i % 3) * 0.03, 4, COLORS.reed, [
      Math.cos(angle) * radius,
      0.01,
      Math.sin(angle) * radius,
    ])
  }
  const tower: Vec3 = [0.3, 0, -0.3]
  for (const [dx, dz] of [
    [-0.04, -0.04],
    [-0.04, 0.04],
    [0.04, -0.04],
    [0.04, 0.04],
  ]) {
    b.block([0.015, 0.38, 0.015], COLORS.darkWood, [tower[0] + dx, 0, tower[2] + dz])
  }
  b.block([0.14, 0.02, 0.14], COLORS.wood, [tower[0], 0.36, tower[2]])
  b.cone(0.12, 0.1, 4, COLORS.darkWood, [tower[0], 0.46, tower[2]], [0, Math.PI / 4, 0])
  return b.build()
}

export function buildRoztocze() {
  const b = new ModelBuilder()
  const steps: [number, number, number][] = [
    [-0.32, 0.18, -0.2],
    [-0.12, 0.13, -0.1],
    [0.08, 0.08, 0],
    [0.28, 0.03, 0.1],
  ]
  for (const [x, y, z] of steps) {
    b.block([0.22, y, 0.2], COLORS.darkStone, [x, 0, z + 0.16])
    b.block([0.22, y, 0.2], COLORS.stone, [x, 0, z - 0.16])
    b.block([0.24, 0.012, 0.12], COLORS.water, [x, y - 0.01, z])
    b.block([0.03, Math.max(0.03, y * 0.4), 0.12], COLORS.foam, [x + 0.12, y * 0.6, z])
  }
  for (let i = 0; i < 6; i++) {
    b.ball(
      0.05 + (i % 3) * 0.02,
      i % 2 ? COLORS.stone : '#8fa07a',
      [-0.4 + i * 0.16, 0.02, 0.36 - (i % 2) * 0.72],
      0,
      [1, 0.7, 1],
    )
  }
  horse(b, [0.12, 0, 0.45], 0.4, COLORS.horse)
  horse(b, [0.3, 0, 0.38], -0.8, '#9a8d7c')
  horse(b, [0.02, 0, 0.6], 2.2, COLORS.horse)
  return b.build()
}

export function buildZwierzyniec() {
  const b = new ModelBuilder()
  b.cylinder(0.34, 0.34, 0.016, 16, COLORS.water, [0, 0, 0])
  b.cylinder(0.13, 0.14, 0.04, 10, COLORS.grass, [0.02, 0, 0])
  b.house([0.02, 0.04, 0], [0.12, 0.12, 0.2], 0.1, COLORS.white, COLORS.darkRoof)
  b.block([0.06, 0.08, 0.06], COLORS.white, [0.02, 0.18, 0.07])
  b.cone(0.045, 0.09, 4, COLORS.darkRoof, [0.02, 0.26, 0.07], [0, Math.PI / 4, 0])
  b.box([0.04, 0.012, 0.22], COLORS.wood, { at: [0.02, 0.03, 0.24] })
  b.house([-0.45, 0, -0.18], [0.3, 0.2, 0.16], 0.1, COLORS.brick, COLORS.darkRoof, 0.3)
  b.block([0.08, 0.32, 0.08], COLORS.brick, [-0.6, 0, -0.08])
  b.cone(0.06, 0.1, 4, COLORS.darkRoof, [-0.6, 0.32, -0.08], [0, Math.PI / 4, 0])
  return b.build()
}

export function buildBilgoraj() {
  const b = new ModelBuilder()
  b.house([-0.18, 0, -0.12], [0.28, 0.14, 0.16], 0.12, COLORS.wood, COLORS.shingle)
  b.house([0.22, 0, -0.18], [0.16, 0.13, 0.24], 0.11, COLORS.darkWood, COLORS.shingle, Math.PI / 2)
  b.house([0.02, 0, 0.3], [0.22, 0.13, 0.15], 0.11, COLORS.wood, COLORS.shingle)
  b.block([0.3, 0.01, 0.01], COLORS.darkWood, [-0.05, 0.12, 0.08])
  for (const x of [-0.2, 0.1]) b.block([0.012, 0.13, 0.012], COLORS.darkWood, [x, 0, 0.08])
  for (let i = 0; i < 4; i++) {
    const x = -0.17 + i * 0.08
    b.ring(0.035, 0.007, COLORS.sieve, [x, 0.085, 0.09], [0.15, 0, 0])
    b.cylinder(0.032, 0.032, 0.004, 10, '#efe2bf', [x, 0.083, 0.09], [Math.PI / 2 + 0.15, 0, 0])
  }
  for (let i = 0; i < 3; i++)
    b.ring(0.04, 0.008, COLORS.sieve, [0.32, 0.01 + i * 0.016, 0.2], [Math.PI / 2, 0, 0])
  return b.build()
}
