'use client'

import { useTexture } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { RepeatWrapping, SRGBColorSpace } from 'three'
import { buildTerrainGeometry } from '@/lib/island/build-terrain'
import { applyTerrainShading } from '@/lib/island/terrain-shader'
import type { IslandModel } from '@/lib/island/island-model'
import { textureUrl } from '@/lib/three/texture-url'
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

  const paint = useTexture(textureUrl('grass.webp'), (texture) => {
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 8
  })

  useEffect(() => () => geometry.dispose(), [geometry])

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
