'use client'

import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { modelUrl } from '@/lib/three/model-asset'
import { prepareIsland } from '@/lib/three/island-scene'
import type { Quality } from '@/store/game-store'

export function useIsland(quality: Quality) {
  const { scene } = useGLTF(modelUrl(quality === 'high' ? 'island' : 'island-low'))
  const island = useMemo(() => prepareIsland(scene), [scene])
  useEffect(() => () => island.water.dispose(), [island])
  return island
}
