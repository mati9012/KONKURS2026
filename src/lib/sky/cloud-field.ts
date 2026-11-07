import { createRandom } from '@/lib/noise'

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
