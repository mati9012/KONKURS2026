import { geoMercator } from 'd3-geo'
import type { GeoPermissibleObjects } from 'd3-geo'

export type ScenePoint = [x: number, z: number]

export function createSceneProjection(region: GeoPermissibleObjects, size: number) {
  const projection = geoMercator().fitSize([size, size], region)
  const half = size / 2

  return (longitude: number, latitude: number): ScenePoint => {
    const projected = projection([longitude, latitude])
    if (!projected) throw new Error(`Nie można zrzutować punktu ${longitude}, ${latitude}`)
    const [x, y] = projected
    return [x - half, y - half]
  }
}
