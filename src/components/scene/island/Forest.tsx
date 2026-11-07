'use client'

import { useMemo } from 'react'
import { InstancedModel } from '@/components/scene/island/InstancedModel'
import type { IslandModel } from '@/lib/island/island-model'
import { scatterTrees } from '@/lib/island/scatter'
import type { TreeKind } from '@/lib/island/scatter'
import type { Quality } from '@/store/game-store'

const TREE_HEIGHT: Record<TreeKind, number> = {
  pine: 0.42,
  oak: 0.36,
  birch: 0.4,
}

const KINDS: TreeKind[] = ['pine', 'oak', 'birch']

type ForestProps = {
  model: IslandModel
  quality: Quality
}

export function Forest({ model, quality }: ForestProps) {
  const layers = useMemo(() => {
    const trees = scatterTrees(model, quality === 'high' ? 2600 : 900)
    return KINDS.map((kind) => ({
      kind,
      instances: trees
        .filter((tree) => tree.kind === kind)
        .map((tree) => ({
          position: tree.position,
          rotation: tree.rotation,
          scale: TREE_HEIGHT[kind] * tree.scale,
        })),
    }))
  }, [model, quality])

  return (
    <group>
      {layers.map((layer) => (
        <InstancedModel
          key={layer.kind}
          name={layer.kind}
          instances={layer.instances}
          baseCut={0.06}
          castShadow={quality === 'high'}
        />
      ))}
    </group>
  )
}
