'use client'

import { useEffect, useMemo } from 'react'
import { DoubleSide, Vector2 } from 'three'
import { buildCliffGeometry } from '@/lib/island/build-cliffs'
import { createCliffTextures } from '@/lib/island/cliff-texture'
import type { IslandModel } from '@/lib/island/island-model'

const NORMAL_SCALE = new Vector2(1.6, 1.6)

type CliffsProps = {
  model: IslandModel
}

export function Cliffs({ model }: CliffsProps) {
  const geometry = useMemo(() => buildCliffGeometry(model), [model])
  const textures = useMemo(() => createCliffTextures(), [])

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(
    () => () => {
      textures.albedo.dispose()
      textures.normal.dispose()
    },
    [textures],
  )

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        map={textures.albedo}
        normalMap={textures.normal}
        normalScale={NORMAL_SCALE}
        vertexColors
        roughness={0.95}
        side={DoubleSide}
      />
    </mesh>
  )
}
