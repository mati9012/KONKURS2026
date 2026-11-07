'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { SceneErrorBoundary } from '@/components/scene/SceneErrorBoundary'
import { Hud } from '@/components/ui/Hud'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { useGameStore } from '@/store/game-store'

const IslandScene = dynamic(
  () => import('@/components/scene/IslandScene').then((mod) => mod.IslandScene),
  { ssr: false },
)

export function GameShell() {
  useEffect(() => {
    void useGameStore.persist.rehydrate()
  }, [])

  return (
    <main className="relative h-dvh w-full">
      <SceneErrorBoundary>
        <IslandScene />
      </SceneErrorBoundary>
      <Hud />
      <LoadingScreen />
    </main>
  )
}
