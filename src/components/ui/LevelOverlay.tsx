'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { CURTAIN_CLOSE_MS } from '@/components/ui/CloudCurtain'
import { CoveringClouds } from '@/components/ui/CoveringClouds'
import { NarratorConversation } from '@/components/ui/NarratorConversation'
import { PlaceStamp } from '@/components/ui/PlaceStamp'
import { CLOSED_PLACE, COMING_SOON } from '@/content/journey'
import { PLACES } from '@/content/places'
import type { PlaceId } from '@/content/places'
import { LEVELS } from '@/levels/registry'
import type { LevelDefinition } from '@/levels/level-game'
import { placeAccess, stampedPlaces } from '@/lib/journey'
import { useGameStore } from '@/store/game-store'
import { useJourneyStore } from '@/store/journey-store'

function placeName(placeId: PlaceId) {
  return PLACES.find((place) => place.id === placeId)?.name ?? placeId
}

function PlayBoard({ level, onComplete }: { level: LevelDefinition; onComplete: () => void }) {
  const leave = useJourneyStore((state) => state.leave)
  const [covered, setCovered] = useState(false)
  const { Game } = level

  useEffect(() => {
    const timer = setTimeout(() => setCovered(true), CURTAIN_CLOSE_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section role="region" aria-label="Zadanie" className="pointer-events-auto absolute inset-0">
      {covered ? <Game onComplete={onComplete} /> : <CoveringClouds closeFromAway />}
      <button
        type="button"
        className="absolute top-3 right-3 z-30 rounded-full border-2 border-[#b8894f] bg-[#f6e7c8] px-4 py-1.5 font-display text-sm font-bold text-[#4a2f1a] shadow-[0_4px_12px_rgba(60,30,10,0.35)] hover:bg-[#fff1d6] sm:top-4 sm:right-4"
        onClick={leave}
      >
        Wróć na mapę
      </button>
    </section>
  )
}

function StampReveal({ placeId }: { placeId: PlaceId }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 top-[12%] flex justify-center"
      initial={{ opacity: 0, scale: 2.4, rotate: -24 }}
      animate={{ opacity: 1, scale: 1, rotate: -8 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.3 }}
    >
      <div className="rounded-full bg-[#f6e7c8]/90 p-2 shadow-[0_12px_40px_rgba(40,25,70,0.4)]">
        <PlaceStamp name={placeName(placeId)} earned className="size-36 sm:size-44" />
      </div>
    </motion.div>
  )
}

function Visit({ placeId }: { placeId: PlaceId }) {
  const phase = useJourneyStore((state) => state.phase)
  const play = useJourneyStore((state) => state.play)
  const finish = useJourneyStore((state) => state.finish)
  const leave = useJourneyStore((state) => state.leave)
  const showPassport = useJourneyStore((state) => state.showPassport)
  const stamps = useGameStore((state) => state.stamps)
  const earnStamp = useGameStore((state) => state.earnStamp)
  const access = useMemo(() => placeAccess(placeId, stampedPlaces(stamps)), [placeId, stamps])
  const level = LEVELS[placeId]

  useEffect(() => {
    if (phase === 'outro') earnStamp(placeId)
  }, [phase, placeId, earnStamp])

  if (phase === 'play' && level) return <PlayBoard level={level} onComplete={finish} />

  if (phase === 'outro' && level) {
    return (
      <>
        <StampReveal placeId={placeId} />
        <NarratorConversation
          key="outro"
          lines={level.outro}
          doneLabel="Otwórz paszport"
          onDone={() => {
            leave()
            showPassport(true)
          }}
        />
      </>
    )
  }

  if (access !== 'open') {
    return (
      <NarratorConversation
        key={access}
        lines={[CLOSED_PLACE[access]]}
        doneLabel="Wracam na mapę"
        onDone={leave}
      />
    )
  }

  if (!level) {
    return (
      <NarratorConversation
        key="soon"
        lines={[COMING_SOON]}
        doneLabel="Wracam na mapę"
        onDone={leave}
      />
    )
  }

  return (
    <NarratorConversation key="intro" lines={level.intro} doneLabel="Do dzieła!" onDone={play} />
  )
}

export function LevelOverlay() {
  const placeId = useJourneyStore((state) => state.placeId)

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <AnimatePresence mode="wait">
        {placeId && <Visit key={placeId} placeId={placeId} />}
      </AnimatePresence>
    </div>
  )
}
