'use client'

import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { ComponentRef } from 'react'
import { Box3, Vector3 } from 'three'

const TARGET_BOUNDS = new Box3(new Vector3(-10, -3.5, -9), new Vector3(10, 1, 9))

function framingFor(aspect: number) {
  if (aspect < 0.6) return 58
  if (aspect < 0.8) return 42
  if (aspect < 1.2) return 34
  if (aspect < 1.5) return 30
  return 27
}

export function CameraRig() {
  const controlsRef = useRef<ComponentRef<typeof CameraControls>>(null)
  const distance = useThree((state) => framingFor(state.viewport.aspect))

  useEffect(() => {
    controlsRef.current?.setBoundary(TARGET_BOUNDS)
    void controlsRef.current?.setLookAt(0, distance * 0.6, distance * 0.8, 0, -3.2, 0.8, false)
  }, [distance])

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={13}
      maxDistance={48}
      maxPolarAngle={Math.PI / 2.8}
      dollySpeed={0.6}
      dollyToCursor
      boundaryFriction={0.2}
    />
  )
}
