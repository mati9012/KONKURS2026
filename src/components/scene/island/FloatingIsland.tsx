'use client'

import { Suspense, useMemo } from 'react'
import { Cliffs } from '@/components/scene/island/Cliffs'
import { Countryside } from '@/components/scene/island/Countryside'
import { Forest } from '@/components/scene/island/Forest'
import { IslandRim } from '@/components/scene/island/IslandRim'
import { Landmarks } from '@/components/scene/island/Landmarks'
import { RockyRim } from '@/components/scene/island/RockyRim'
import { Terrain } from '@/components/scene/island/Terrain'
import { Water } from '@/components/scene/island/Water'
import { Waterfalls } from '@/components/scene/island/Waterfalls'
import { getIslandModel } from '@/lib/island/island-model'
import type { Quality } from '@/store/game-store'

type FloatingIslandProps = {
  quality: Quality
}

export function FloatingIsland({ quality }: FloatingIslandProps) {
  const model = useMemo(() => getIslandModel(), [])

  return (
    <group position={[-model.centroid[0], 0, -model.centroid[1]]}>
      <Suspense fallback={null}>
        <Terrain model={model} quality={quality} />
      </Suspense>
      <Cliffs model={model} />
      <IslandRim model={model} />
      <Water model={model} />
      <Suspense fallback={null}>
        <Waterfalls model={model} />
        <RockyRim model={model} quality={quality} />
      </Suspense>
      <Suspense fallback={null}>
        <Landmarks model={model} />
      </Suspense>
      <Suspense fallback={null}>
        <Forest model={model} quality={quality} />
        <Countryside model={model} />
      </Suspense>
    </group>
  )
}
