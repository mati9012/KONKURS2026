'use client'

import { AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'
import { INTRO_DIALOGUE } from '@/content/intro'
import { NarratorConversation } from '@/components/ui/NarratorConversation'
import { useSceneReady } from '@/components/ui/useSceneReady'
import { useGameStore } from '@/store/game-store'

const CURTAIN_DELAY_MS = 2400

function useHydrated() {
  const [hydrated, setHydrated] = useState(() => useGameStore.persist.hasHydrated())
  useEffect(() => useGameStore.persist.onFinishHydration(() => setHydrated(true)), [])
  return hydrated
}

export function NarratorDialog() {
  const hydrated = useHydrated()
  const introSeen = useGameStore((state) => state.introSeen)
  const markIntroSeen = useGameStore((state) => state.markIntroSeen)
  const { ready } = useSceneReady()
  const [curtainOpen, setCurtainOpen] = useState(false)

  useEffect(() => {
    if (!ready) return
    const timer = setTimeout(() => setCurtainOpen(true), CURTAIN_DELAY_MS)
    return () => clearTimeout(timer)
  }, [ready])

  const show = hydrated && !introSeen && curtainOpen

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <AnimatePresence>
        {show && (
          <NarratorConversation
            lines={INTRO_DIALOGUE}
            doneLabel="Ruszamy!"
            onDone={markIntroSeen}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
