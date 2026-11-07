'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, Object3D } from 'three'
import type { InstancedMesh } from 'three'
import type { IslandModel } from '@/lib/island/island-model'
import { scatterTrees } from '@/lib/island/scatter'
import type { TreeInstance, TreeKind } from '@/lib/island/scatter'
import type { Quality } from '@/store/game-store'

const FOLIAGE_COLORS: Record<TreeKind, Color[]> = {
  conifer: ['#2f6b3a', '#3d7d3f', '#28603a', '#477f3a'].map((hex) => new Color(hex)),
  broadleaf: ['#5fa83c', '#78b843', '#4f9a3a', '#8cc152', '#c9a640'].map((hex) => new Color(hex)),
}

const TRUNK_COLOR = '#6b4423'

type TreeLayerProps = {
  trees: TreeInstance[]
  kind: TreeKind
}

function TreeLayer({ trees, kind }: TreeLayerProps) {
  const foliageRef = useRef<InstancedMesh>(null)
  const trunkRef = useRef<InstancedMesh>(null)
  const layer = useMemo(() => trees.filter((tree) => tree.kind === kind), [trees, kind])

  useLayoutEffect(() => {
    const foliage = foliageRef.current
    const trunks = trunkRef.current
    if (!foliage || !trunks) return
    const dummy = new Object3D()
    const palette = FOLIAGE_COLORS[kind]
    layer.forEach((tree, index) => {
      const [x, y, z] = tree.position
      dummy.position.set(x, y + 0.05 * tree.scale, z)
      dummy.rotation.set(0, tree.rotation, 0)
      dummy.scale.setScalar(tree.scale)
      dummy.updateMatrix()
      trunks.setMatrixAt(index, dummy.matrix)
      dummy.position.set(x, y + (kind === 'conifer' ? 0.2 : 0.17) * tree.scale, z)
      dummy.updateMatrix()
      foliage.setMatrixAt(index, dummy.matrix)
      const colorIndex = Math.floor(tree.shade * palette.length) % palette.length
      foliage.setColorAt(index, palette[colorIndex])
    })
    foliage.instanceMatrix.needsUpdate = true
    trunks.instanceMatrix.needsUpdate = true
    if (foliage.instanceColor) foliage.instanceColor.needsUpdate = true
    foliage.computeBoundingSphere()
    trunks.computeBoundingSphere()
  }, [layer, kind])

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, layer.length]} castShadow>
        <cylinderGeometry args={[0.012, 0.018, 0.1, 5]} />
        <meshStandardMaterial color={TRUNK_COLOR} flatShading />
      </instancedMesh>
      <instancedMesh
        ref={foliageRef}
        args={[undefined, undefined, layer.length]}
        castShadow
        receiveShadow
      >
        {kind === 'conifer' ? (
          <coneGeometry args={[0.075, 0.26, 6]} />
        ) : (
          <icosahedronGeometry args={[0.085, 0]} />
        )}
        <meshStandardMaterial flatShading roughness={0.9} />
      </instancedMesh>
    </group>
  )
}

type ForestProps = {
  model: IslandModel
  quality: Quality
}

export function Forest({ model, quality }: ForestProps) {
  const trees = useMemo(
    () => scatterTrees(model, quality === 'high' ? 4200 : 1600),
    [model, quality],
  )

  return (
    <group>
      <TreeLayer key={`conifer-${trees.length}`} trees={trees} kind="conifer" />
      <TreeLayer key={`broadleaf-${trees.length}`} trees={trees} kind="broadleaf" />
    </group>
  )
}
