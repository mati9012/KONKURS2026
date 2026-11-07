'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  getLoadingSnapshot,
  IDLE_LOADING,
  isSceneSettled,
  subscribeToLoading,
} from '@/lib/three/loading-progress'

const MIN_VISIBLE_MS = 1800

export function useSceneReady() {
  const { loaded, total } = useSyncExternalStore(
    subscribeToLoading,
    getLoadingSnapshot,
    () => IDLE_LOADING,
  )
  const settled = useSyncExternalStore(subscribeToLoading, isSceneSettled, () => false)
  const [shownLongEnough, setShownLongEnough] = useState(false)
  const [peak, setPeak] = useState(0)

  const fraction = total === 0 ? 0 : loaded / total
  if (fraction > peak) setPeak(fraction)

  useEffect(() => {
    const timer = setTimeout(() => setShownLongEnough(true), MIN_VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [])

  const ready = settled && shownLongEnough
  return { progress: ready ? 1 : Math.min(peak, 0.97), ready }
}
