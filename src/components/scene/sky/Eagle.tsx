'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { useModelAsset } from '@/components/scene/useModelAsset'

export function Eagle() {
  const groupRef = useRef<Group>(null)
  const asset = useModelAsset('eagle')

  useFrame(({ clock }) => {
    const group = groupRef.current
    if (!group) return
    const t = clock.elapsedTime
    const orbit = t * 0.12
    group.position.set(Math.cos(orbit) * 11, 7.5 + Math.sin(t * 0.4) * 0.6, Math.sin(orbit) * 9)
    group.rotation.set(0, -orbit + Math.PI / 2, 0.22 + Math.sin(t * 0.8) * 0.06)
  })

  return (
    <group ref={groupRef}>
      <mesh geometry={asset.geometry} material={asset.material} scale={1.1} />
    </group>
  )
}
