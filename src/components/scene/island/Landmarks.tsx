'use client'

import { useMemo } from 'react'
import { Vector3 } from 'three'
import { PlaceLabel } from '@/components/scene/island/PlaceLabel'
import { useModelAsset } from '@/components/scene/useModelAsset'
import type { IslandModel, PlacedLandmark } from '@/lib/island/island-model'

const BASE_SINK = 0.035

type ModelPlacementProps = {
  model: IslandModel
  name: string
  x: number
  z: number
  width: number
  rotation: number
  label?: { name: string; major: boolean }
}

function ModelPlacement({ model, name, x, z, width, rotation, label }: ModelPlacementProps) {
  const asset = useModelAsset(name)
  const placement = useMemo(() => {
    const size = asset.bounds.getSize(new Vector3())
    const scale = width / Math.max(size.x, size.z)
    const ground = model.heightAt(x, z) - asset.bounds.min.y * scale - size.y * scale * BASE_SINK
    return { scale, ground, top: ground + asset.bounds.max.y * scale }
  }, [asset, model, x, z, width])

  return (
    <group>
      <mesh
        geometry={asset.geometry}
        material={asset.material}
        position={[x, placement.ground, z]}
        rotation={[0, rotation, 0]}
        scale={placement.scale}
        castShadow
        receiveShadow
      />
      {label && (
        <PlaceLabel name={label.name} major={label.major} position={[x, placement.top + 0.3, z]} />
      )}
    </group>
  )
}

function Landmark({ model, place }: { model: IslandModel; place: PlacedLandmark }) {
  const [x, z] = place.position
  const width = place.footprint * place.scale * 2
  return (
    <group>
      <ModelPlacement
        model={model}
        name={place.id}
        x={x}
        z={z}
        width={width}
        rotation={place.rotation ?? 0}
        label={{ name: place.name, major: place.id === 'lublin' }}
      />
      {place.extras?.map((extra) => (
        <ModelPlacement
          key={extra.model}
          model={model}
          name={extra.model}
          x={x + extra.offset[0]}
          z={z + extra.offset[1]}
          width={extra.size}
          rotation={place.rotation ?? 0}
        />
      ))}
    </group>
  )
}

type LandmarksProps = {
  model: IslandModel
}

export function Landmarks({ model }: LandmarksProps) {
  return (
    <group>
      {model.places.map((place) => (
        <Landmark key={place.id} model={model} place={place} />
      ))}
    </group>
  )
}
