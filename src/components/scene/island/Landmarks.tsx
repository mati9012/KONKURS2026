'use client'

import { useEffect, useMemo } from 'react'
import { PlaceLabel } from '@/components/scene/island/PlaceLabel'
import type { IslandModel } from '@/lib/island/island-model'
import { LANDMARK_BUILDERS } from '@/lib/landmarks'

type LandmarksProps = {
  model: IslandModel
}

export function Landmarks({ model }: LandmarksProps) {
  const landmarks = useMemo(
    () =>
      model.places.map((place) => {
        const geometry = LANDMARK_BUILDERS[place.id]()
        geometry.computeBoundingBox()
        const ground = model.heightAt(place.position[0], place.position[1])
        const top = (geometry.boundingBox?.max.y ?? 0.5) * place.scale
        return { place, geometry, ground, labelHeight: ground + top + 0.3 }
      }),
    [model],
  )

  useEffect(() => () => landmarks.forEach((landmark) => landmark.geometry.dispose()), [landmarks])

  return (
    <group>
      {landmarks.map(({ place, geometry, ground, labelHeight }) => (
        <group key={place.id}>
          <mesh
            geometry={geometry}
            position={[place.position[0], ground - 0.01, place.position[1]]}
            scale={place.scale}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial vertexColors flatShading roughness={0.8} />
          </mesh>
          <PlaceLabel
            name={place.name}
            major={place.id === 'lublin'}
            position={[place.position[0], labelHeight, place.position[1]]}
          />
        </group>
      ))}
    </group>
  )
}
