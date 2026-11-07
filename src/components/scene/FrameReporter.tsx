'use client'

import { useFrame } from '@react-three/fiber'
import { reportRenderedFrame } from '@/lib/three/loading-progress'

export function FrameReporter() {
  useFrame((_, delta) => reportRenderedFrame(delta))
  return null
}
