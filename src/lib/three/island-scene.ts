import { InstancedMesh, Mesh } from 'three'
import type { Material, Object3D, ShaderMaterial } from 'three'
import { createWaterMaterial } from '@/lib/three/water-material'

export type IslandAnchor = {
  id: string
  model: string
  position: [number, number, number]
  rotation: number
  width: number
}

export type PreparedIsland = {
  scene: Object3D
  water: ShaderMaterial
  places: IslandAnchor[]
  waterfalls: IslandAnchor[]
}

const FLAT_SURFACES = new Set(['terrain', 'water', 'roads', 'grass-lip', 'golden-rim'])

function castsShadow(mesh: Mesh) {
  const material = mesh.material as Material
  return !FLAT_SURFACES.has(mesh.name) && material.name !== 'foliage'
}

function toAnchor(node: Object3D, prefix: string): IslandAnchor {
  return {
    id: node.name.slice(prefix.length),
    model: typeof node.userData.model === 'string' ? node.userData.model : '',
    position: [node.position.x, node.position.y, node.position.z],
    rotation: node.rotation.y,
    width: Number(node.userData.width ?? 1),
  }
}

export function prepareIsland(scene: Object3D): PreparedIsland {
  const water = createWaterMaterial()
  const places: IslandAnchor[] = []
  const waterfalls: IslandAnchor[] = []
  scene.traverse((node) => {
    if (node.name.startsWith('place-')) places.push(toAnchor(node, 'place-'))
    if (node.name.startsWith('waterfall-')) waterfalls.push(toAnchor(node, 'waterfall-'))
    if (!(node instanceof Mesh)) return
    node.receiveShadow = true
    node.castShadow = castsShadow(node)
    if (node.name === 'water') node.material = water
    if (node instanceof InstancedMesh) node.frustumCulled = false
  })
  return { scene, water, places, waterfalls }
}
