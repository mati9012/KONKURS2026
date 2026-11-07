'use client'

import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { ComponentRef } from 'react'

function framingFor(aspect: number) {
  if (aspect < 0.8) return 40
  if (aspect < 1.3) return 31
  return 22
}

export function CameraRig() {
  const controlsRef = useRef<ComponentRef<typeof CameraControls>>(null)
  const distance = useThree((state) => framingFor(state.viewport.aspect))

  useEffect(() => {
    void controlsRef.current?.setLookAt(0, distance * 0.72, distance * 0.7, 0, -0.5, 0.6, false)
  }, [distance])

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={6}
      maxDistance={48}
      maxPolarAngle={Math.PI / 2.15}
      dollySpeed={0.6}
    />
  )
}
