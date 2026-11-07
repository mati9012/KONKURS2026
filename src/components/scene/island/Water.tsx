'use client'

import { useEffect, useMemo } from 'react'
import { DoubleSide } from 'three'
import { buildWaterGeometry } from '@/lib/island/build-water'
import type { IslandModel } from '@/lib/island/island-model'

type WaterProps = {
  model: IslandModel
}

export function Water({ model }: WaterProps) {
  const geometry = useMemo(() => buildWaterGeometry(model), [model])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color="#4cb8ec"
        emissive="#1d78b8"
        emissiveIntensity={0.35}
        roughness={0.15}
        metalness={0.1}
        side={DoubleSide}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </mesh>
  )
}
