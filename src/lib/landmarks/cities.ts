import { COLORS, HOUSE_COLORS } from '@/lib/landmarks/palette'
import { ModelBuilder } from '@/lib/three/model-builder'
import type { Vec3 } from '@/lib/three/model-builder'

function baroqueHelmet(builder: ModelBuilder, base: Vec3, radius: number, color: string) {
  const [x, y, z] = base
  builder.dome(radius, color, [x, y, z])
  builder.cylinder(radius * 0.35, radius * 0.35, radius * 0.6, 8, color, [x, y + radius * 0.85, z])
  builder.cone(radius * 0.45, radius * 0.9, 8, color, [x, y + radius * 1.45, z])
  builder.ball(radius * 0.18, COLORS.gold, [x, y + radius * 2.45, z])
}

function townHouses(
  builder: ModelBuilder,
  start: Vec3,
  step: Vec3,
  count: number,
  rotationY: number,
  seed: number,
) {
  for (let i = 0; i < count; i++) {
    const height = 0.16 + ((i * 7 + seed) % 3) * 0.03
    builder.house(
      [start[0] + step[0] * i, start[1], start[2] + step[2] * i],
      [0.13, height, 0.15],
      0.09,
      HOUSE_COLORS[(i + seed) % HOUSE_COLORS.length],
      i % 2 === 0 ? COLORS.roof : COLORS.darkRoof,
      rotationY,
    )
  }
}

export function buildLublin() {
  const b = new ModelBuilder()
  const hill = 0.14
  b.cylinder(0.62, 0.78, hill, 10, COLORS.grass, [-0.1, 0, -0.1])
  b.block([0.82, 0.24, 0.26], COLORS.cream, [-0.1, hill, -0.05])
  b.crenellation([-0.48, hill + 0.24, 0.07], [0.28, hill + 0.24, 0.07], 9, 0.04, COLORS.cream)
  for (const x of [-0.55, 0.35]) {
    b.block([0.18, 0.42, 0.18], COLORS.cream, [x, hill, -0.05])
    b.cone(0.15, 0.22, 4, COLORS.roof, [x, hill + 0.42, -0.05], [0, Math.PI / 4, 0])
  }
  b.block([0.17, 0.5, 0.17], COLORS.cream, [-0.1, hill, 0.05])
  b.crenellation([-0.17, hill + 0.5, 0.12], [-0.03, hill + 0.5, 0.12], 3, 0.04, COLORS.cream)
  b.block([0.07, 0.12, 0.02], COLORS.darkWood, [-0.1, hill, 0.14])
  b.cylinder(0.1, 0.11, 0.62, 10, COLORS.stone, [-0.32, hill, -0.32])
  b.crenellation([-0.4, hill + 0.62, -0.32], [-0.24, hill + 0.62, -0.32], 4, 0.035, COLORS.stone)
  b.house([0.18, hill, -0.36], [0.3, 0.2, 0.14], 0.12, COLORS.white, COLORS.roof)
  b.cylinder(0.035, 0.035, 0.12, 6, COLORS.white, [0.04, hill + 0.24, -0.36])
  b.cone(0.045, 0.12, 6, COLORS.roof, [0.04, hill + 0.36, -0.36])

  b.block([0.17, 0.4, 0.17], COLORS.brick, [0.62, 0, 0.42])
  b.block([0.15, 0.14, 0.15], COLORS.white, [0.62, 0.4, 0.42])
  b.block([0.06, 0.12, 0.03], COLORS.darkWood, [0.62, 0, 0.51])
  baroqueHelmet(b, [0.62, 0.54, 0.42], 0.08, COLORS.patina)
  townHouses(b, [0.3, 0, 0.62], [-0.15, 0, 0], 5, 0, 1)
  townHouses(b, [0.86, 0, 0.62], [0, 0, -0.16], 3, Math.PI / 2, 3)
  return b.build()
}

