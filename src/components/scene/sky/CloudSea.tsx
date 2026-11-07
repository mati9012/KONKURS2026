'use client'

import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, Object3D } from 'three'
import type { Group, InstancedMesh } from 'three'
import { createRandom } from '@/lib/island/noise'
import type { Quality } from '@/store/game-store'

type Puff = {
  position: [number, number, number]
  scale: [number, number, number]
  tint: number
}

function createPuffs(clusterCount: number): Puff[] {
  const random = createRandom(2026)
  const puffs: Puff[] = []
  for (let cluster = 0; cluster < clusterCount; cluster++) {
    const distant = cluster % 3 === 0
    const angle = random() * Math.PI * 2
    const radius = distant ? 24 + random() * 45 : random() * 24
    const cx = Math.cos(angle) * radius
    const cz = Math.sin(angle) * radius
    const cy = distant ? -9 + random() * 4 : -12 + random() * 3
    const size = distant ? 2.2 + random() * 2.5 : 1.4 + random() * 1.6
    const count = 4 + Math.floor(random() * 4)
    for (let i = 0; i < count; i++) {
      const s = size * (0.55 + random() * 0.6)
      puffs.push({
        position: [
          cx + (random() - 0.5) * size * 2.4,
          cy + random() * size * 0.5,
          cz + (random() - 0.5) * size * 1.6,
        ],
        scale: [s * 1.25, s * 0.8, s],
        tint: random(),
      })
    }
  }
  return puffs
}

const TINTS = ['#ffffff', '#fff3f8', '#fbe9ff', '#ffeede'].map((hex) => new Color(hex))

type CloudSeaProps = {
  quality: Quality
}

export function CloudSea({ quality }: CloudSeaProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const groupRef = useRef<Group>(null)
  const puffs = useMemo(() => createPuffs(quality === 'high' ? 90 : 45), [quality])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const dummy = new Object3D()
    puffs.forEach((puff, index) => {
      dummy.position.set(...puff.position)
      dummy.scale.set(...puff.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
      mesh.setColorAt(index, TINTS[Math.floor(puff.tint * TINTS.length) % TINTS.length])
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [puffs])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.004
  })

  return (
    <group ref={groupRef}>
      <instancedMesh key={puffs.length} ref={meshRef} args={[undefined, undefined, puffs.length]}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial roughness={1} emissive="#f4c6e0" emissiveIntensity={0.4} />
      </instancedMesh>
    </group>
  )
}
