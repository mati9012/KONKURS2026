'use client'

import { useFrame } from '@react-three/fiber'
import type { ShaderMaterial } from 'three'
import { Landmarks } from '@/components/scene/island/Landmarks'
import { useIsland } from '@/components/scene/island/useIsland'
import { Waterfalls } from '@/components/scene/island/Waterfalls'
import type { Quality } from '@/store/game-store'

function advanceWater(material: ShaderMaterial, time: number) {
  material.uniforms.time.value = time
}

type FloatingIslandProps = {
  quality: Quality
}

export function FloatingIsland({ quality }: FloatingIslandProps) {
  const island = useIsland(quality)

  useFrame(({ clock }) => {
    advanceWater(island.water, clock.elapsedTime)
  })

  return (
    <group>
      <primitive object={island.scene} />
      <Landmarks places={island.places} />
      <Waterfalls falls={island.waterfalls} />
    </group>
  )
}
