'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import type { IslandModel } from '@/lib/island/island-model'
import { scatterWindmills } from '@/lib/island/scatter'

type WindmillsProps = {
  model: IslandModel
}

export function Windmills({ model }: WindmillsProps) {
  const spots = useMemo(() => scatterWindmills(model, 5), [model])
  const bladesRef = useRef<(Group | null)[]>([])

  useFrame((_, delta) => {
    for (const blades of bladesRef.current) if (blades) blades.rotation.z += delta * 0.8
  })

  return (
    <group>
      {spots.map(([x, y, z], index) => (
        <group key={`${x}-${z}`} position={[x, y, z]} rotation={[0, index * 1.3, 0]} scale={0.9}>
          <mesh position={[0, 0.11, 0]} castShadow>
            <boxGeometry args={[0.12, 0.22, 0.12]} />
            <meshStandardMaterial color="#8a5a34" flatShading />
          </mesh>
          <mesh position={[0, 0.27, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.11, 0.12, 4]} />
            <meshStandardMaterial color="#5d3b22" flatShading />
          </mesh>
          <group
            position={[0, 0.2, 0.07]}
            ref={(blades) => {
              bladesRef.current[index] = blades
            }}
          >
            {[0, 1, 2, 3].map((blade) => (
              <mesh key={blade} rotation={[0, 0, (blade * Math.PI) / 2]} position={[0, 0, 0]}>
                <boxGeometry args={[0.03, 0.34, 0.006]} />
                <meshStandardMaterial color="#f2e3c6" flatShading />
              </mesh>
            ))}
          </group>
        </group>
      ))}
    </group>
  )
}
