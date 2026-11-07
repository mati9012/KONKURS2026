'use client'

import { useLayoutEffect, useRef } from 'react'
import { Object3D } from 'three'
import type { InstancedMesh } from 'three'
import { useModelAsset } from '@/components/scene/useModelAsset'

export type ModelInstance = {
  position: [number, number, number]
  rotation: number
  scale: [number, number, number] | number
}

type InstancedModelProps = {
  name: string
  instances: ModelInstance[]
  baseCut?: number
  castShadow?: boolean
}

export function InstancedModel({
  name,
  instances,
  baseCut = 0,
  castShadow = true,
}: InstancedModelProps) {
  const asset = useModelAsset(name, baseCut)
  const meshRef = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const dummy = new Object3D()
    instances.forEach((instance, index) => {
      dummy.position.set(...instance.position)
      dummy.rotation.set(0, instance.rotation, 0)
      if (typeof instance.scale === 'number') dummy.scale.setScalar(instance.scale)
      else dummy.scale.set(...instance.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [instances])

  if (instances.length === 0) return null

  return (
    <instancedMesh
      key={instances.length}
      ref={meshRef}
      args={[asset.geometry, asset.material, instances.length]}
      castShadow={castShadow}
      receiveShadow
    />
  )
}
