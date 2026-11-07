'use client'

import { useEffect, useMemo } from 'react'
import { buildTerrainGeometry } from '@/lib/island/build-terrain'
import type { IslandModel } from '@/lib/island/island-model'
import type { Quality } from '@/store/game-store'

type TerrainProps = {
  model: IslandModel
  quality: Quality
}

export function Terrain({ model, quality }: TerrainProps) {
  const geometry = useMemo(
    () => buildTerrainGeometry(model, quality === 'high' ? 170 : 110),
    [model, quality],
  )

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial vertexColors flatShading roughness={0.95} />
    </mesh>
  )
}