export function buildZamosc() {
  const b = new ModelBuilder()
  b.block([1.05, 0.02, 0.85], COLORS.plaza, [0, 0, 0])
  b.block([0.42, 0.24, 0.17], COLORS.pink, [0, 0.02, -0.28])
  b.gable([0.46, 0.12, 0.19], COLORS.darkRoof, [0, 0.26, -0.28])
  b.block([0.13, 0.42, 0.13], COLORS.white, [0, 0.02, -0.28])
  b.cylinder(0.055, 0.065, 0.14, 8, COLORS.pink, [0, 0.44, -0.28])
  b.dome(0.06, COLORS.patina, [0, 0.58, -0.28])
  b.cone(0.03, 0.22, 8, COLORS.patina, [0, 0.62, -0.28])
  b.ball(0.022, COLORS.gold, [0, 0.85, -0.28])
  for (const side of [-1, 1]) {
    b.box([0.2, 0.05, 0.06], COLORS.white, {
      at: [side * 0.09, 0.06, -0.15],
      rotation: [0, side * 0.5, -side * 0.25],
    })
  }
  const houseColors = [
    COLORS.yellow,
    COLORS.red,
    COLORS.blue,
    COLORS.green,
    COLORS.orange,
    COLORS.teal,
  ]
  const facade = (x: number, z: number, rotationY: number, index: number) => {
    b.block(
      [0.14, 0.2, 0.14],
      houseColors[index % houseColors.length],
      [x, 0.02, z],
      [0, rotationY, 0],
    )
    b.block([0.14, 0.035, 0.14], COLORS.white, [x, 0.22, z], [0, rotationY, 0])
    b.block([0.14, 0.05, 0.035], COLORS.darkStone, [x, 0.02, z], [0, rotationY, 0])
  }
  for (let i = 0; i < 5; i++) facade(0.44, -0.24 + i * 0.15, Math.PI / 2, i)
  for (let i = 0; i < 5; i++) facade(-0.44, -0.24 + i * 0.15, -Math.PI / 2, i + 2)
  for (let i = 0; i < 5; i++) facade(-0.3 + i * 0.15, 0.36, 0, i + 4)
  const corners = 7
  for (let i = 0; i < corners; i++) {
    const angle = (i / corners) * Math.PI * 2
    const nextAngle = ((i + 1) / corners) * Math.PI * 2
    const radius = 0.78
    const ax = Math.cos(angle) * radius
    const az = Math.sin(angle) * radius
    const bx = Math.cos(nextAngle) * radius
    const bz = Math.sin(nextAngle) * radius
    const length = Math.hypot(bx - ax, bz - az)
    b.box([length, 0.07, 0.05], COLORS.brick, {
      at: [(ax + bx) / 2, 0.035, (az + bz) / 2],
      rotation: [0, -Math.atan2(bz - az, bx - ax), 0],
    })
    b.cone(
      0.12,
      0.08,
      3,
      COLORS.brick,
      [Math.cos(angle) * 0.84, 0, Math.sin(angle) * 0.84],
      [0, -angle + Math.PI / 2, 0],
    )
  }
  return b.build()
}

export function buildKazimierzDolny() {
  const b = new ModelBuilder()
  b.cylinder(0.22, 0.38, 0.26, 9, COLORS.grass, [-0.18, 0, -0.28])
  const top = 0.26
  b.block([0.32, 0.18, 0.04], COLORS.stone, [-0.18, top, -0.42])
  b.block([0.04, 0.14, 0.26], COLORS.stone, [-0.33, top, -0.3])
  b.block([0.12, 0.1, 0.04], COLORS.darkStone, [-0.26, top, -0.16])
  b.block([0.04, 0.2, 0.18], COLORS.stone, [-0.03, top, -0.33])
  b.cylinder(0.06, 0.07, 0.24, 8, COLORS.stone, [-0.32, top, -0.44])
  b.cylinder(0.12, 0.2, 0.2, 8, COLORS.grass, [0.28, 0, -0.42])
  b.cylinder(0.065, 0.075, 0.36, 10, COLORS.stone, [0.28, 0.2, -0.42])
  b.crenellation([0.22, 0.56, -0.42], [0.34, 0.56, -0.42], 3, 0.03, COLORS.stone)
  b.house([0.12, 0, 0.02], [0.32, 0.18, 0.15], 0.16, COLORS.white, COLORS.roof)
  b.block([0.09, 0.32, 0.09], COLORS.white, [0.31, 0, 0.02])
  b.cone(0.075, 0.16, 4, COLORS.roof, [0.31, 0.32, 0.02], [0, Math.PI / 4, 0])
  townHouses(b, [-0.3, 0, 0.32], [0.15, 0, 0], 5, 0, 2)
  b.house([-0.48, 0, 0.05], [0.14, 0.12, 0.32], 0.2, COLORS.white, COLORS.darkRoof, Math.PI / 2)
  return b.build()
}

