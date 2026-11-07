'use client'

import { useMemo } from 'react'
import { InstancedModel } from '@/components/scene/island/InstancedModel'
import type { ModelInstance } from '@/components/scene/island/InstancedModel'
import { layoutCliffChunks, riverExitChunks } from '@/lib/island/cliff-layout'
import { RIM_HEIGHT } from '@/lib/island/island-model'
import type { IslandModel } from '@/lib/island/island-model'
import type { Quality } from '@/store/game-store'

const VARIANTS = ['cliff-a', 'cliff-b', 'cliff-c']
const CHUNK_WIDTH = 1.25
const CHUNK_DEPTH = 3.6
const CHUNK_TOP = RIM_HEIGHT - 0.07
const INSET = 0.3

const UNDERSIDE_OFFSETS: [number, number, number, number][] = [
  [0, 0, 15, 0],
  [-1.5, -4.5, 11, 1.4],
  [1.8, 4.2, 11, 2.6],
]

type RockyRimProps = {
  model: IslandModel
  quality: Quality
}

export function RockyRim({ model, quality }: RockyRimProps) {
  const layout = useMemo(() => {
    const chunks = layoutCliffChunks(model, quality === 'high' ? 0.75 : 1.05, VARIANTS.length)
    const byVariant = VARIANTS.map((_, variant) =>
      chunks
        .filter((chunk) => chunk.variant === variant)
        .map<ModelInstance>((chunk) => {
          const width = CHUNK_WIDTH * chunk.widthJitter
          const depth = CHUNK_DEPTH * chunk.depthJitter
          return {
            position: [
              chunk.point[0] - chunk.outward[0] * INSET,
              CHUNK_TOP - depth,
              chunk.point[1] - chunk.outward[1] * INSET,
            ],
            rotation: chunk.rotation,
            scale: [width, depth, width],
          }
        }),
    )
    const waterfalls = riverExitChunks(model).map<ModelInstance>((exit) => ({
      position: [
        exit.point[0] - exit.outward[0] * INSET,
        CHUNK_TOP - CHUNK_DEPTH,
        exit.point[1] - exit.outward[1] * INSET,
      ],
      rotation: Math.atan2(exit.outward[0], exit.outward[1]),
      scale: [CHUNK_WIDTH, CHUNK_DEPTH, CHUNK_WIDTH],
    }))
    const undersides = UNDERSIDE_OFFSETS.map<ModelInstance>(([dx, dz, width, rotation]) => ({
      position: [model.centroid[0] + dx, RIM_HEIGHT - 1.2 - width * 0.75, model.centroid[1] + dz],
      rotation,
      scale: [width, width * 0.75, width * 1.1],
    }))
    return { byVariant, waterfalls, undersides }
  }, [model, quality])

  return (
    <group>
      {VARIANTS.map((name, variant) => (
        <InstancedModel
          key={name}
          name={name}
          instances={layout.byVariant[variant]}
          castShadow={false}
        />
      ))}
      <InstancedModel name="cliff-waterfall" instances={layout.waterfalls} castShadow={false} />
      <InstancedModel name="island-underside" instances={layout.undersides} castShadow={false} />
    </group>
  )
}
