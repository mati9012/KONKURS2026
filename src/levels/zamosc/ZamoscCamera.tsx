'use client'

import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { ComponentRef } from 'react'
import { Vector3 } from 'three'
import type { BuildingId } from '@/content/zamosc'
import type { ZamoscCity } from '@/levels/zamosc/useZamoscCity'

export type CityShot =
  { kind: 'overview' } | { kind: 'building'; id: BuildingId } | { kind: 'tower' }

const OVERVIEW_DIRECTION = new Vector3(0, 15, 16).normalize()
const OVERVIEW_DISTANCE = 22
const OVERVIEW_TARGET = new Vector3(0.6, 0, 0.6)
const WIDE_BUILDINGS: readonly BuildingId[] = ['fortress', 'grodzka']
const focus = new Vector3()

type ZamoscCameraProps = {
  city: ZamoscCity
  shot: CityShot
}

export function ZamoscCamera({ city, shot }: ZamoscCameraProps) {
  const controls = useRef<ComponentRef<typeof CameraControls>>(null)
  const aspect = useThree((state) => state.viewport.aspect)

  useEffect(() => {
    const camera = controls.current
    if (!camera) return
    if (
      shot.kind === 'overview' ||
      (shot.kind === 'building' && WIDE_BUILDINGS.includes(shot.id))
    ) {
      const distance = OVERVIEW_DISTANCE * Math.max(1, 1.2 / aspect)
      const { x, y, z } = OVERVIEW_DIRECTION.clone().multiplyScalar(distance).add(OVERVIEW_TARGET)
      void camera.setLookAt(x, y, z, OVERVIEW_TARGET.x, OVERVIEW_TARGET.y, OVERVIEW_TARGET.z, true)
      return
    }
    if (shot.kind === 'tower') {
      city.trumpeter.getWorldPosition(focus)
      void camera.setLookAt(
        focus.x + 2.8,
        focus.y + 0.4,
        focus.z + 4,
        focus.x,
        focus.y - 0.7,
        focus.z,
        true,
      )
      return
    }
    city.buildings[shot.id].getWorldPosition(focus)
    void camera.setLookAt(
      focus.x + 1.2,
      focus.y + 4.2,
      focus.z + 6.4,
      focus.x,
      focus.y + 0.6,
      focus.z,
      true,
    )
  }, [city, shot, aspect])

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={2.5}
      maxDistance={60}
      maxPolarAngle={Math.PI / 2.25}
      smoothTime={0.6}
    />
  )
}
