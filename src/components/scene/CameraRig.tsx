'use client'

import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { ComponentRef } from 'react'
import { Box3, Vector3 } from 'three'
import { useJourneyStore } from '@/store/journey-store'

const FOCUS_OFFSET = new Vector3(0, 7.5, 11)
const FOCUS_LEAD = 2.2
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
  const focus = useJourneyStore((state) => state.focus)
  const framed = useRef(false)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    controls.setBoundary(TARGET_BOUNDS)
    const smooth = framed.current
    framed.current = true
    if (focus) {
      const [x, y, z] = focus
      void controls.setLookAt(
        x + FOCUS_OFFSET.x,
        y + FOCUS_OFFSET.y,
        z + FOCUS_OFFSET.z + FOCUS_LEAD,
        x,
        y,
        z + FOCUS_LEAD,
        true,
      )
      return
    }
    void controls.setLookAt(0, distance * 0.6, distance * 0.8, 0, -3.2, 0.8, smooth)
  }, [distance, focus])

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
