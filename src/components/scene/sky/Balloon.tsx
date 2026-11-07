'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { useModelAsset } from '@/components/scene/useModelAsset'

export function Balloon() {
  const groupRef = useRef<Group>(null)
  const asset = useModelAsset('balloon', 0.14)

  useFrame(({ clock }) => {
    const group = groupRef.current
    if (!group) return
    const t = clock.elapsedTime * 0.05 + 2.4
    group.position.set(
      Math.cos(t) * 15,
      5.5 + Math.sin(clock.elapsedTime * 0.6) * 0.35,
      Math.sin(t) * 12,
    )
    group.rotation.y = -t
  })

  return (
    <group ref={groupRef}>
      <mesh geometry={asset.geometry} material={asset.material} scale={2.6} castShadow />
    </group>
  )
}