export function buildChelm() {
  const b = new ModelBuilder()
  b.cylinder(0.3, 0.55, 0.3, 10, COLORS.grass, [0, 0, 0])
  const top = 0.3
  b.house([0, top, 0.02], [0.2, 0.2, 0.42], 0.12, COLORS.white, COLORS.darkRoof)
  for (const x of [-0.08, 0.08]) {
    b.block([0.09, 0.36, 0.09], COLORS.white, [x, top, 0.24])
    baroqueHelmet(b, [x, top + 0.36, 0.24], 0.055, COLORS.patina)
  }
  b.dome(0.08, COLORS.patina, [0, top + 0.32, -0.04])
  b.block([0.1, 0.3, 0.1], COLORS.white, [0.28, top - 0.04, -0.12])
  baroqueHelmet(b, [0.28, top + 0.26, -0.12], 0.06, COLORS.patina)
  b.block([0.12, 0.1, 0.04], COLORS.white, [-0.3, 0.02, 0.32], [0, 0.6, 0])
  b.block([0.06, 0.07, 0.02], '#2c2722', [-0.29, 0.02, 0.345], [0, 0.6, 0])
  return b.build()
}

export function buildPulawy() {
  const b = new ModelBuilder()
  b.block([0.66, 0.22, 0.2], COLORS.white, [0, 0, 0])
  b.gable([0.7, 0.1, 0.22], COLORS.slate, [0, 0.22, 0])
  for (const x of [-0.29, 0.29]) b.block([0.12, 0.22, 0.34], COLORS.white, [x, 0, 0.08])
  for (const x of [-0.29, 0.29])
    b.gable([0.14, 0.08, 0.36], COLORS.slate, [x, 0.22, 0.08], [0, Math.PI / 2, 0])
  for (let i = 0; i < 6; i++)
    b.cylinder(0.014, 0.014, 0.2, 6, COLORS.white, [-0.1 + i * 0.04, 0, 0.14])
  b.block([0.26, 0.03, 0.06], COLORS.white, [0, 0.2, 0.14])
  b.gable([0.06, 0.08, 0.26], COLORS.white, [0, 0.23, 0.14], [0, Math.PI / 2, 0])
  b.cylinder(0.2, 0.22, 0.12, 10, COLORS.grass, [0.42, 0, 0.46])
  b.cylinder(0.13, 0.14, 0.03, 12, COLORS.stone, [0.42, 0.12, 0.46])
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2
    b.cylinder(0.01, 0.01, 0.12, 5, COLORS.white, [
      0.42 + Math.cos(angle) * 0.11,
      0.15,
      0.46 + Math.sin(angle) * 0.11,
    ])
  }
  b.cylinder(0.07, 0.07, 0.12, 10, COLORS.cream, [0.42, 0.15, 0.46])
  b.cylinder(0.13, 0.13, 0.02, 12, COLORS.white, [0.42, 0.27, 0.46])
  b.dome(0.1, COLORS.stone, [0.42, 0.29, 0.46], 10)
  return b.build()
}

export function buildWlodawa() {
  const b = new ModelBuilder()
  b.block([0.3, 0.22, 0.26], COLORS.cream, [0, 0, 0])
  b.block([0.26, 0.08, 0.22], COLORS.darkRoof, [0, 0.22, 0])
  b.gable([0.24, 0.1, 0.2], COLORS.darkRoof, [0, 0.3, 0])
  for (const x of [-0.24, 0.24])
    b.house([x, 0, 0.04], [0.16, 0.13, 0.16], 0.08, COLORS.cream, COLORS.darkRoof)
  b.house([0.1, 0, -0.42], [0.18, 0.18, 0.34], 0.12, COLORS.yellow, COLORS.roof)
  b.block([0.09, 0.36, 0.09], COLORS.yellow, [0.1, 0, -0.22])
  baroqueHelmet(b, [0.1, 0.36, -0.22], 0.06, COLORS.darkRoof)
  return b.build()
}

export function buildKock() {
  const b = new ModelBuilder()
  b.block([0.5, 0.2, 0.2], COLORS.yellow, [0, 0, 0])
  b.gable([0.54, 0.1, 0.22], COLORS.roof, [0, 0.2, 0])
  for (let i = 0; i < 4; i++)
    b.cylinder(0.013, 0.013, 0.18, 6, COLORS.white, [-0.06 + i * 0.04, 0, 0.13])
  b.block([0.18, 0.03, 0.05], COLORS.white, [0, 0.18, 0.13])
  b.gable([0.05, 0.07, 0.2], COLORS.white, [0, 0.21, 0.13], [0, Math.PI / 2, 0])
  b.house([-0.28, 0, -0.36], [0.16, 0.16, 0.3], 0.12, COLORS.white, COLORS.darkRoof)
  b.block([0.09, 0.34, 0.09], COLORS.white, [-0.28, 0, -0.17])
  b.cone(0.07, 0.14, 4, COLORS.darkRoof, [-0.28, 0.34, -0.17], [0, Math.PI / 4, 0])
  townHouses(b, [0.2, 0, -0.3], [0.14, 0, 0], 2, 0, 4)
  return b.build()
}
