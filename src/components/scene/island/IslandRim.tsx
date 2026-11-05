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
      ([x, z]) => [x, RIM_HEIGHT + 0.015, z] as [number, number, number],
    )
    return [...ring, ring[0]]
  }, [model])

  return (
    <Line
      points={points}
      color="#ffd36e"
      lineWidth={2.2}
      toneMapped={false}
      transparent
      opacity={0.9}
    />
  )
}
