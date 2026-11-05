'use client'

import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { RIM_HEIGHT } from '@/lib/island/island-model'
import type { IslandModel } from '@/lib/island/island-model'

type IslandRimProps = {
  model: IslandModel
}

export function IslandRim({ model }: IslandRimProps) {
  const points = useMemo(() => {
    const ring = model.boundary.map(
      ([x, z]) => [x, RIM_HEIGHT + 0.02, z] as [number, number, number],
    )
    return [...ring, ring[0]]
  }, [model])

  return (
    <group>
      <Line
        points={points}
        color="#ffc84f"
        lineWidth={14}
        toneMapped={false}
        transparent
        opacity={0.4}
        depthWrite={false}
      />
      <Line points={points} color="#fff4c4" lineWidth={4} toneMapped={false} />
    </group>
  )
}
