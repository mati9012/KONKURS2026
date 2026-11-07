'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { CanvasTexture, DoubleSide, PlaneGeometry, RepeatWrapping, SRGBColorSpace } from 'three'
import type { Texture } from 'three'
import { WATER_OFFSET } from '@/lib/island/island-model'
import type { IslandModel, River } from '@/lib/island/island-model'
import { createRandom } from '@/lib/island/noise'

const FALL_HEIGHT = 5.5

function createStreakTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Brak kontekstu 2D dla tekstury wodospadu')
  const gradient = context.createLinearGradient(0, 0, 64, 0)
  gradient.addColorStop(0, 'rgba(150, 215, 245, 0)')
  gradient.addColorStop(0.2, 'rgba(150, 215, 245, 0.85)')
  gradient.addColorStop(0.8, 'rgba(150, 215, 245, 0.85)')
  gradient.addColorStop(1, 'rgba(150, 215, 245, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 64, 256)
  const random = createRandom(42)
  for (let i = 0; i < 70; i++) {
    context.fillStyle = `rgba(255, 255, 255, ${0.35 + random() * 0.5})`
    context.fillRect(6 + random() * 52, random() * 256, 1 + random() * 3, 20 + random() * 60)
  }
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.colorSpace = SRGBColorSpace
  return texture
}

function scrollTexture(texture: Texture, amount: number) {
  texture.offset.y = (texture.offset.y + amount) % 1
}

function createFallGeometry(width: number) {
  const geometry = new PlaneGeometry(width, FALL_HEIGHT, 1, 12)
  const position = geometry.getAttribute('position')
  for (let i = 0; i < position.count; i++) {
    const t = (FALL_HEIGHT / 2 - position.getY(i)) / FALL_HEIGHT
    position.setX(i, position.getX(i) * (1 + t * 0.9))
    position.setZ(i, t * t * 0.9)
  }
  geometry.translate(0, -FALL_HEIGHT / 2, 0)
  geometry.computeVertexNormals()
  return geometry
}

type WaterfallsProps = {
  model: IslandModel
}

export function Waterfalls({ model }: WaterfallsProps) {
  const texture = useMemo(() => createStreakTexture(), [])
  const falls = useMemo(
    () =>
      model.rivers
        .filter((river): river is River & { exit: NonNullable<River['exit']> } =>
          Boolean(river.exit),
        )
        .map((river) => {
          const [x, z] = river.exit.point
          const [ox, oz] = river.exit.outward
          return {
            id: river.id,
            geometry: createFallGeometry(river.width * 1.5),
            position: [x + ox * 0.03, model.heightAt(x, z) + WATER_OFFSET, z + oz * 0.03] as const,
            rotationY: Math.atan2(ox, oz),
          }
        }),
    [model],
  )

  useEffect(
    () => () => {
      texture.dispose()
      falls.forEach((fall) => fall.geometry.dispose())
    },
    [texture, falls],
  )

  useFrame((_, delta) => {
    scrollTexture(texture, delta * 0.9)
  })

  return (
    <group>
      {falls.map((fall) => (
        <group key={fall.id} position={fall.position} rotation={[0, fall.rotationY, 0]}>
          <mesh geometry={fall.geometry}>
            <meshBasicMaterial
              map={texture}
              transparent
              depthWrite={false}
              side={DoubleSide}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, -FALL_HEIGHT * 0.95, 0.75]} scale={[1.2, 0.6, 1]}>
            <icosahedronGeometry args={[0.35, 1]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.55} roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
