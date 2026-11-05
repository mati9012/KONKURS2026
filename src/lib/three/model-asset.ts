import { Box3, BufferAttribute, Mesh } from 'three'
import type { BufferGeometry, Material, Object3D } from 'three'

export type ModelAsset = {
  geometry: BufferGeometry
  material: Material
  bounds: Box3
}

export function modelUrl(name: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/models/${name}.glb`
}

function stripBase(geometry: BufferGeometry, cutHeight: number) {
  const index = geometry.getIndex()
  const position = geometry.getAttribute('position')
  if (!index) return geometry
  const kept: number[] = []
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i)
    const b = index.getX(i + 1)
    const c = index.getX(i + 2)
    const highest = Math.max(position.getY(a), position.getY(b), position.getY(c))
    if (highest >= cutHeight) kept.push(a, b, c)
  }
  const IndexArray = position.count > 65535 ? Uint32Array : Uint16Array
  geometry.setIndex(new BufferAttribute(new IndexArray(kept), 1))
  return geometry
}

export function extractModelAsset(scene: Object3D, baseCut = 0): ModelAsset {
  scene.updateMatrixWorld(true)
  let found: Mesh | undefined
  scene.traverse((child) => {
    if (!found && child instanceof Mesh) found = child
  })
  if (!found) throw new Error('Model nie zawiera siatki')
  const geometry = found.geometry.clone().applyMatrix4(found.matrixWorld)
  geometry.computeBoundingBox()
  const box = geometry.boundingBox ?? new Box3()
  if (baseCut > 0) stripBase(geometry, box.min.y + (box.max.y - box.min.y) * baseCut)
  geometry.computeBoundingBox()
  const material = Array.isArray(found.material) ? found.material[0] : found.material
  return { geometry, material, bounds: geometry.boundingBox?.clone() ?? box }
}
