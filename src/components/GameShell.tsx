'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { Hud } from '@/components/ui/Hud'
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
      <IslandScene />
      <Hud />
    </main>
  )
}
