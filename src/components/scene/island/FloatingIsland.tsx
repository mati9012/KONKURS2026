'use client'

import { useMemo } from 'react'
import { Cliffs } from '@/components/scene/island/Cliffs'
import { Forest } from '@/components/scene/island/Forest'
import { IslandRim } from '@/components/scene/island/IslandRim'
import { Landmarks } from '@/components/scene/island/Landmarks'
import { Terrain } from '@/components/scene/island/Terrain'
import { Water } from '@/components/scene/island/Water'
import { Waterfalls } from '@/components/scene/island/Waterfalls'
import { Windmills } from '@/components/scene/island/Windmills'
import { getIslandModel } from '@/lib/island/island-model'
import type { Quality } from '@/store/game-store'

type FloatingIslandProps = {
  quality: Quality
}

export function FloatingIsland({ quality }: FloatingIslandProps) {
  const model = useMemo(() => getIslandModel(), [])

  return (
    <group position={[-model.centroid[0], 0, -model.centroid[1]]}>
      <Terrain model={model} quality={quality} />
      <Cliffs model={model} />
      <IslandRim model={model} />
      <Water model={model} />
      <Waterfalls model={model} />
      <Forest model={model} quality={quality} />
      <Landmarks model={model} />
      <Windmills model={model} />
    </group>
  )
}
