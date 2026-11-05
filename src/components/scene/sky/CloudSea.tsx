'use client'

import { Cloud, Clouds } from '@react-three/drei'
import { useMemo } from 'react'
import { MeshLambertMaterial } from 'three'
import { createRandom } from '@/lib/island/noise'
import type { Quality } from '@/store/game-store'

type CloudBank = {
  seed: number
  position: [number, number, number]
  bounds: [number, number, number]
  volume: number
  color: string
}

const TINTS = ['#ffffff', '#fff1f6', '#ffe9dc', '#fbeaff']

class GlowingCloudMaterial extends MeshLambertMaterial {
  constructor() {
    super()
    this.emissive.set('#f7d9e8')
    this.emissiveIntensity = 0.6
  }
}

function createPuffTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Brak kontekstu 2D dla tekstury chmur')
  const random = createRandom(31)
  for (let i = 0; i < 26; i++) {
    const angle = random() * Math.PI * 2
    const distance = random() * size * 0.22
    const x = size / 2 + Math.cos(angle) * distance
    const y = size / 2 + Math.sin(angle) * distance
    const radius = size * (0.14 + random() * 0.16)
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.85)')
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
  }
  return canvas.toDataURL('image/png')
}

function createBanks(quality: Quality): CloudBank[] {
  const random = createRandom(2026)
  const banks: CloudBank[] = []
  const below = quality === 'high' ? 14 : 8
  for (let i = 0; i < below; i++) {
    const angle = (i / below) * Math.PI * 2 + random() * 0.5
    const radius = 4 + random() * 22
    banks.push({
      seed: i + 1,
      position: [Math.cos(angle) * radius, -9 + random() * 2, Math.sin(angle) * radius],
      bounds: [10, 1.8, 10],
      volume: 9 + random() * 5,
      color: TINTS[i % TINTS.length],
    })
  }
  const horizon = quality === 'high' ? 10 : 6
  for (let i = 0; i < horizon; i++) {
    const angle = (i / horizon) * Math.PI * 2 + random() * 0.4
    const radius = 46 + random() * 22
    banks.push({
      seed: 100 + i,
      position: [Math.cos(angle) * radius, -4 + random() * 5, Math.sin(angle) * radius],
      bounds: [22, 4, 9],
      volume: 18 + random() * 8,
      color: TINTS[(i + 1) % TINTS.length],
    })
  }
  for (let i = 0; i < 4; i++) {
    const angle = random() * Math.PI * 2
    banks.push({
      seed: 200 + i,
      position: [Math.cos(angle) * 17, -2.5 + random() * 2, Math.sin(angle) * 15],
      bounds: [4, 1, 3],
      volume: 4 + random() * 2,
      color: TINTS[i % TINTS.length],
    })
  }
  return banks
}

type CloudSeaProps = {
  quality: Quality
}

export function CloudSea({ quality }: CloudSeaProps) {
  const texture = useMemo(() => createPuffTexture(), [])
  const banks = useMemo(() => createBanks(quality), [quality])
  const segments = quality === 'high' ? 34 : 16

  return (
    <Clouds texture={texture} material={GlowingCloudMaterial} limit={banks.length * segments + 50}>
      {banks.map((bank) => (
        <Cloud
          key={bank.seed}
          seed={bank.seed}
          position={bank.position}
          bounds={bank.bounds}
          volume={bank.volume}
          segments={segments}
          color={bank.color}
          growth={4}
          speed={0.08}
          fade={6}
          opacity={0.95}
        />
      ))}
    </Clouds>
  )
}
