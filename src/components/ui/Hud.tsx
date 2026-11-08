'use client'

import { motion } from 'motion/react'
import { PLACES } from '@/content/places'
import { useGameStore } from '@/store/game-store'
import { useJourneyStore } from '@/store/journey-store'

export function Hud() {
  const stampCount = useGameStore(
    (state) => PLACES.filter((place) => state.stamps[place.id]).length,
  )
  const showPassport = useJourneyStore((state) => state.showPassport)

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]"
    >
      <h1 className="rounded-full bg-black/40 px-3 py-1 text-lg font-extrabold tracking-tight sm:text-2xl">
        Czarcia Łapa
      </h1>
      <button
        type="button"
        aria-label="Otwórz Paszport Lubelski"
        className="pointer-events-auto rounded-full border-2 border-[#b8894f] bg-[#f6e7c8] px-4 py-1.5 font-display text-sm font-bold text-[#4a2f1a] shadow-[0_4px_12px_rgba(60,30,10,0.35)] hover:bg-[#fff1d6]"
        onClick={() => showPassport(true)}
      >
        Paszport · Pieczęcie: {stampCount}/{PLACES.length}
      </button>
    </motion.header>
  )
}
