import { DataTexture, LinearFilter, RGBAFormat, UnsignedByteType } from 'three'
import { createRandom, fbm, smoothstep } from '@/lib/island/noise'

export type CloudPuff = {
  position: [number, number, number]
  size: number
  shade: number
  spin: number
  variant: number
}

type CloudBank = {
  center: [number, number, number]
  width: number
  height: number
  density: number
}

const LIGHT: [number, number, number] = [0.55, -0.7, 0.45]

function fieldValue(blobs: { x: number; y: number; sigma: number }[], u: number, v: number) {
  let value = 0
  for (const blob of blobs) {
    const dx = u - blob.x
    const dy = v - blob.y
    value += Math.exp(-(dx * dx + dy * dy) / (2 * blob.sigma * blob.sigma))
  }
  return value
}

function paintVariant(
  data: Uint8Array,
  atlasSize: number,
  tile: number,
  offsetX: number,
  offsetY: number,
  seed: number,
) {
  const random = createRandom(seed)
  const blobs = Array.from({ length: 46 }, () => {
    const angle = random() * Math.PI * 2
    const distance = Math.pow(random(), 0.7)
    return {
      x: 0.5 + Math.cos(angle) * distance * 0.3,
      y: 0.5 + Math.sin(angle) * distance * 0.2,
      sigma: 0.022 + random() * 0.055,
    }
  })
  const field = new Float32Array(tile * tile)
  for (let py = 0; py < tile; py++) {
    for (let px = 0; px < tile; px++) {
      const u = (px + 0.5) / tile
      const v = (py + 0.5) / tile
      const warpU = u + fbm(u * 4 + seed, v * 4, 3) * 0.08
      const warpV = v + fbm(u * 4, v * 4 + seed, 3) * 0.05
      const wisps = 0.5 + 0.5 * fbm(warpU * 16 + seed, warpV * 22, 5)
      const base = smoothstep(0.2, 0.36, v)
      const edge = 1 - smoothstep(0.25, 0.5, Math.hypot(u - 0.5, (v - 0.5) * 1.3))
      field[py * tile + px] = fieldValue(blobs, warpU, warpV) * 0.45 * wisps * base * edge
    }
  }
  const at = (x: number, y: number) =>
    field[Math.min(tile - 1, Math.max(0, y)) * tile + Math.min(tile - 1, Math.max(0, x))]
  for (let py = 0; py < tile; py++) {
    for (let px = 0; px < tile; px++) {
      const nx = -(at(px + 3, py) - at(px - 3, py)) * 2
      const ny = (at(px, py + 3) - at(px, py - 3)) * 2
      const length = Math.hypot(nx, ny, 1)
      const light = (nx * LIGHT[0] + ny * LIGHT[1] + LIGHT[2]) / length
      const density = at(px, py)
      const vertical = (py + 0.5) / tile
      const shade = Math.min(1, Math.max(0, 0.45 + light * 0.3 + vertical * 0.3))
      const alpha = Math.pow(smoothstep(0.05, 0.75, density), 1.3) * 0.72
      const index = ((offsetY + py) * atlasSize + offsetX + px) * 4
      data[index] = Math.round(shade * 255)
      data[index + 1] = Math.round(shade * 255)
      data[index + 2] = Math.round(shade * 255)
      data[index + 3] = Math.round(alpha * 255)
    }
  }
}

export function createPuffTexture(tile = 192) {
  const atlasSize = tile * 2
  const data = new Uint8Array(atlasSize * atlasSize * 4)
  for (let variant = 0; variant < 4; variant++) {
    paintVariant(
      data,
      atlasSize,
      tile,
      (variant % 2) * tile,
      Math.floor(variant / 2) * tile,
      11 + variant * 7,
    )
  }
  const texture = new DataTexture(data, atlasSize, atlasSize, RGBAFormat, UnsignedByteType)
  texture.flipY = false
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

function buildBank(bank: CloudBank, random: () => number, puffs: CloudPuff[]) {
  const [cx, cy, cz] = bank.center
  const baseCount = Math.max(4, Math.round(bank.width * 1.0 * bank.density))
  for (let i = 0; i < baseCount; i++) {
    const angle = random() * Math.PI * 2
    const distance = Math.sqrt(random())
    const y = random() * bank.height * 0.3
    puffs.push({
      position: [
        cx + Math.cos(angle) * distance * bank.width * 0.5,
        cy + y,
        cz + Math.sin(angle) * distance * bank.width * 0.32,
      ],
      size: bank.width * (0.4 + random() * 0.3),
      shade: y / bank.height,
      spin: (random() - 0.5) * 0.25,
      variant: Math.floor(random() * 4),
    })
  }
  const domeCount = Math.max(3, Math.round(bank.width * 0.8 * bank.density))
  for (let i = 0; i < domeCount; i++) {
    const t = Math.pow(random(), 0.8)
    const spread = (1 - t * 0.75) * bank.width * 0.42
    const angle = random() * Math.PI * 2
    const y = bank.height * (0.25 + t * 0.75)
    puffs.push({
      position: [
        cx + Math.cos(angle) * spread * random(),
        cy + y,
        cz + Math.sin(angle) * spread * 0.5 * random(),
      ],
      size: bank.width * (0.3 + random() * 0.25) * (1 - t * 0.3),
      shade: y / bank.height,
      spin: (random() - 0.5) * 0.25,
      variant: Math.floor(random() * 4),
    })
  }
}

export function createCloudField(detail: number): CloudPuff[] {
  const random = createRandom(2026)
  const banks: CloudBank[] = []
  const floorStep = detail >= 1 ? 14 : 20
  for (let x = -150; x <= 150; x += floorStep) {
    for (let z = -150; z <= 120; z += floorStep) {
      const radius = Math.hypot(x, z)
      if (radius > 160) continue
      banks.push({
        center: [
          x + (random() - 0.5) * floorStep,
          -15 + random() * 4 - radius * 0.03,
          z + (random() - 0.5) * floorStep,
        ],
        width: floorStep * (1.3 + random() * 0.6),
        height: 4 + random() * 4,
        density: detail,
      })
    }
  }
  for (let i = 0; i < 26; i++) {
    const angle = (i / 26) * Math.PI * 2 + random() * 0.25
    const radius = 15 + random() * 24
    banks.push({
      center: [Math.cos(angle) * radius, -8 + random() * 4, Math.sin(angle) * radius * 0.9],
      width: 7 + random() * 7,
      height: 4 + random() * 4,
      density: detail,
    })
  }
  for (let i = 0; i < 18; i++) {
    const angle = Math.PI + (i / 17) * Math.PI + (random() - 0.5) * 0.2
    const radius = 110 + random() * 50
    banks.push({
      center: [Math.cos(angle) * radius, -6 + random() * 20, Math.sin(angle) * radius],
      width: 30 + random() * 26,
      height: 14 + random() * 14,
      density: detail * 0.8,
    })
  }
  const puffs: CloudPuff[] = []
  for (const bank of banks) buildBank(bank, random, puffs)
  return puffs
}
