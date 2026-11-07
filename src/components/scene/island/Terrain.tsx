'use client'

import { useEffect, useMemo } from 'react'
import { buildTerrainGeometry } from '@/lib/island/build-terrain'
import { createPaintTexture } from '@/lib/island/paint-texture'
import { applyTerrainShading } from '@/lib/island/terrain-shader'
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

  const paint = useMemo(() => createPaintTexture(), [])

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => paint.dispose(), [paint])

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        vertexColors
        map={paint}
        roughness={0.92}
        onBeforeCompile={applyTerrainShading}
      />
    </mesh>
  )
}
