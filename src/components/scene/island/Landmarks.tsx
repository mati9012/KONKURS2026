'use client'

import { useMemo } from 'react'
import { Vector3 } from 'three'
import { PlaceLabel } from '@/components/scene/island/PlaceLabel'
import { useModelAsset } from '@/components/scene/useModelAsset'
import { PLACES } from '@/content/places'
import type { Place } from '@/content/places'
import { placeAccess, stampedPlaces } from '@/lib/journey'
import type { IslandAnchor } from '@/lib/three/island-scene'
import { useGameStore } from '@/store/game-store'
import { useJourneyStore } from '@/store/journey-store'

const BASE_SINK = 0.035

function Label({ place, position }: { place: Place; position: [number, number, number] }) {
  const stamps = useGameStore((state) => state.stamps)
  const introSeen = useGameStore((state) => state.introSeen)
  const visiting = useJourneyStore((state) => state.placeId !== null)
  const visit = useJourneyStore((state) => state.visit)
  const access = placeAccess(place.id, stampedPlaces(stamps))
  const state = stamps[place.id] ? 'stamped' : access === 'open' ? 'open' : 'locked'

  if (visiting) return null

  return (
    <PlaceLabel
      name={place.name}
      major={place.id === 'lublin'}
      state={state}
      position={position}
      onSelect={introSeen ? () => visit(place.id, position) : undefined}
    />
  )
}

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
      {place && <Label place={place} position={[x, placement.top + 0.3, z]} />}
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
