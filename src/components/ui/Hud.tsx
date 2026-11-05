'use client'

import { motion } from 'motion/react'
import { LEVEL_IDS } from '@/content/levels'
import { useGameStore } from '@/store/game-store'

export function Hud() {
  const stampCount = useGameStore((state) => Object.keys(state.stamps).length)

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]"
    >
      <h1 className="text-lg font-extrabold tracking-tight sm:text-2xl">Czarcia Łapa</h1>
      <p className="rounded-full bg-black/40 px-3 py-1 text-sm font-bold">
        Pieczęcie: {stampCount}/{LEVEL_IDS.length}
      </p>
    </motion.header>
  )
}
