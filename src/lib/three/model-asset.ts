import { Box3, Mesh } from 'three'
import type { BufferGeometry, Material, Object3D } from 'three'

export type ModelAsset = {
  geometry: BufferGeometry
  material: Material
  bounds: Box3
}

export function modelUrl(name: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/models/${name}.glb`
}

export function extractModelAsset(scene: Object3D): ModelAsset {
  scene.updateMatrixWorld(true)
  let found: Mesh | undefined
  scene.traverse((child) => {
    if (!found && child instanceof Mesh) found = child
  })
  if (!found) throw new Error('Model nie zawiera siatki')
  const geometry = found.geometry.clone().applyMatrix4(found.matrixWorld)
  geometry.computeBoundingBox()
  const material = Array.isArray(found.material) ? found.material[0] : found.material
  return { geometry, material, bounds: geometry.boundingBox?.clone() ?? new Box3() }
}
