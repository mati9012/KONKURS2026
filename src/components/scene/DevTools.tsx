'use client'

import { StatsGl } from '@react-three/drei'

export function DevTools() {
  if (process.env.NODE_ENV !== 'development') return null
  return <StatsGl className="!fixed !inset-auto !right-2 !bottom-2 !w-auto" />
}
