'use client'

import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { ComponentRef } from 'react'

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
    void controlsRef.current?.setLookAt(0, distance * 0.6, distance * 0.8, 0, -3.2, 0.8, false)
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
