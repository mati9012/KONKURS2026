'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  BufferAttribute,
  CanvasTexture,
  Color,
  DoubleSide,
  SphereGeometry,
  SRGBColorSpace,
} from 'three'
import type { Group } from 'three'

function createEnvelope() {
  const geometry = new SphereGeometry(1, 16, 12).toNonIndexed()
  const position = geometry.getAttribute('position')
  const colors = new Float32Array(position.count * 3)
  const cream = new Color('#f3e3c3')
  const terracotta = new Color('#c0643a')
  for (let i = 0; i < position.count; i += 3) {
    const x = (position.getX(i) + position.getX(i + 1) + position.getX(i + 2)) / 3
    const y = (position.getY(i) + position.getY(i + 1) + position.getY(i + 2)) / 3
    const z = (position.getZ(i) + position.getZ(i + 1) + position.getZ(i + 2)) / 3
    const gore = Math.floor(((Math.atan2(z, x) + Math.PI) / (Math.PI * 2)) * 16)
    const color = gore % 2 === 0 ? cream : terracotta
    for (let v = 0; v < 3; v++) colors.set([color.r, color.g, color.b], (i + v) * 3)
    for (let v = 0; v < 3; v++) {
      const vy = position.getY(i + v)
      if (vy < 0) {
        const squeeze = 1 + vy * 0.45
        position.setX(i + v, position.getX(i + v) * squeeze)
        position.setZ(i + v, position.getZ(i + v) * squeeze)
      }
    }
    if (y < -0.9) colors.set([0.55, 0.32, 0.2], i * 3)
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  return geometry
}

function createGoatBanner() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 160
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Brak kontekstu 2D dla flagi')
  context.fillStyle = '#b3202a'
  context.fillRect(0, 0, 128, 160)
  context.fillStyle = '#e8b84a'
  context.fillRect(0, 0, 128, 8)
  context.fillStyle = '#f8f4ea'
  context.beginPath()
  context.ellipse(62, 92, 30, 17, -0.15, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.moveTo(80, 82)
  context.lineTo(96, 52)
  context.lineTo(106, 56)
  context.lineTo(92, 88)
  context.fill()
  context.beginPath()
  context.ellipse(103, 52, 9, 7, 0.4, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = '#f8f4ea'
  context.lineWidth = 4
  context.beginPath()
  context.arc(92, 40, 12, Math.PI * 0.1, Math.PI * 1.1, true)
  context.stroke()
  context.lineWidth = 5
  for (const [x, dx] of [
    [40, -6],
    [50, 4],
    [74, -4],
    [84, 8],
  ]) {
    context.beginPath()
    context.moveTo(x, 100)
    context.lineTo(x + dx, 132)
    context.stroke()
  }
  context.fillStyle = '#e8b84a'
  context.beginPath()
  context.moveTo(90, 30)
  context.lineTo(94, 18)
  context.lineTo(100, 26)
  context.lineTo(106, 16)
  context.lineTo(110, 28)
  context.fill()
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

export function Balloon() {
  const groupRef = useRef<Group>(null)
  const envelope = useMemo(() => createEnvelope(), [])
  const banner = useMemo(() => createGoatBanner(), [])

  useEffect(
    () => () => {
      envelope.dispose()
      banner.dispose()
    },
    [envelope, banner],
  )

  useFrame(({ clock }) => {
    const group = groupRef.current
    if (!group) return
    const t = clock.elapsedTime * 0.05 + 2.4
    group.position.set(
      Math.cos(t) * 15,
      6.5 + Math.sin(clock.elapsedTime * 0.6) * 0.35,
      Math.sin(t) * 12,
    )
    group.rotation.y = -t
  })

  return (
    <group ref={groupRef} scale={0.9}>
      <mesh geometry={envelope} position={[0, 1.4, 0]} castShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.7} />
      </mesh>
      {[
        [-0.18, -0.18],
        [0.18, -0.18],
        [-0.18, 0.18],
        [0.18, 0.18],
      ].map(([x, z]) => (
        <mesh
          key={`${x}-${z}`}
          position={[x * 1.6, 0.12, z * 1.6]}
          rotation={[z * 1.2, 0, -x * 1.2]}
        >
          <cylinderGeometry args={[0.008, 0.008, 0.62, 3]} />
          <meshStandardMaterial color="#5d3b22" />
        </mesh>
      ))}
      <mesh position={[0, -0.25, 0]} castShadow>
        <boxGeometry args={[0.36, 0.26, 0.36]} />
        <meshStandardMaterial color="#8a5a34" flatShading />
      </mesh>
      <mesh position={[0.19, -0.55, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.36, 0.46]} />
        <meshStandardMaterial map={banner} side={DoubleSide} roughness={0.8} />
      </mesh>
    </group>
  )
}
