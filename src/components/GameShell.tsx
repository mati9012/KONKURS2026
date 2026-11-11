'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { SceneErrorBoundary } from '@/components/scene/SceneErrorBoundary'
import { Hud } from '@/components/ui/Hud'
import { LevelOverlay } from '@/components/ui/LevelOverlay'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { NarratorDialog } from '@/components/ui/NarratorDialog'
import { Passport } from '@/components/ui/Passport'
import { useGameStore } from '@/store/game-store'
import { useJourneyStore } from '@/store/journey-store'

const IslandScene = dynamic(
  () => import('@/components/scene/IslandScene').then((mod) => mod.IslandScene),
  { ssr: false },
)

export function GameShell() {
  useEffect(() => {
    void useGameStore.persist.rehydrate()
    void useJourneyStore.persist.rehydrate()
  }, [])

  return (
    <main className="relative h-dvh w-full">
      <SceneErrorBoundary>
        <IslandScene />
      </SceneErrorBoundary>
      <Hud />
      <LevelOverlay />
      <Passport />
      <NarratorDialog />
      <LoadingScreen />
    </main>
  )
}
