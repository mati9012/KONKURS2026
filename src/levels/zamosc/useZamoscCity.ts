'use client'

import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import { Mesh } from 'three'
import type { Object3D, Vector3 } from 'three'
import { BUILDING_IDS } from '@/content/zamosc'
import type { BuildingId } from '@/content/zamosc'
import { modelUrl } from '@/lib/three/model-asset'

export const ZAMOSC_CITY_MODEL = modelUrl('zamosc-city')

export type CitySocket = {
  id: BuildingId
  position: Vector3
  radius: number
}

export type ZamoscCity = {
  scene: Object3D
  buildings: Record<BuildingId, Object3D>
  sockets: CitySocket[]
  trumpeter: Object3D
}

function requireNode(scene: Object3D, name: string) {
  const node = scene.getObjectByName(name)
  if (!node) throw new Error(`Makieta Zamościa nie ma węzła ${name}`)
  return node
}

export function useZamoscCity(): ZamoscCity {
  const { scene } = useGLTF(ZAMOSC_CITY_MODEL)

  return useMemo(() => {
    scene.traverse((node) => {
      if (!(node instanceof Mesh)) return
      node.castShadow = node.name !== 'ground'
      node.receiveShadow = true
    })
    const buildings = Object.fromEntries(
      BUILDING_IDS.map((id) => [id, requireNode(scene, `building-${id}`)]),
    ) as Record<BuildingId, Object3D>
    const sockets = BUILDING_IDS.map((id) => {
      const node = requireNode(scene, `socket-${id}`)
      return { id, position: node.position.clone(), radius: Number(node.userData.radius ?? 1) }
    })
    return { scene, buildings, sockets, trumpeter: requireNode(scene, 'trumpeter') }
  }, [scene])
}

useGLTF.preload(ZAMOSC_CITY_MODEL)
