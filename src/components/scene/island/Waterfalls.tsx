'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import {
  BufferAttribute,
  CanvasTexture,
  DoubleSide,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three'
import type { Texture } from 'three'
import { CloudPuffs } from '@/components/scene/sky/CloudSea'
import { WATER_OFFSET } from '@/lib/island/island-model'
import type { IslandModel } from '@/lib/island/island-model'
import { createRandom } from '@/lib/island/noise'
import type { CloudPuff } from '@/lib/sky/cloud-field'

const FALL_HEIGHT = 8

function createStreakTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 512
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Brak kontekstu 2D dla tekstury wodospadu')
  const gradient = context.createLinearGradient(0, 0, 128, 0)
  gradient.addColorStop(0, 'rgba(170, 225, 245, 0)')
  gradient.addColorStop(0.12, 'rgba(170, 225, 245, 0.75)')
  gradient.addColorStop(0.5, 'rgba(205, 238, 250, 0.9)')
  gradient.addColorStop(0.88, 'rgba(170, 225, 245, 0.75)')
  gradient.addColorStop(1, 'rgba(170, 225, 245, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 128, 512)
  const random = createRandom(42)
  for (let i = 0; i < 220; i++) {
    const x = 8 + random() * 112
    const y = random() * 512
    const height = 40 + random() * 140
    context.fillStyle = `rgba(255, 255, 255, ${0.35 + random() * 0.55})`
    context.fillRect(x, y, 1 + random() * 4, height)
    context.fillRect(x, y - 512, 1 + random() * 4, height)
  }
  for (let i = 0; i < 60; i++) {
    context.fillStyle = `rgba(60, 140, 190, ${0.15 + random() * 0.2})`
    const x = 10 + random() * 108
    const y = random() * 512
    context.fillRect(x, y, 1 + random() * 3, 30 + random() * 80)
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

function createFallGeometry(width: number, spread: number, bulge: number) {
  const geometry = new PlaneGeometry(width, FALL_HEIGHT, 4, 16)
  const position = geometry.getAttribute('position')
  const colors = new Float32Array(position.count * 4)
  for (let i = 0; i < position.count; i++) {
    const t = (FALL_HEIGHT / 2 - position.getY(i)) / FALL_HEIGHT
    position.setX(i, position.getX(i) * (1 + t * spread))
    position.setZ(i, Math.sin(Math.min(1, t * 3) * Math.PI * 0.5) * bulge + t * t * 0.8)
    colors.set([1, 1, 1, 1 - Math.pow(t, 1.6) * 0.85], i * 4)
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 4))
  geometry.translate(0, -FALL_HEIGHT / 2, 0)
  geometry.computeVertexNormals()
  return geometry
}

function createMist(width: number, seed: number): CloudPuff[] {
  const random = createRandom(seed)
  return Array.from({ length: 12 }, (_, index) => ({
    position: [
      (random() - 0.5) * width * 2.2,
      -FALL_HEIGHT * (0.8 + random() * 0.15),
      0.6 + random() * 1.2,
    ] as [number, number, number],
    size: width * (1.6 + random() * 1.4),
    shade: 0.6 + random() * 0.4,
    spin: (random() - 0.5) * 0.4,
    variant: index % 4,
  }))
}

type WaterfallsProps = {
  model: IslandModel
}

export function Waterfalls({ model }: WaterfallsProps) {
  const texture = useMemo(() => createStreakTexture(), [])
  const falls = useMemo(
    () =>
      model.rivers
        .flatMap((river) =>
          [river.exit, river.source].flatMap((fall, end) =>
            fall ? [{ river, fall, id: `${river.id}-${end}` }] : [],
          ),
        )
        .map(({ river, fall, id }, index) => {
          const [x, z] = fall.point
          const [ox, oz] = fall.outward
          const width = Math.max(0.7, river.width * 2.4)
          return {
            id,
            back: createFallGeometry(width * 1.15, 1.2, 0.35),
            front: createFallGeometry(width, 0.8, 0.5),
            mist: createMist(width, 50 + index),
            position: [x + ox * 0.05, model.heightAt(x, z) + WATER_OFFSET, z + oz * 0.05] as const,
            rotationY: Math.atan2(ox, oz),
          }
        }),
    [model],
  )

  useEffect(
    () => () => {
      texture.dispose()
      falls.forEach((fall) => {
        fall.back.dispose()
        fall.front.dispose()
      })
    },
    [texture, falls],
  )

  useFrame((_, delta) => {
    scrollTexture(texture, delta * 0.7)
  })

  return (
    <group>
      {falls.map((fall) => (
        <group key={fall.id} position={fall.position} rotation={[0, fall.rotationY, 0]}>
          <mesh geometry={fall.back}>
            <meshBasicMaterial
              map={texture}
              vertexColors
              transparent
              opacity={0.75}
              depthWrite={false}
              side={DoubleSide}
            />
          </mesh>
          <mesh geometry={fall.front} position={[0, 0, 0.08]}>
            <meshBasicMaterial
              map={texture}
              vertexColors
              transparent
              depthWrite={false}
              side={DoubleSide}
            />
          </mesh>
          <CloudPuffs puffs={fall.mist} opacity={0.85} />
        </group>
      ))}
    </group>
  )
}
