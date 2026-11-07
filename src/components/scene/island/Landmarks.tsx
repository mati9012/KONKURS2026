'use client'

import { useMemo } from 'react'
import { Vector3 } from 'three'
import { PlaceLabel } from '@/components/scene/island/PlaceLabel'
import { useModelAsset } from '@/components/scene/useModelAsset'
import { PLACES } from '@/content/places'
import type { IslandAnchor } from '@/lib/three/island-scene'

const BASE_SINK = 0.035

function Landmark({ anchor }: { anchor: IslandAnchor }) {
  const asset = useModelAsset(anchor.model)
  const place = PLACES.find((candidate) => candidate.id === anchor.id)
  const [x, y, z] = anchor.position
  const placement = useMemo(() => {
    const size = asset.bounds.getSize(new Vector3())
    const scale = anchor.width / Math.max(size.x, size.z)
    const ground = y - asset.bounds.min.y * scale - size.y * scale * BASE_SINK
    return { scale, ground, top: ground + asset.bounds.max.y * scale }
  }, [asset, anchor.width, y])

  return (
    <group>
      <mesh
        geometry={asset.geometry}
        material={asset.material}
        position={[x, placement.ground, z]}
        rotation={[0, anchor.rotation, 0]}
        scale={placement.scale}
        castShadow
        receiveShadow
      />
      {place && (
        <PlaceLabel
          name={place.name}
          major={place.id === 'lublin'}
          position={[x, placement.top + 0.3, z]}
        />
      )}
    </group>
  )
}

type LandmarksProps = {
  places: IslandAnchor[]
}

export function Landmarks({ places }: LandmarksProps) {
  return (
    <group>
      {places.map((anchor) => (
        <Landmark key={anchor.id} anchor={anchor} />
      ))}
    </group>
  )
}
