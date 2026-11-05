'use client'

import { useEffect, useMemo } from 'react'
import { DoubleSide } from 'three'
import { buildCliffGeometry } from '@/lib/island/build-cliffs'
import type { IslandModel } from '@/lib/island/island-model'

type CliffsProps = {
  model: IslandModel
}

export function Cliffs({ model }: CliffsProps) {
  const geometry = useMemo(() => buildCliffGeometry(model), [model])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial vertexColors flatShading roughness={1} side={DoubleSide} />
    </mesh>
  )
}
